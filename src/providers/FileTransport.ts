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
import { TaskListPage } from '../pages/task-list/task-list';
import { Component, NgZone } from "@angular/core";

declare var cordova;
declare var FileTransfer;

@Injectable()
export class FileTransport {
	taskUploadListAmount: number = 0;
	taskDownloadListAmount: number = 0;

	constructor(
		// private transfer: FileTransport,
		private events: Events,
		private http: HttpService,
		private global: GlobalService,
		private util: Util,
		private file: File,
		private zone: NgZone,
		private fileUploader: FileUploader,
		public fileDownloader: FileDownloader,
		private platform: Platform,
	) {
		this.events.unsubscribe('create:upload');
		events.subscribe('create:upload', (task) => {
			GlobalService.consoleLog("创建任务事件响应");
			var uploadTool = this.createUploadHandler(task);
			if(uploadTool) {
				this.global.fileHandler[task.taskId] = uploadTool;
			}
		});
		this.events.unsubscribe('create:download');
		events.subscribe('create:download', (task) => {
			GlobalService.consoleLog("创建下载任务事件响应");
			var downloadTool = this.createDownloadHandler(null, null, task);
			if(downloadTool) {
				this.global.fileHandler[task.taskId] = downloadTool;
			}
		});
	};


    /**
     * [uploadSingleFile 单文件上传]
     * @param {[type]} localPath  [本地路径，包含文件名]
     * @param {[type]} remotePath [远程路径，不包含文件名]
     * @param {[type]} eventType  [description]
     */
	uploadSingleFile(localPath, remotePath, uploadInfo = null) {
		GlobalService.consoleLog(`上传参数：localPath=${localPath},remotePath=${remotePath},thumbnail=${uploadInfo.thumbnail}`);
		localPath = localPath.replace(/\?\d+$/, '');
		remotePath = remotePath.replace(/\?\d+$/, '');
		let fileName = localPath.match(/([^\/^\?]+)(\?[^\?]+)?$/)[1] || "noname";
		// this.global.createGlobalToast(this, {
		//     message: Lang.Lf('WORD80e433b7', fileName),
		// });
		// filename = filename.replace(/\s+/g, "");
		// var fileId = "Upload_" + Md5.hashStr(localPath + remotePath + '/' + filename, false);
		var fileId = this.util.generateFileID(localPath, remotePath + '/' + fileName, 'upload', uploadInfo && uploadInfo.id);
		var task = this.global.fileTaskList.filter(item => item.fileId === fileId && item.finished === false);
		// var fullPath = remotePath + fileName;
		var taskId = 'Upload_' + Date.now();
		var newTask = this.global.fileTaskList.find(item => item.fileId === fileId && item.finished === false);
		var currentTask;
		var pausing = 'waiting';
		var fileTask = this.global.fileTaskList.filter(item => item.action == "upload" && item.pausing == 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.global.currDiskUuid);
		this.taskUploadListAmount = fileTask.length;
		//已包含3个任务，任务不开启
		if (fileTask.length < this.global.fileMaxUpload) {
			pausing = 'doing';
		} else {
			pausing = 'waiting';
		}
		console.log('当前新建任务的状态' + pausing)
		// GlobalService.consoleLog('fullPath   ===  ' + fullPath);
		// GlobalService.consoleLog('localPath   ===  ' + localPath);

		if (newTask && this.global.fileHandler[newTask.taskId]) {
			// newTask[0].taskId = taskId;
			// newTask[0].pausing = pausing;
			// currentTask = newTask[0];
			if (pausing === 'doing') {
				let taskId = newTask.taskId;
				newTask.pausing = pausing;
				this.global.fileHandler[taskId].resume();
			}
		} else {
			GlobalService.consoleLog(taskId + "任务不存在，创建新的任务");
			currentTask = {
				fileId: fileId,
				taskId: taskId,
				name: fileName,
				path: remotePath + "/" + fileName,
				localPath: localPath,
				speed: 0,
				total: 0,
				loaded: 0,
				pausing: pausing,
				// thumbnail: uploadInfo.thumbnail || '',
				action: 'upload',
				confirmLoaded: 0,
				finished: false,
				fileStyle: this.util.computeFileType(fileName, 2),
				boxId: this.global.deviceSelected.boxId,
				bindUserHash: this.global.deviceSelected.bindUserHash,
				selected: false,
				finishedTime: '',
				diskUuid: this.global.currDiskUuid
			};
			this.global.fileTaskList.push(currentTask);
			this.events.publish('task:created');
			var uploadTool = this.createUploadHandler(currentTask);
			this.global.fileHandler[taskId] = uploadTool;
		}
	}

	createUploadHandler(task: any) {
		let tool;
		let start = 0;
		let progress = (res) => {
			GlobalService.consoleLog("上传进度信息：" + JSON.stringify(res));
			if (res.status === 'ERROR') {
				task.pausing = 'paused';
				tool.pause();
				task.speed = 0;
				return false;
			}

			if (!this.global.networking) {
				task.pausing = 'waiting';
				tool.pause();
				task.speed = 0;
				return false;
			}
			// if (task.pausing == 'paused') {
			// 	GlobalService.consoleLog("文件上传已暂停，不接收进度更新");
			// 	return false;
			// }
			let now = Date.now();
			if (now > start + 600) {
				this.zone.run(() => {
					// console.log("上传进度通知：" + res.loaded + "," + task.loaded + "," + res.total);
					task.speed = Math.max(0, Math.ceil((res.loaded - task.loaded) * 1000 / (now - start) * .5 + task.speed * .5));
					task.loaded = res.loaded;
					task.total = res.total;
					start = now;
				})
			}
			// GlobalService.consoleLog("更新进度信息:" + res.loaded);
			return true;
		};
		let failure = (res) => {
			GlobalService.consoleLog("上传失败, onFailure");
			this.events.publish("upload:failure", task);
			this.startWaitTask('upload');
		}
		let success = (res: any) => {
			GlobalService.consoleLog("上传完成！更新finish状态并发射file:updated事件:" + JSON.stringify(res));
			this.zone.run(() => {
				task.finished = !!res.complete;
				task.loaded = res.rangend;
				// task.confirmLoaded = res.rangend;
				if (task.finished) {
					task.finishedTime = new Date().getTime();
					let taskId = task.taskId;
					if (this.global.fileHandler[taskId]) {
						delete this.global.fileHandler[taskId];
					}
					this.fileUploader.clearUploaderTask(task.fileId);
					this.events.publish('file:updated', task);
					console.log("event published......")
				} else {
					this.events.publish('file:savetask');
				}
			})
			// console.log("进的点点滴滴")
			//如果没有同类型文件任务，则弹窗.....
			// if(!this.global.fileTaskList.some(item => item.action === 'upload' && !item.finished)) {
			//     //通知任务列表页刷新
			//     this.global.createGlobalToast(this, {
			//         message: Lang.Lf('UploadFileSuccess')
			//     })
			// }
			//查找等待中的任务，每完成一个自动通知新任务
			this.startWaitTask('upload');
		};
		var fileTask = this.global.fileTaskList.filter(item => item.action == "upload" && item.pausing == 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.global.currDiskUuid);
		this.taskUploadListAmount = fileTask.length;
		if (this.taskUploadListAmount > this.global.fileMaxUpload) {
			GlobalService.consoleLog('先加入队列，且先暂停，后面再上传:' + this.taskUploadListAmount + "," + this.global.fileMaxUpload);
			task.pausing = 'waiting';
			tool.pause();
			task.speed = 0;
		} else {
			if (this.global.useWebrtc) {
				tool = this.createUploadHandlerRemote(task, progress, success, failure);
			} else {
				tool = this.createUploadHandlerLocal(task, progress, success, failure);
			}
		}
		return tool;
	}

	createUploadHandlerLocal(fileTask: any, progress, success, failure) {
		let url = this.global.getBoxApi('uploadFileBreaking');
		let fileURL = fileTask.localPath;
		let self = this;
		console.log("终极上传路径：" + fileTask.path.replace(/\/[^\/]+$/, ''));
		let uploadTransfer = new FileTransfer(
			fileURL,
			url,
			{
				headers: {
					cookie: this.http.getCookieString(url)
					// add custom headers if needed
				},
				chunkedMode: true,
				params: {
					path: fileTask.path.replace(/\/[^\/]+$/, ''),
					name: fileTask.name,
					transfer: 'chunked',
					offset: fileTask.loaded,
					disk_uuid: this.global.currDiskUuid
				}
			});
		let start = Date.now();
		let uploadParams = JSON.stringify({
			path: fileTask.path.replace(/\/[^\/]+$/, ''),
			name: fileTask.name,
			transfer: 'chunked',
			offset: fileTask.loaded,
			disk_uuid: this.global.currDiskUuid
		});
		uploadTransfer.onProgress(progress);
		uploadTransfer.onSuccess(success);
		uploadTransfer.onFailure(failure)
		console.log("上传起始位置:" + fileTask.loaded);
		console.log(`本地url:${fileURL}, 传输url: ${url},传输参数: ${uploadParams}`);
		uploadTransfer.upload();
		return uploadTransfer;
	}

	createUploadHandlerRemote(fileTask: any, progress, success, failure) {
		var uploadTool;
		var taskId = fileTask.taskId;
		var fileHandler = this.global.fileHandler[taskId];
		var uploadUrl = this.global.getBoxApi('uploadFileBreaking');

		if (!fileHandler) {
			GlobalService.consoleLog('创建新的FileUploader')
			uploadTool = this.fileUploader.createUploader(fileTask, uploadUrl);
		} else {
			GlobalService.consoleLog('使用已有FileUploader')
			uploadTool = this.global.fileHandler[taskId];
		}

		GlobalService.consoleLog("创建上传任务:" + fileTask.name);
		uploadTool.upload(fileTask, uploadUrl)
			.catch(err => {
				GlobalService.consoleLog("上传失败:" + err.stack);
			})
		this.fileUploader.onProgress(fileTask.fileId, progress);
		this.fileUploader.onFailure(fileTask.fileId, failure)
		this.fileUploader.onSuccess(fileTask.fileId, success)
		return uploadTool;
	}

    /**
     * [getFileLocalOrRemote 获取文件，若本地存在则使用本地，否则通过远程下载]
     * @param {[type]} remoteUrl [远程文件夹路径，不包含文件名]
     * @param {[type]} localPath [本地文件夹路径，不包含文件名]
     */
	getFileLocalOrRemote(remoteUrl, remoteName, localPath, name, fileSubPath, fileStyle = 'image') {
		remoteUrl = remoteUrl.replace(/\/$/, '') + "/";
		localPath = localPath.replace(/\/$/, '') + "/";
		console.log(`查询${localPath}下是否存在文件${name}`)
		console.log(`如果不存在，则直接从${remoteUrl}处下载${remoteName}文件`)
		//第1步，判断本地是否存在，若存在则直接使用
		return this.file.checkFile(localPath, name)
			.then(res => {
				GlobalService.consoleLog("目标文件存在:" + localPath + name);
				//文件已存在
				return localPath + name;
			}, res => {
				GlobalService.consoleLog("目标文件不存在:" + localPath + name);
				//文件不存在，尝试远程下载
				return this.downloadRemoteFile(remoteUrl, remoteName, localPath, name, fileSubPath, fileStyle)
					.then(res => {
						if (res) {
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
			return !item.thumbnail && (item.fileStyle === 'image' || item.fileStyle === 'video');
		});

		console.log("需要更新的缩略图张数：" + noThumbnailList.length);

		let downloading = {};
		let downloadIthThumbnail = (i) => {
			//检查本地是否存在,删除后面的重命名时添加的(2)
			let md5;
			let name = noThumbnailList[i].name.replace(/\(\d+\)(\.[^\.]+)$/, "$1");
			let remotePath = isHasPath ? noThumbnailList[i].path : currPath;
			md5 = Md5.hashStr(remotePath + "/" + name).toString();

			let thumbnailName = md5 + ".png";
			let localThumbnailPath = this.global.fileSavePath + this.global.ThumbnailSubPath + "/";
			let localThumbnailFullPath = localThumbnailPath + thumbnailName;
			let logprefix = "缩略图下载：(" + thumbnailName + ")：";
			GlobalService.consoleLog(logprefix + "开始下载" + i);
			GlobalService.consoleLog(logprefix + "本地路径尝试：" + localThumbnailPath + thumbnailName);
			GlobalService.consoleLog(logprefix + "远程地址：" + remotePath + noThumbnailList[i].name);
			// return this.getFileLocalOrRemote(this.global.ThumbnailRemotePath + "/", localThumbnailPath, thumbnailName, this.global.ThumbnailSubPath, 'thumbnail')
			return this.getFileLocalOrRemote(remotePath, noThumbnailList[i].name, localThumbnailPath, thumbnailName, this.global.ThumbnailSubPath, 'thumbnail')
				.then(res => {
					if (res) {
						GlobalService.consoleLog(logprefix + "数据获取完毕：" + JSON.stringify(res));
						noThumbnailList[i].thumbnail = res;
						this.global.thumbnailMap[md5] = res;
					} else {
						GlobalService.consoleLog(logprefix + "缩略图不存在");
						// return this.getFileLocalOrRemote(noThumbnailList[i].path, noThumbnailList[i].name, this.global.fileSavePath + this.global.PhotoSubPath + "/", noThumbnailList[i].name, this.global.PhotoSubPath)
						// .then(res => {
						// 	if(res) {
						// 		GlobalService.consoleLog(logprefix + "数据原图获取完毕：" + JSON.stringify(res));
						// 		noThumbnailList[i].thumbnail = res;
						// 		this.global.thumbnailMap[md5] = res;
						// 	}
						// })
					}
				})
				.catch(e => {
					GlobalService.consoleLog(logprefix + "下载异常....");
				}).then(() => {
					GlobalService.consoleLog(logprefix + "下载结束[" + i + "]");
					delete downloading[i];
				})
		};

		let lastindex = 0;
		let donecount = 0;
		let totalcount = noThumbnailList.length;
		let limit = this.global.useWebrtc ? 5 : 100;
		let looptimer = setInterval(() => {
			let doingcount = Object.keys(downloading).length;
			console.log("正在下载数:" + doingcount + ",总数：" + totalcount);
			if (donecount + doingcount < totalcount && doingcount < limit) {
				downloading[lastindex] = 1;
				downloadIthThumbnail(lastindex++)
					.then(() => {
						donecount++
					})
					.catch(e => {
						donecount++;
					});
			}
			if (donecount + doingcount >= totalcount) {
				clearInterval(looptimer)
			}
		}, 100);
	}
    /**
     * [downloadRemoteFile 从服务器上下载文件]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     * @param {[type]} fileSubPath [文件子路径]
     */
	downloadRemoteFile(remoteUrl, remoteName, localPath, name, fileSubPath, fileStyle) {
		let localFullPath = localPath + name,
			remoteFullPath = remoteUrl + remoteName;
		let fileInfo = {
			name: name,
			fileStyle: fileStyle
		};
		return this.downloadFile(fileInfo, remoteFullPath, localFullPath, false);
	}

	/**
	 * @param remoteFullPath
	 * @param localFullPath
	 * @param createTask
	 */
	downloadFile(fileInfo, remoteFullPath, localFullPath, createTask: boolean = true) {
		return new Promise((resolve, reject) => {
			GlobalService.consoleLog("下载文件到本地:" + localFullPath + ",远程路径：" + remoteFullPath);
			// this.global.createGlobalToast(this, {
			//     message: Lang.Lf('StartDownloadFile', file.name),
			// });
			// var fullPath = currPath.replace(/\/$/g, '') + "/" + encodeURIComponent(file.name);
			// var uri = encodeURI(this.global.getBoxApi("downloadFile"));
			var fileId = this.util.generateFileID(localFullPath, remoteFullPath, 'download');

			var taskId = 'Download_' + Date.now();
			var pausing = 'paused';

			if (createTask) {
				var taskList = this.global.fileTaskList.filter(item => item.action === 'download' && item.pausing === 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.global.currDiskUuid);
				// this.tasklistlen = tasklist.length;
				this.taskDownloadListAmount = taskList.length;
				if (taskList.length <= this.global.fileMaxDownload) {
					pausing = 'doing';
				} else {
					pausing = 'waiting';
				}
			}
			let fileTask = this.global.fileTaskList.find(item => item.fileId === fileId && item.finished === false);
			if (createTask && fileTask && this.global.fileHandler[fileTask.taskId]) {
				if (pausing === 'doing') {
					let taskId = fileTask.taskId;
					fileTask.pausing = pausing;
					this.global.fileHandler[taskId].resume();
				}
			} else {
				let task = {
					fileId: fileId,
					taskId: taskId,
					name: fileInfo.name,
					path: remoteFullPath,
					localPath: localFullPath,
					fileStyle: fileInfo.fileStyle,
					total: 0,
					pausing: pausing,
					loaded: 0,
					speed: 0,
					action: 'download',
					finished: false,
					boxId: this.global.deviceSelected.boxId,
					bindUserHash: this.global.deviceSelected.bindUserHash,
					selected: false,
					finishedTime: '',
					diskUuid: this.global.currDiskUuid
				}
				var downloadTool = this.createDownloadHandler(resolve, reject, task, createTask);

				//创建文件下载，需添加至文件列表
				if (createTask) {
					this.global.fileTaskList.push(task);
					if(downloadTool) {
						this.global.fileHandler[taskId] = downloadTool;
					}
				}
			}
			if (createTask) {
				this.events.publish('task:created');
			}
		})

	}

	// generateFileID(desturi, sourceurl) {
	//     return Md5.hashStr(desturi + sourceurl, false) + "";
	// }

	createDownloadHandler(resolve, reject, task: any, createTask = true) {
		GlobalService.consoleLog("开始创建下载器.......")
		let tool;
		let start = Date.now();
		let progress = (res: any) => {
			// GlobalService.consoleLog("进度信息：" + JSON.stringify(res));
			//更新任务进度
			this.events.publish('download:progress:' + task.fileId, task);
			if (res.status === 'ERROR' || res.status === 'ABORT') {
				GlobalService.consoleLog("任务已出错或者终止");
				task.pausing = 'paused';
				tool.pause();
				task.speed = 0;
				return false;
			}
			if (!this.global.networking) {
				GlobalService.consoleLog("网络故障");
				task.pausing = 'waiting';
				tool.pause();
				task.speed = 0;
				return false;
			}
			// GlobalService.consoleLog("更新任务进度");
			let now = Date.now();
			if (now > start + 500) {
				this.zone.run(() => {
					console.log("下载进度通知：" + res.loaded + "," + task.loaded + "," + res.total);
					task.speed = Math.max(0, Math.ceil((res.loaded - task.loaded) * 1000 / (now - start) * .5 + task.speed * .5));
					task.loaded = res.loaded;
					task.total = res.total;
					start = now;
				});
			}
			return true;
		};
		let success = (res: any) => {
			console.log("下载成功返回....." + JSON.stringify(res));
			let taskId = task.taskId;
			if(res.complete || res.loaded == res.total) {
				GlobalService.consoleLog("下载完成！！" + task.localPath);
				this.zone.run(() => {
					task.finished = true;
					task.finishedTime = new Date().getTime();
				});
				// if(!this.global.fileTaskList.some(item => item.action === 'download' && !item.finished )) {
				//     this.global.createGlobalToast(this, {
				//         message: Lang.Lf('DownloadFileToBoxSuccess', myTask.name)
				//     })
				// }
				if (this.global.fileHandler[taskId]) {
					delete this.global.fileHandler[taskId];
				}
			} else {
				//任务尚未完成
				if (this.global.fileHandler[taskId]) {
					this.global.fileHandler[taskId].pause();
					task.speed = 0;
				}
				task.paused = 'paused';
			}
			task.loaded = res.loaded;
			if (createTask) {
				if(res.loaded == res.total) {
					this.events.publish('file:updated', task);
				} else {
					this.events.publish('file:savetask');
				}
				this.startWaitTask('download');
			}
			console.log("resolve... " + task.localPath);
			resolve && resolve(task.localPath);
		};
		let failure = (res) => {
			GlobalService.consoleLog("下载失败, onFailure");
			if (createTask) {
				this.events.publish("download:failure", task);
				this.startWaitTask('download');
			}
			resolve && resolve('');
		};
		var taskList = this.global.fileTaskList.filter(item => item.action === 'download' && item.pausing === 'doing' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.global.currDiskUuid);
		this.taskDownloadListAmount = taskList.length;
		//立即开始
		if(!createTask || this.taskDownloadListAmount <= this.global.fileMaxDownload) {
			GlobalService.consoleLog("开始创建任务....");
			if (this.global.useWebrtc) {
				tool = this.createDownloadHandlerRemote(task, createTask ? progress : null, success, failure);
			} else {
				tool = this.createDownloadHandlerLocal(task, createTask ? progress : null, success, failure);
			}
		} else {
			GlobalService.consoleLog('先加入队列，且先暂停，后面再下载' + this.taskDownloadListAmount + "," + this.global.fileMaxDownload);
			task.pausing = "waiting";
			task.speed = 0;
		}
		return tool;
	}

	createDownloadHandlerLocal(fileTask, progress, success, failure) {
		let url = this.global.getBoxApi('downloadFile') + this.http.toQueryString({
			fullpath: fileTask.path,
			disk_uuid: this.global.currDiskUuid,
			is_thumbnail: fileTask.fileStyle == 'thumbnail' ? 1 : 0
		})//'?fullpath=' + encodeURIComponent(fileTask.path) + '&disk_uuid=' + this.global.currDiskUuid ;
		let fileURL = fileTask.localPath;
		console.log("local下载文件：url：" + url + ",存于本地" + fileURL + ",远程：" + fileTask.path);
		let self = this;
		let fileTransfer = new FileTransfer(url, fileURL, {
			headers: {
				// add custom headers if needed
				cookie: this.http.getCookieString(url)
			},
			params: {
				offset: fileTask.loaded || -1,
				total: fileTask.total || -1
			}
		}, false);
		fileTransfer.onProgress(progress);
		fileTransfer.onSuccess(success)
		fileTransfer.onFailure(failure)
		console.log("开始调用下载....")
		fileTransfer.download();
		return fileTransfer;
	}

	createDownloadHandlerRemote(task, progress, success, failure, createTask = true) {
        let downloadTool;
		let taskId = task.taskId;
		let option = {
            disk_uuid: this.global.currDiskUuid,
            is_thumbnail: task.fileStyle == 'thumbnail' ? 1 : 0
        };

		downloadTool = this.fileDownloader.createDownloader(task.localPath, task.path, option);
		downloadTool.download().catch(err => {
				GlobalService.consoleLog("下载失败 FileTransport" + JSON.stringify(err));
				let task = this.global.fileTaskList.filter(item => item.taskId === taskId);
				if (task && task.length && task[0].isShow && !option.is_thumbnail) {
                    GlobalService.consoleLog("下载失败,显示toast");
                    this.global.createGlobalToast(this, {
						message: Lang.Lf("DownloadFileFailed", task[0].name)
					})
				}
			});
		// if (this.taskUploadListAmount >= this.global.fileMaxDownload) {
		// 	GlobalService.consoleLog('先加入队列，且先暂停，后面再下载');
		// 	downloadTool.pause();
		// }
		this.fileDownloader.onProgress(task.fileId, progress)
		this.fileDownloader.onSuccess(task.fileId, success)
		this.fileDownloader.onFailure(task.fileId, failure)

		return downloadTool;
	}

	startWaitTask(action) {
		console.log("开始等待的任务......." + action)
		let continueTaskList = this.global.fileTaskList.filter(item => item.action == action && item.pausing == 'waiting' && item.finished == false && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.global.currDiskUuid);
		console.log("等待任务数目：" + continueTaskList.length);
		if (continueTaskList.length > 0) {
			let newTask = continueTaskList[0];
			newTask.pausing = 'doing';
			if (this.global.fileHandler[newTask.taskId]) {
				this.global.fileHandler[newTask.taskId].resume();
			} else {
				this.events.publish('create:' + action, newTask);
			}
		}
	}
}
