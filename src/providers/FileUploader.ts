import { Injectable } from '@angular/core';
// import { HTTP } from '@ionic-native/http';
// import {Http} from '@angular/http';
import { HttpService } from './HttpService';

import { GlobalService } from './GlobalService';


import { Md5 } from 'ts-md5/dist/md5';
import { File } from '@ionic-native/file';
import { Events, App } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { Util } from './Util';

declare var window;
// declare var cordova;


/**
 * 
 */

// let localCache = {
//////////file download cache///////////
// md5(desturi+sourceurl):{
//   filepath:
//   filename:
//   sourceurl:
//   desturi: 
//   status:      //INIT->START->LOOP->UPLOADING->DONE|ERROR
//   totalSize:
//   downloadsize:
// },
//////////file download cache///////////
// };
const ONEBLOCKWEBRTCSIZE = 40 * 1024;
const ONEBLOCKSIZE = 128 * 1024;

@Injectable()
export class FileUploader {
	private uploaders: any = {};
	// private uploader: SingleFileUploader;
	constructor(private http: HttpService,
		private global: GlobalService,
		private util: Util
	) {
		// this.uploader = new SingleFileUploader();
	}
	///// 开始文件上传///////////////////////
	// file: 全局的任务对象
	// boxUrl: 文件上传api
	// @return undefined
	///////////////////////////////////////
	upload(file, boxUploadUrl) {
		let sourceurl = file.path;
		let desturl = file.localPath;
		// let fileId = this.generateFileID(file);
		let fileId = file.fileId;
		return this.uploaders[fileId].upload(file, boxUploadUrl);
	}

	createUploader(file, boxUploadUrl) {
		let sourceurl = file.path;
		let desturl = file.localPath;
		// let fileId = this.generateFileID(file);
		// let fileId = "";
		let fileId = file.fileId;
		if (!this.uploaders[fileId]) {
			this.uploaders[fileId] = new SingleFileUploader(this.http, this.global);
		}
		// localCache[fileId] = localCache[fileId] ? localCache[fileId] : { key: fileId };
		// this.uploaders[fileId].cache = localCache[fileId];
		GlobalService.consoleLog("创建任务的文件id:" + fileId);
		GlobalService.consoleLog("文件下载器对象:" + this.uploaders[fileId]);
		return this.uploaders[fileId];
	}

	clearUploaderTask(fileId) {
		if (this.uploaders[fileId]) {
			delete this.uploaders[fileId];
		}
	}

	// generateFileID(file) {
	//     return Md5.hashStr(file.localPath + file.path + '/' + file.name, false) + "";
	// }

	///// 暂停文件上传///////////////////////
	// @return undefined
	///////////////////////////////////////
	pause(fileId) {
		this.uploaders[fileId].pause()
	}

	///// 取消文件上传///////////////////////
	// @return undefined
	///////////////////////////////////////
	abort(fileId) {
		this.uploaders[fileId].abort()
	}

	///// 恢复文件上传///////////////////////
	// @return undefined
	///////////////////////////////////////
	resume(fileId) {
		this.uploaders[fileId].resume()
	}

	///// 文件上传进度通知设置////////////////
	// @return listener
	///////////////////////////////////////
	onProgress(fileId, listener) {
		GlobalService.consoleLog("文件" + fileId + "创建任务进度事件");
		this.uploaders[fileId].progress = listener;
	}

	onFailure(fileId, failure) {
		this.uploaders[fileId].failure = failure;
	}

	onSuccess(fileId, failure) {
		this.uploaders[fileId].success = failure;
	}
}

class SingleFileUploader {
	public progress: any; //进度
	public failure: any; //失败
	public success: any;
	public cache: any;
	public uploadUrl;
	// private http: HTTP;
	private file: File;
	private isAbort: boolean; //是否取消
	private isPause: boolean; //是否暂停
	private timer: any;
	private remotePath;
	private oneBlockSize;
	private http: HttpService;
	private global: GlobalService;

	constructor(http: HttpService,
		global: GlobalService) {
		this.http = http;
		this.global = global;
		this.file = new File();
		this.cache = {};
		this.isAbort = false;
		this.isPause = false;
		this.progress = function (res) { }
		this.failure = function (res) { }
		this.success = function (res) { }
		this.setBlockUploadSize();
	}

	setBlockUploadSize() {
		this.oneBlockSize = this.global.useWebrtc ? ONEBLOCKWEBRTCSIZE : ONEBLOCKSIZE;
	}

	///// 开始文件上传///////////////////////
	// @return Promise<any>
	///////////////////////////////////////
	upload(file, boxUploadUrl) {
		let self = this;
		this.uploadUrl = boxUploadUrl;
		this.remotePath = file.path.replace(/\/[^\/]+$/, '');
		GlobalService.consoleLog("开始调用singleFileUploader,远程路径(不含文件名)：" + this.remotePath);
		this.setBlockUploadSize();
		return this._initcache(file)
			//Step 3. loop for download
			.then((size) => {
				if (size) {
					this.cache.totalsize = size;
				}
				this.cache.status = "LOOP";
				this.cache.uploadsize = file.loaded || 0;
				this._progress("");
				this.timer = setTimeout(() => {
					this._loopUpload();
				}, 200);
				return;
			})
			//Step 4. catch error
			.catch(function (err) {
				GlobalService.consoleLog("失败：" + err.stack);
				throw err;
			});

	}

	///// 暂停文件///////////////////////
	// @return undefined
	///////////////////////////////////////
	pause() {
		this.isPause = true;
	}

	///// 取消文件上传///////////////////////
	// @return undefined
	///////////////////////////////////////
	abort() {
		this.isAbort = true;
	}

	///// 恢复文件上传///////////////////////
	// @return undefined
	///////////////////////////////////////
	resume() {
		if (this.isPause) {
			this.setBlockUploadSize();
			this.cache.status = "LOOP";
			this.isPause = false;
			this.isAbort = false;
			new Promise((resolve, reject) => {
				if(this.cache.totalsize) {
					resolve(this.cache.totalsize);
				} else {
					this._initcache({
						name: this.cache.filename,
						localPath: this.cache.localpath
					})
					.then(res => {
						this.cache.totalsize = res;
						resolve(res);
					})
				}
			})
			.then(res => {
				this.timer = setTimeout(() => {
					this._loopUpload();
				}, 0);				
			})
		} else {
			GlobalService.consoleLog("不在暂停状态，不能继续");
		}
	}

	///// 文件上传进度通知///////////////////
	// @return undefined
	///////////////////////////////////////
	private _progress(errstr) {
		GlobalService.consoleLog("_progree开始调用..." + errstr);
		this.progress({
			loaded: this.cache.uploadsize,
			total: this.cache.totalsize
		});
	}

	///// 循环获取文件剩余文件////////////////
	// @parameter: cache
	// @return Promise<output>
	///////////////////////////////////////
	private _loopUpload() {
		// GlobalService.consoleLog("重新开始上传文件......");
		var cache = this.cache,
			self = this;
		GlobalService.consoleLog("循环:" + JSON.stringify(cache));
		//上传已完成
		if (cache.status == "DONE") {
			// GlobalService.consoleLog("循环：上传完成取消循环");
			clearInterval(self.timer);
			self.timer = null;
			self._progress("DONE");
		}
		//循环已取消
		else if (self.isAbort || self.isPause) {
			// GlobalService.consoleLog("循环：取消或暂停循环");
			clearInterval(self.timer);
			self.timer = null;
			cache.status = self.isAbort ? "ABORT" : "PAUSE";
			self._progress(cache.status);
		}
		//循环继续
		else if (cache.status == "LOOP") {
			GlobalService.consoleLog("循环：循环中");
			cache.status = "UPLOADING";
			let start = Date.now();
			//单块上传
			self._uploadoneblock()
				//获取单块上传结果
				.then((res) => {
					let err = res[0],
						uploadSize = res[1];
					if (err) {
						GlobalService.consoleLog("循环：单块下载失败, 重试：" + err);
						// cache.status = "LOOP";
						self.isAbort = true;
						self.failure({
							code: -2,
							message: err,
						});
					} else if (cache.totalsize > uploadSize) {
						GlobalService.consoleLog("循环：单块上传后大小不够，继续上传");
						cache.uploadsize = uploadSize;
						cache.status = "LOOP";
						// cache.speed =(cache.speed * self.global.speedMax) +  (this.oneBlockSize * 1000 / (Date.now() - start)) * (1 - self.global.speedMax);
						self._progress("");
					} else {
						cache.uploadsize = cache.totalsize;
						GlobalService.consoleLog("循环：单块上传后，上传完成(" + uploadSize + "/" + cache.totalsize + ")");
						cache.status = "DONE";
						self.success({
							complete: 1,
							rangend: cache.totalsize
						});
					}
					self.timer = setTimeout(() => {
						self._loopUpload();
					}, 0);
				},
					() => {
						GlobalService.consoleLog("失败重传---");
						self.timer = setTimeout(() => {
							self._loopUpload();
						}, 0);
					})
				//获取单块失败
				.catch(() => {
					GlobalService.consoleLog("循环：获取单块失败");
					cache.status = "ERROR";
					self.isAbort = true;
					self.failure({
						code: -3,
						message: "_loopUpload catch error"
					});
				});
		}
	}

	clearCache() {
		this.cache = {};
	}

	///// 结合缓存和磁盘文件进行缓存初始化//////
	// @return Promise<output>
	///////////////////////////////////////
	private _initcache(file) {
		var cache = this.cache;
		//Step 1. cache not empty, check chache.
		// if (cache.status) {
		//     GlobalService.consoleLog("status存在，直接使用cache:" + JSON.stringify(cache));
		//     return new Promise(function(resolve, reject) {
		//         resolve();
		//     });
		// }
		//Step 2. cache is empty, init from disk
		// else {
		// GlobalService.consoleLog("开始初始化cache");
		let self = this;
		let fileObj = new File();
		cache.status = "INIT"; //INIT->START->LOOP->DOWNLOADING->DONE|ERROR
		cache.uploadsize = 0;
		cache.speed = 0;
		cache.filename = file.name;
		cache.localpath = file.localPath;
		return new Promise(function (resolve, reject) {
			let urlResolve = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
			GlobalService.consoleLog("开始resolve文件的entry：" + cache.localpath);
			urlResolve(cache.localpath, function (fileEntry) {
				// GlobalService.consoleLog("获取本地url:" + JSON.stringify(fileEntry));
				fileEntry.getMetadata(function (metadata) {
					GlobalService.consoleLog("getMetadata成功返回:" + JSON.stringify(metadata));
					if (metadata.size != 0) {
						resolve(metadata.size);
					} else {
						// GlobalService.consoleLog("读取本地文件失败");
						self.clearCache();
						self.failure({
							code: -1,
							message: "读取本地文件失败"
						})
					}
				},
					function (err) {
						// GlobalService.consoleLog("读取本地文件失败");
						self.clearCache();
						self.failure({
							code: -1,
							message: "读取本地文件失败"
						})
						reject(err);
					});
			},
				function (err) {
					GlobalService.consoleLog("用户选择的文件不存在！" + cache.filename);
					console.error(err.stack)
					self.clearCache();
					self.failure({
						code: -1,
						message: "读取本地文件失败"
					})
					reject(err);
				});
		});
		// }
	}

	///// 获取文件剩余文件一个块//////////////
	// @parameter: desturi
	// @parameter: sourceurl
	// @return Promise<output>
	///////////////////////////////////////
	public _uploadoneblock() {
		let self = this;
		let cache = this.cache;
		let range_start = parseInt(cache.uploadsize);
		let range_end = Math.min(range_start + this.oneBlockSize, cache.totalsize);
		let range = range_start + "-" + (range_end - 1) + "-" + cache.totalsize;
		GlobalService.consoleLog("range:" + range);
		let re = cache.localpath.match(/^(.*)\/([^\/^\?]+)(\?[^\?]+)?$/);
		let filePath = re[1];
		// let fileName = re[2].replace(/(\s)/g, "\\$1");
		let fileName = re[2];
		GlobalService.consoleLog("filePath:" + filePath);
		GlobalService.consoleLog("fileName:" + fileName);
		let tmpFileName = Md5.hashStr(fileName) + '_' + range + '.tmp';
		let tmpFilePath = this.global.fileSavePath;
		let tmpFullFilePath = tmpFilePath + tmpFileName;

		if (range_start > range_end) {
			GlobalService.consoleLog("不可能事件！！" + range_start + "," + range_end);
		}

		GlobalService.consoleLog("开始上传块:" + filePath + "," + fileName)
		// return this.file.readAsBinaryString(filePath, fileName)
		return this.file.readAsArrayBufferRange(filePath, fileName, range_start, range_end)
			// return this.file.readAsArrayBuffer(filePath, fileName)
			.then(buf => {
				GlobalService.consoleLog("------文件长度: " + buf.byteLength + "-----")
				GlobalService.consoleLog(`文件Range信息：${range}`)
				//读取指定位置的字符，并写入文件
				// let data = buf.slice(range_start, range_end);
				// GlobalService.consoleLog("获取slice成功:" + tmpFilePath + "," + tmpFileName);

				return this.http.uploadFile(self.uploadUrl, {
					range: range,
					path: self.remotePath,
					name: fileName,
				}, tmpFilePath, tmpFileName, buf)
			}, res => {
				// GlobalService.consoleLog("读文件失败" + JSON.stringify(res));
				// return ["", range_start];
				throw new Error("Failed to read file");
			})

			.then((res: any) => {
				GlobalService.consoleLog("文件上传结果: " + JSON.stringify(res));

				try {
					if (res.data && (typeof res.data === 'string')) {
						res.data = JSON.parse(res.data);
					}
				} catch (e) {
					GlobalService.consoleLog(e.stack || e.message);
				}


				if (res.status === 200) {
					let end = range_end;
					if (res.data.err_no === 0) {
						GlobalService.consoleLog("上传成功:" + range_end);
					} else if (res.data.err_no === 1409) {
						GlobalService.consoleLog("需重新校正包位置: " + res.data.rangend);
						end = res.data.rangend;
					} else {
						// GlobalService.consoleLog("上传失败");
					}
					// GlobalService.consoleLog("删除文件目录：" + tmpFilePath);
					// GlobalService.consoleLog("删除文件名称："  + tmpFileName);
					if (this.global.useWebrtc) {
						return new Promise((resolve, reject) => {
							resolve(["", end]);
						})
					} else {
						return this.file.removeFile(tmpFilePath, tmpFileName)
							.then((res) => {
								// GlobalService.consoleLog("临时文件删除结果：" + JSON.stringify(res));
								return ["", end]
							})
					}
				} else {
					GlobalService.consoleLog("上传失败，需要重试");
					// return Promise.reject(["File upload error", range_start]);
					throw new Error("UPload interface return error");
				}
			})
			//捕获异常
			.catch((error) => {
				let errstr = JSON.stringify(error);
				GlobalService.consoleLog("单块上传出错：" + error.stack);
				this.failure();
				return [errstr, range_end];
			});
	}
}
