import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
import { Events, App } from 'ionic-angular';
import { FileUploader } from './FileUploader';
import { FileDownloader } from './FileDownloader';
import { Util } from './Util';
import { Lang } from './Language';
import { Platform } from 'ionic-angular';



@Injectable()
export class FileTransfer {
    taskUploadListAmount:number = 0;
    taskDownloadListAmount:number = 0;

    constructor(
        // private transfer: FileTransfer,
        private events: Events,
        private http: HttpService,
        private global: GlobalService,
        private util: Util,
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
            GlobalService.consoleLog("下载失败 filetransfer" + JSON.stringify(err));
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