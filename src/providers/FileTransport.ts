import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
import { Events, App } from 'ionic-angular';
import { FileUploader } from './FileUploader';
import { FileDownloader } from './FileDownloader';
import { Util } from './Util';
import { Lang } from './Language';
import { Platform } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Md5 } from "ts-md5/dist/md5";

@Injectable()
export class FileTransport {
    taskUploadListAmount:number = 0;
    taskDownloadListAmount:number = 0;

    constructor(
        // private transfer: FileTransport,
        private events: Events,
        private http: HttpService,
        private global: GlobalService,
		private util: Util,
		private file: File,
        private fileUploader: FileUploader,
        public fileDownloader: FileDownloader,
        private platform: Platform,
    ) {
        this.events.unsubscribe('create:upload');
        events.subscribe('create:upload', (task) => {
            GlobalService.consoleLog("创建任务事件响应");
            var uploadTool:FileUploader = this.createUploadHandler(task);
            this.global.fileHandler[task.taskId] = uploadTool;
        });
        this.events.unsubscribe('create:download');
        events.subscribe('create:download', (task) => {
            GlobalService.consoleLog("创建下载任务事件响应");
            var downloadTool:FileDownloader = this.createDownloadHandler(task.localPath, task.path, task);
            this.global.fileHandler[task.taskId] = downloadTool;
        });
    };


    /**
     * [uploadSingleFile 单文件上传]
     * @param {[type]} localPath  [本地路径，包含文件名]
     * @param {[type]} remotePath [远程路径，不包含文件名]
     * @param {[type]} eventType  [description]
     */
    uploadSingleFile(localPath, remotePath, id = null) {
        GlobalService.consoleLog(`上传参数：localPath=${localPath},remotePath=${remotePath}`);
        localPath = localPath.replace(/\?\d+$/, '');
        remotePath = remotePath.replace(/\?\d+$/, '');
        let fileName = localPath.match(/([^\/^\?]+)(\?[^\?]+)?$/)[1] || "noname";
        // this.global.createGlobalToast(this, {
        //     message: Lang.Lf('WORD80e433b7', fileName),
        // });
            // filename = filename.replace(/\s+/g, ""); 
        // var fileId = "Upload_" + Md5.hashStr(localPath + remotePath + '/' + filename, false);
        var fileId = this.util.generateFileID(localPath, remotePath + '/' + fileName, 'upload', id);
        var task = this.global.fileTaskList.filter(item => item.fileId === fileId && item.finished === false);
        // var fullPath = remotePath + fileName;
        var taskId = 'Upload_' + Date.now();
        var newTask = this.global.fileTaskList.filter(item => item.fileId === fileId && item.finished === false);
        var currentTask;
        var pausing = 'paused';
        var fileTask = this.global.fileTaskList.filter(item => item.action == "upload" && item.pausing == 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash );
        this.taskUploadListAmount = fileTask.length;
        //已包含3个任务，任务不开启
        if(fileTask.length < this.global.fileMaxUpload){
            pausing = 'doing';
        }else{
            pausing = 'waiting';
        }

        // GlobalService.consoleLog('fullPath   ===  ' + fullPath);
        // GlobalService.consoleLog('localPath   ===  ' + localPath);

        if(newTask && newTask.length) {
            GlobalService.consoleLog("已包含任务，只更新taskId");
            // newTask[0].taskId = taskId;
            // newTask[0].pausing = pausing;
            // currentTask = newTask[0];
            if(pausing === 'doing') {            
                let taskId = newTask[0].taskId;
                newTask[0].pausing = pausing;
                this.global.fileHandler[taskId].resume();
            }
        } else {
            GlobalService.consoleLog(taskId + "任务不存在，创建新的任务");
            currentTask = {
                fileId: fileId,
                taskId: taskId,
                name: fileName,
                path: remotePath,
                localPath: localPath,
                speed: 0,
                total: 0,
                loaded: 0,
                pausing: pausing,
                action: 'upload',
                finished: false,
                fileStyle: this.util.computeFileType(fileName, 2),
                boxId: this.global.deviceSelected.boxId,
                bindUserHash: this.global.deviceSelected.bindUserHash,
                selected: false,
                finishedTime: ''
            };
            this.global.fileTaskList.push(currentTask); 
            var uploadTool = this.createUploadHandler(currentTask);
            this.global.fileHandler[taskId] = uploadTool;
        }
    }
    createUploadHandler(fileTask:any){
        var uploadTool;
        var taskId = fileTask.taskId;
        var fileHandler = this.global.fileHandler[taskId];
        var uploadUrl = this.global.getBoxApi('uploadFileBreaking');

        if(!fileHandler){
            GlobalService.consoleLog('创建新的FileUploader')
            uploadTool = this.fileUploader.createUploader(fileTask, uploadUrl);
        }else{
            GlobalService.consoleLog('使用已有FileUploader')
            uploadTool = this.global.fileHandler[taskId];
        }

        GlobalService.consoleLog("创建上传任务:" + fileTask.name);
        uploadTool.upload(fileTask, uploadUrl)
        .catch(err => {
            GlobalService.consoleLog("上传失败:" + err.stack);
        })
        if(this.taskUploadListAmount >= this.global.fileMaxUpload){
            GlobalService.consoleLog('先加入队列，且先暂停，后面再上传');
            uploadTool.pause();
        }
        
        this.fileUploader.onProgress(fileTask.fileId, (res) => {
            GlobalService.consoleLog("Onprogress进度更新");
            GlobalService.consoleLog("进度信息：" + JSON.stringify(res));
            let task = this.global.fileTaskList.find(item => item.taskId === taskId);
            if(!task) {
                GlobalService.consoleLog("任务不存在，直接退出")
                return false;
            }
            if(res.status === 'ERROR') {
                task.pausing = 'paused';
                uploadTool.pause();                
                return uploadTool;
            }

            if(!this.global.networking) {
                task.pausing = 'waiting';
                uploadTool.pause();                
                return uploadTool;
            }
            if(task.pausing == 'paused' ) {
                GlobalService.consoleLog("文件上传已暂停，不接收进度更新");
                return false;
            }
            task.loaded = res.uploadSize;
            task.total = res.totalSize;
            task.speed = res.speed;
            GlobalService.consoleLog("更新进度信息:" + res.uploadSize);
            if(task.loaded === task.total) {
                GlobalService.consoleLog("上传完成！更新finish状态并发射file:updated事件");
                task.finished = true;    
                task.finishedTime =  new Date().getTime();                   

                let taskId = task.taskId;   
                //如果没有同类型文件人物，则弹窗.....
                // if(!this.global.fileTaskList.some(item => item.action === 'upload' && !item.finished)) {
                //     //通知任务列表页刷新            
                //     this.global.createGlobalToast(this, {
                //         message: Lang.Lf('UploadFileSuccess')
                //     })                    
                // }

                if(this.global.fileHandler[taskId]) {
                    delete this.global.fileHandler[taskId];
                }
                this.fileUploader.clearUploaderTask(task.fileId);
                this.events.publish('file:updated', task); 
                //查找等待中的任务，每完成一个自动通知新任务
                this.startWaitTask('upload');
            }
            return true;   
        })

        this.fileUploader.onFailure(fileTask.fileId, (res) => {
            GlobalService.consoleLog("上传失败, onFailure");
            this.events.publish("upload:failure", fileTask);
            this.startWaitTask('upload');

        })
        return uploadTool;
	}

    /**
     * [getFileLocalOrRemote 获取文件，若本地存在则使用本地，否则通过远程下载]
     * @param {[type]} remoteUrl [远程文件夹路径，不包含文件名]
     * @param {[type]} localPath [本地文件夹路径，不包含文件名]
     */
    getFileLocalOrRemote(remoteUrl, localPath, name, fileSubPath) {
        remoteUrl = remoteUrl.replace(/\/$/, '') + "/";
        localPath = localPath.replace(/\/$/, '') + "/";
        //第1步，判断本地是否存在，若存在则直接使用
        return this.file.checkFile(localPath, name)
        .then(res => {
            GlobalService.consoleLog("目标文件存在:" + name);
            //文件已存在
            return localPath + name;
        }, res => {
            GlobalService.consoleLog("目标文件不存在:" + name);
            //文件不存在，尝试远程下载
            return this.downloadRemoteFile(remoteUrl, localPath, name, fileSubPath)
            .then(res => {
                if(res) {
                    //下载成功，直接返回本地路径
                    return localPath + name;
                } else {
                    return "";
                }
            })
            .then(res => {
                return this.file.checkFile(localPath, name)
                .then(res => {
                    return localPath + name;
                })
                .catch(e => {
                    return "";
                })
            })
            .catch(e => {
                return "";
            })
        })
    }	
    getThumbnail(list, isHasPath, currPath = '') {
        //获取最新拉取的一页的缩略图
        let noThumbnailList = list.filter(item => {
            let type = this.util.computeFileType(item.name);
            return !item.thumbnail && (type === 'image');
        });

        let downloading = {};
        let downloadIthThumbnail = (i)=>{
            //检查本地是否存在,删除后面的重命名时添加的(2)
            let md5;
            if(isHasPath) {
                md5 = Md5.hashStr(noThumbnailList[i].path + "/" + noThumbnailList[i].name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
            } else {
                md5 = Md5.hashStr(currPath + "/" + noThumbnailList[i].name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
            }
            let thumbnailName = md5 + ".png";
            let localThumbnailPath = this.global.fileSavePath + this.global.ThumbnailSubPath + "/";
            let localThumbnailFullPath = localThumbnailPath + thumbnailName;
            let logprefix = "缩略图下载：("+thumbnailName+")：";
            GlobalService.consoleLog(logprefix + "开始下载");
            GlobalService.consoleLog(logprefix + "本地路径尝试：" + localThumbnailPath + thumbnailName);
            return this.getFileLocalOrRemote(this.global.ThumbnailRemotePath + "/", localThumbnailPath, thumbnailName, this.global.ThumbnailSubPath)
                .then(res => {
                    if(res) {
                        GlobalService.consoleLog(logprefix + "数据获取完毕：" + JSON.stringify(res));
                        noThumbnailList[i].thumbnail = res;
                        this.global.thumbnailMap[md5] = res;
                    } else {
                        GlobalService.consoleLog(logprefix + "缩略图不存在，获取原图");
                        return this.getFileLocalOrRemote(noThumbnailList[i].path, this.global.fileSavePath + this.global.PhotoSubPath + "/", noThumbnailList[i].name, this.global.PhotoSubPath)
                            .then(res => {
                                GlobalService.consoleLog(logprefix + "数据原图获取完毕：" + JSON.stringify(res));
                                noThumbnailList[i].thumbnail = res;
                                this.global.thumbnailMap[md5] = res;
                            })
                    }
                })
                .catch(e => {
                    GlobalService.consoleLog(logprefix + "下载异常....");
                }).then(()=>{
                    GlobalService.consoleLog(logprefix + "下载结束[" + i + "]");
                    delete downloading[i];
                })
        };

        let lastindex = 0;
        let donecount = 0;
        let totalcount= noThumbnailList.length;
        let looptimer = setInterval(()=> {
            let doingcount= Object.keys(downloading).length;
            if ( donecount + doingcount < totalcount && doingcount < 5) {
                downloading[lastindex] = 1;
                downloadIthThumbnail(lastindex++)
                    .then(()=>{
                        donecount++
                    });
            }
            if (donecount >= totalcount){
                clearInterval(looptimer)
            }
        }, 100);

        // for(let i = 0, len = noThumbnailList.length; i < len; i++) {
        //
        //     setTimeout(()=>{
        //         //检查本地是否存在,删除后面的重命名时添加的(2)
        //         let md5;
        //         if(isHasPath) {
        //             md5 = Md5.hashStr(noThumbnailList[i].path + "/" + noThumbnailList[i].name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
        //         } else {
        //             md5 = Md5.hashStr(currPath + "/" + noThumbnailList[i].name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
        //         }
        //         let thumbnailName = md5 + ".png";
        //         let localThumbnailPath = this.global.fileSavePath + this.global.ThumbnailSubPath + "/";
        //         let localThumbnailFullPath = localThumbnailPath + thumbnailName;
        //         // GlobalService.consoleLog("缩略图名字的远程路径：" + this.currPath + "---" + noThumbnailList[i].name);
        //         GlobalService.consoleLog("本地路径尝试：" + localThumbnailPath + thumbnailName);
        //         this.http.getFileLocalOrRemote(this.global.ThumbnailRemotePath + "/", localThumbnailPath, thumbnailName, this.global.ThumbnailSubPath)
        //         .then(res => {
        //             if(res) {
        //                 GlobalService.consoleLog("数据获取完毕：" + JSON.stringify(res));
        //                 noThumbnailList[i].thumbnail = res;
        //                 this.global.thumbnailMap[md5] = res;
        //             } else {
        //                 //缩略图不存在，获取原图
        //                 this.http.getFileLocalOrRemote(noThumbnailList[i].path, this.global.fileSavePath + this.global.PhotoSubPath + "/", noThumbnailList[i].name, this.global.PhotoSubPath)
        //                 .then(res => {
        //                     GlobalService.consoleLog("数据原图获取完毕：" + JSON.stringify(res));
        //                     noThumbnailList[i].thumbnail = res;
        //                     this.global.thumbnailMap[md5] = res;
        //                 })
        //             }
        //         })
        //         .catch(e => {
        //             GlobalService.consoleLog("下载异常....");
        //         })
        //     }, i * 100);
        // }
    }
    /**
     * [downloadRemoteFile 从服务器上下载文件]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     */
    downloadRemoteFile(remoteUrl, localPath, name, fileSubPath) {
        return this.downloadBackground(remoteUrl + name, localPath + name)
        .catch(e => {
            //文件夹不存在
            GlobalService.consoleLog("写文件失败，创建文件夹");
            return this.file.createDir(this.global.fileSavePath, fileSubPath, false)
            .then((res: any) => {
                //创建文件夹成功..
                GlobalService.consoleLog("创建文件夹成功，重新写文件");
				return this.downloadBackground(remoteUrl + name, localPath + name)
            })
            .catch(e => {
                GlobalService.consoleLog("文件夹已存在，直接写文件");
                //文件夹正在创建...
				return this.downloadBackground(remoteUrl + name, localPath + name)
            })
        })
    }

	downloadBackground(remotePath, localPath) {
		console.log(`远端路径:${remotePath},本地路径：${localPath}`);
		return new Promise((resolve, reject) => {
			var downloadTool;
			let fileId = this.util.generateFileID(localPath, remotePath, 'download');
	
			downloadTool = this.fileDownloader.createDownloader(localPath, remotePath);
			downloadTool.download(localPath, remotePath)
			.catch(err => {
				console.log("download进入catch");
				reject();
			})	
			this.fileDownloader.onProgress(fileId, (res) => {
				GlobalService.consoleLog("进度信息：" + JSON.stringify(res));
				if(res.downloadsize == res.totalsize && res.totalsize > 0) {
					resolve(localPath);
				}
			})
	
			this.fileDownloader.onFailure(fileId, (res) => {
				GlobalService.consoleLog("下载失败, onFailure");
				reject();
			})    			
		})
	}

    //download
    downloadFile(file, currPath) {
        GlobalService.consoleLog("文件名字：" + file.name);
        var localPath = this.global.fileSavePath + file.name;
        GlobalService.consoleLog("下载文件到本地:" + localPath);
        // this.global.createGlobalToast(this, {
        //     message: Lang.Lf('StartDownloadFile', file.name),
        // });
        // var fullPath = currPath.replace(/\/$/g, '') + "/" + encodeURIComponent(file.name);
        var fullPath = currPath.replace(/\/$/g, '') + "/" + file.name;
        // var uri = encodeURI(this.global.getBoxApi("downloadFile"));
        var fileId = this.util.generateFileID(localPath, fullPath, 'download');

        var taskId = 'Download_' + Date.now();
        var pausing = 'paused';
        var taskList = this.global.fileTaskList.filter(item => item.action === 'download' && item.pausing === 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash );
        // this.tasklistlen = tasklist.length;
        this.taskUploadListAmount = taskList.length;

        if(taskList.length < this.global.fileMaxDownload){
            pausing = 'doing';
        }else{
            pausing = 'waiting';
        }

		let fileTask = this.global.fileTaskList.filter(item => item.fileId === fileId && item.finished === false);
		if(fileTask.length && this.global.fileHandler[fileTask[0].taskId]) {
			if(pausing === 'doing') {            
				let taskId = fileTask[0].taskId;
				fileTask[0].pausing = pausing;
				this.global.fileHandler[taskId].resume();
			}
		} else {
			let task = {
				fileId: fileId,
				taskId: taskId,
				name: file.name,
				path: fullPath,
				localPath: localPath,
				fileStyle: file.style,
				total: file.size,
				pausing: pausing,
				loaded: 0,
				speed: 0,
				action: 'download',
				finished: false,
				boxId: this.global.deviceSelected.boxId,
				bindUserHash: this.global.deviceSelected.bindUserHash,
				selected:false,
				finishedTime:''
			}     
			//创建文件下载，需添加至文件列表
			this.global.fileTaskList.push(task);
			GlobalService.consoleLog("新加的文件列表"+JSON.stringify(this.global.fileTaskList));
			
			var downloadTool = this.createDownloadHandler(localPath, fullPath, task);
			this.global.fileHandler[taskId] = downloadTool;                   
		}	
		this.events.publish('task:created');			
    }

    // generateFileID(desturi, sourceurl) {
    //     return Md5.hashStr(desturi + sourceurl, false) + "";
    // }

    createDownloadHandler(localPath, fullPath, task) {
        // var uri = encodeURI(this.global.getBoxApi("downloadFile"));
        // var downloadTool = new FileDownloader();
        /*code start*/
        var downloadTool;
        let taskId = task.taskId;

        downloadTool = this.fileDownloader.createDownloader(localPath, fullPath);
        downloadTool.download(localPath, fullPath)
        .catch(err => {
            GlobalService.consoleLog("下载失败 FileTransport" + JSON.stringify(err));
            var task = this.global.fileTaskList.filter(item => item.taskId === taskId);
            if(task && task.length && task[0].isShow) {
                this.global.createGlobalToast(this, {
                    message: Lang.Lf("DownloadFileFailed", task[0].name)
                })                
            }
        })
        if(this.taskUploadListAmount >= this.global.fileMaxDownload){
            GlobalService.consoleLog('先加入队列，且先暂停，后面再下载');
            downloadTool.pause();
        }

        this.fileDownloader.onProgress(task.fileId, (res) => {
            GlobalService.consoleLog("进度信息：" + JSON.stringify(res));

            let myTask = this.global.fileTaskList.find(item => item.taskId === taskId);
            //更新任务进度
            if(myTask) {
                this.events.publish('download:progress:' + task.fileId, task);
                if(res.status === 'ERROR' || res.status === 'ABORT') {
                    GlobalService.consoleLog("任务已出错或者终止");
                    myTask.pausing = 'paused';
                    downloadTool.pause();
                    return downloadTool;
                }
                if(!this.global.networking) {
                    GlobalService.consoleLog("网络故障");
                    myTask.pausing = 'waiting';
                    downloadTool.pause();
                    return downloadTool;
                }
                GlobalService.consoleLog("更新任务进度");
                myTask.loaded = res.downloadsize;
                myTask.total = res.totalsize;
                myTask.speed = res.speed;
                if(myTask.loaded === myTask.total) {
                    GlobalService.consoleLog("下载完成！！");
                    myTask.finished = true;                   
                    myTask.finishedTime =  new Date().getTime();                   
                    let taskId =  myTask.taskId;
                    // if(!this.global.fileTaskList.some(item => item.action === 'download' && !item.finished )) {
                    //     this.global.createGlobalToast(this, {
                    //         message: Lang.Lf('DownloadFileToBoxSuccess', myTask.name)
                    //     })                           
                    // }
                    if(this.global.fileHandler[taskId]) {
                        delete this.global.fileHandler[taskId];
                    }
                    this.events.publish('file:updated', myTask); 
                    this.startWaitTask('download');
                }
            }    
            return true;   
        })

        this.fileDownloader.onFailure(task.fileId, (res) => {
            GlobalService.consoleLog("下载失败, onFailure");
            this.events.publish("download:failure", task);
            this.startWaitTask('download');
        })            

        return downloadTool;
    }

    startWaitTask(action){
        let continueTaskList = this.global.fileTaskList.filter(item => item.action == action && item.pausing == 'waiting' && item.finished == false&&item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash );
        if(continueTaskList.length > 0){
            let newTask = continueTaskList[0];
            newTask.pausing = 'doing';
            if(this.global.fileHandler[newTask.taskId]) {
                this.global.fileHandler[newTask.taskId].resume();  
            } else {
                
                this.events.publish('create:'+action, newTask);
            }
        } 
    }

}