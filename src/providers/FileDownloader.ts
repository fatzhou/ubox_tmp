import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http';
import { Md5 } from 'ts-md5/dist/md5';
import { File } from '@ionic-native/file';
import { HttpService } from './HttpService';
import { GlobalService } from './GlobalService';
import { Util } from './Util';
import { OutputType } from '@angular/core/src/view';

// let localCache = {
    //////////file download cache///////////
    // md5(desturi+sourceurl):{
    //   filepath:
    //   filename:
    //   sourceurl:
    //   desturi:
    //   status:      //INIT->START->LOOP->DOWNLOADING->DONE|ERROR
    //   totalsize:
    //   downloadsize:
    // },
    //////////file download cache///////////
// };
const ONEBLOCKSIZE = 128 * 1024;
const ONEBLOCKWEBRTCSIZE = 40 * 1024;

@Injectable()
export class FileDownloader {
    private downloaders:any = {};

    constructor(private http: HttpService,
                private file: File,
                private global: GlobalService,
                private util: Util) {
        // this.downloader = new SingleFileDownloader();
    }

    ///// 开始文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    download(desturi, sourceurl) {
        let k = this.util.generateFileID(desturi, sourceurl, 'download');
        return this.downloaders[k].download(desturi, sourceurl);
    }

    createDownloader(desturi, sourceurl) {
        let k = this.util.generateFileID(desturi, sourceurl, 'download');
        GlobalService.consoleLog("下载id:" + k);
        // localCache[k] = localCache[k] ? localCache[k] : { key: k };
        this.downloaders[k] = new SingleFileDownloader(this.http, this.file, this.global);
        // this.downloaders[k].cache = localCache[k];
        return this.downloaders[k];
    }

    clearDownloaderTask(fileId) {
        if(this.downloaders[fileId]) {
            delete this.downloaders[fileId];
        }
    }

    // generateFileID(desturi, sourceurl) {
    //     return Md5.hashStr(desturi + sourceurl, false) + "";
    // }

    ///// 暂停文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    pause(fileId) {
        this.downloaders[fileId].pause()
    }

    ///// 取消文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    abort(fileId) {
        this.downloaders[fileId].abort()
    }

    ///// 恢复文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    resume(fileId) {
        this.downloaders[fileId].resume()
    }

    ///// 文件下载进度通知设置////////////////
    // @return listener
    ///////////////////////////////////////
    onProgress(fileId, listener) {
        this.downloaders[fileId].progress = listener;
    }

    onFailure(fileId, listener) {
        this.downloaders[fileId].failure = listener;
	}

	onSuccess(fileId, listener) {
        this.downloaders[fileId].success = listener;
    }
}

class SingleFileDownloader {
    public progress: any;
	public failure: any;
	public success: any;
    public cache: any;

    private isAbort: boolean;
    private isPause: boolean;
    private nRetry:  number;
    private timer: any;

    private http: HttpService;
    private global: GlobalService;
    private file: File;
    private oneBlockSize;

    constructor(http: HttpService,
                file: File,
                global: GlobalService) {
        this.http = http;
        this.file = file;
        this.global = global;
        this.isAbort = false;
        this.isPause = false;
        this.nRetry = 0;
        this.cache = {};
        this.progress = function(res) {}
        this.failure = function(res) {}
        this.success = function(res) {}
        this.setDownloadBlockSize();
    }

    setDownloadBlockSize() {
        console.log("filedownloader setDownloadBlockSize")
        this.oneBlockSize = this.global.useWebrtc ? ONEBLOCKWEBRTCSIZE : ONEBLOCKSIZE;
    }

    ///// 开始文件下载///////////////////////
    // @return Promise<any>
    ///////////////////////////////////////
    download(desturi, sourceurl) {
        console.log("filedownload download desturi" + desturi + "   sourceurl   " + sourceurl);
        //Step 1. init cache
        let self = this;
        this.setDownloadBlockSize();
        return self._initcache(desturi, sourceurl)

            //Step 2. get file size
            .then(() => {
                // GlobalService.consoleLog("开始获取文件大小");
                return self._getfilesize();
            })

            //Step 2.1 get file size result
            .then((res:any) => {
                if (res.err) {
                    throw res.err;
                } else {
                    // GlobalService.consoleLog("err:" + res.err + "; totalsize:" + res.totalsize + ";downloadsize:" + res.downloadsize);
                    self.cache.status = "START";
                    self.cache.totalsize = res.totalsize;
                    self.cache.downloadsize = res.downloadsize;
                }
            })

            //Step 3. loop for download
            .then(() => {
                self.cache.status = "LOOP";
                // GlobalService.consoleLog("开始循环下载文件。。。");
                self._progress("");
                self.timer = setTimeout(() => {
                    self._loopdownload();
                }, 200);
                return;
            })

            //Step 4. catch error
            .catch((err) => {
                GlobalService.consoleLog("失败:" + err.stack);
                throw err;
            });
    }

    ///// 暂停文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    pause() {
        this.isPause = true;
    }

    ///// 取消文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    abort() {
        this.isAbort = true;
    }

    ///// 恢复文件下载///////////////////////
    // @return undefined
    ///////////////////////////////////////
    resume() {
        if (this.isPause) {
            this.setDownloadBlockSize();
            this.cache.status = "LOOP";
            this.isPause = false;
			this.isAbort = false;
			new Promise((resolve, reject) => {
				if(this.cache.totalsize) {
					resolve(this.cache.totalsize);
				} else {
					this._getfilesize()
					.then(res => {
						this.cache.totalsize = res.totalsize;
					})
				}
			});
            this.timer = setTimeout(()=>{
              this._loopdownload();
            }, 100);
        } else {
            GlobalService.consoleLog("不在暂停状态，不能继续");
        }
    }

    ///// 文件下载进度通知///////////////////
    // @return undefined
    ///////////////////////////////////////
    private _progress(errstr) {
		console.log("进度通知:" + JSON.stringify(this.cache));
		if(this.progress) {
			this.progress({
				loaded: this.cache.downloadsize,
				total: this.cache.totalsize
			});
		}
    }

    ///// 循环获取文件剩余文件////////////////
    // @parameter: cache
    // @return Promise<output>
    ///////////////////////////////////////
    private _loopdownload() {
        let cache = this.cache;
        let self = this;
        // GlobalService.consoleLog("循环:" + JSON.stringify(cache));
        //下载已完成
        if (cache.status == "DONE") {
            // GlobalService.consoleLog("循环：下载完成取消循环");
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
            cache.status = "DOWNLOADING";
            let start = Date.now();
            //单块下载
            self._downloadoneblock()
                //获取单块下载结果
                .then((args) => {
                    // GlobalService.consoleLog("args" + args);
                    let err = args[0];
                    let downloadsize = args[1] || null;

                    if (err && self.nRetry <= 2 && (err === "channelclosed" || err === "requesttimeout" )) {
                        self.nRetry++;
                        GlobalService.consoleLog("循环：单块下载超时, 尝试重试[retry:" + self.nRetry + "]：" + err);
                    } else if (err) {
                        GlobalService.consoleLog("循环：单块下载失败, 已重试["+self.nRetry+"]：" + err);
                        self.nRetry=0;
                        self.isAbort = true;
                        self.failure({
                            err_no: -9999,
                            err_msg: err
                        });
                    } else if (cache.totalsize > downloadsize) {
                        // GlobalService.consoleLog("循环：单块下载后大小不够，继续下载");
                        cache.downloadsize = downloadsize;
                        cache.status = "LOOP";

                        // cache.speed =(cache.speed * self.global.speedMax) + (self.oneBlockSize * 1000 / (Date.now() - start)) * (1 - self.global.speedMax);
                        self._progress("");
                    } else {
                        cache.downloadsize = cache.totalsize;
                        // GlobalService.consoleLog("循环：单块下载后，下载完成(" + downloadsize + "/" + cache.totalsize + ")");
						cache.status = "DONE";
						self.success({
							complete: 1,
							loaded: cache.totalsize,
							total: cache.totalsize,
							rangend: cache.totalsize
						});
                    }
                    self.timer = setTimeout(()=>{
                        self._loopdownload();
                    }, 0);
                })
                //获取单块失败
                .catch((error) => {
                    // GlobalService.consoleLog("循环：获取单块失败");
                    cache.status = "ERROR";
                    self.isAbort = true;
                    self.failure({
                        err_no: -9999,
                        err_msg: ""
                    });
                });
        }
    }

    ///// 结合缓存和磁盘文件进行缓存初始化//////
    // @return Promise<output>
    ///////////////////////////////////////
    private _initcache(desturi, sourceurl) {
        let cache = this.cache;
        console.log("_initcache " + JSON.stringify(cache))
        //Step 1. cache not empty, check chache.
        if (cache.status) {
            return new Promise(function(resolve, reject) {
                resolve(cache);
            });
        }
        //Step 2. cache is empty, init from disk
        else {
			let self = this;
			let re = desturi.match(/^(.*)\/([^\/^\?]+)(\?[^\?]+)?$/);
			console.log("desturi:" + desturi)
			console.log("re:" + re[1] + "," + re[2])
            cache.filepath = re[1];
            cache.filename = re[2];
            cache.sourceurl = sourceurl;
            cache.desturi = desturi;
            cache.status = "INIT"; //INIT->START->LOOP->DOWNLOADING->DONE|ERROR
            cache.totalsize = 0;
            cache.downloadsize = 0;
            cache.speed = 0;
            return this.file.listDir(cache.filepath, ".").then((entry) => {
                // GlobalService.consoleLog("读取目录成功");
                let esfilename = function(str) {
                    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                }(cache.filename);
                esfilename = esfilename.replace(/\\\\/, "\\");
                let reg = new RegExp(esfilename + "\\.\\[(.*)\\]\\.download");
                // GlobalService.consoleLog("文件名正则表达式匹配:" + esfilename + "\\.\\[(.*)\\]\\.download");
                let rangestr;
                for (let i = 0, len = entry.length; i < len; i++) {
                    let e = entry[i];
                    if (e.isFile && (rangestr = reg.exec(e.name)) && rangestr && rangestr[1]) {
                        GlobalService.consoleLog("进行文件名初步匹配成功,信息字符串为:" + JSON.stringify(rangestr[1]));
                        let tmpcache = self._initcachebyfilename(rangestr[1]);
                        if (tmpcache) {
                            GlobalService.consoleLog("进行文件名匹配成功，进行断点下载:" + tmpcache.downloadsize + "," + tmpcache.totalsize);
                            cache.totalsize = tmpcache.totalsize;
                            cache.downloadsize = tmpcache.downloadsize;
                        } else {
                            // GlobalService.consoleLog("进行文件名匹配失败，重新完整下载");
                        }
                        break;
                    } else {
                        GlobalService.consoleLog("========= e:" + JSON.stringify(e));
                    }
                }
                return cache;
            }).catch((err) => {
                GlobalService.consoleLog("读取目录失败:" + err.stack);
				throw new Error("Folder read error...");
			});
        }
    }

    ///// 通过磁盘文件名进行缓存初始化/////////
    // @return Promise<output>
    ///////////////////////////////////////
    private _initcachebyfilename(rangestr) {
        let ret = {
            totalsize: 0,
            downloadsize: 0,
        };
        let reg = new RegExp("Range==bytes=([0-9]+)-([\\-0-9]*)=Total==([0-9]+)");
        let rettmp = reg.exec(rangestr);
        if (rettmp && rettmp[3]) {
            return {
                downloadsize: parseInt(rettmp[2]) + 1,
                totalsize: rettmp[3],
            };
        }
        return;
    }

    ///// 获取文件大小，保存第一次请求的文件////
    // @parameter: desturi
    // @parameter: sourceurl
    // @return Promise<output>
    ///////////////////////////////////////
    private _getfilesize() {
        let headers = { "Range": "bytes=0-1" };
        let output = {
            err: "",
            totalsize: 0,
            downloadsize: 0,
        };
        // GlobalService.consoleLog("发起get请求:" + sourceurl);
        let url = this.global.getBoxApi('downloadFile');
        return this.http.get(url, { fullpath: this.cache.sourceurl, disk_uuid: this.global.currDiskUuid }, true, headers, { needHeader: true, label: 'download' }, true)
            .then((res) => {
                let cache = this.cache;
                // GlobalService.consoleLog("服务器返回状态码：" + res.status);
                if (res.status != 200 && res.status != 206) {
                    output.err = "HTTP-SERVER_ERR-" + res.status;
                    return output
                }

                if (res.headers) {
                    GlobalService.consoleLog(JSON.stringify(res.headers));
                    let rangstr = res.headers["content-range"];
                    GlobalService.consoleLog("Rangstr:" + rangstr);
                    let re = rangstr.match(/bytes\s+(\d+)-(\d+)\/(\d+)/);
                    output.downloadsize = 0;
					output.totalsize = parseInt(re[3]);
					GlobalService.consoleLog("文件总大小：" + output.totalsize);
                }

                GlobalService.consoleLog("cache:" + JSON.stringify(this.cache));

                let need_full_download = false;
                if (cache.totalsize != output.totalsize || cache.totalsize == 0) {
                    need_full_download = true;
                }
                if (need_full_download) {
                    // GlobalService.consoleLog("开始保存第一次请求的文件数据");
                    let re = cache.desturi.match(/^(.*)\/([^\/^\?]+)(\?[^\?]+)?$/);
                    let filePath = re[1];
                    let fileName = re[2] + ".[Range==bytes=0--1=Total==" + output.totalsize + "].download";
                    let f = new File();
                    f.writeFile(filePath, fileName, "", { replace: true })
                        .then((res) => {
                            GlobalService.consoleLog("写文件结果:" + JSON.stringify(res));
                        })
                } else {
                    // GlobalService.consoleLog("历史文件检查无误，不需要完全重新下载");
                    output.downloadsize = cache.downloadsize;
                }

                GlobalService.consoleLog("获取文件大小成功:" + output.totalsize);
                return output;
            }, (res) => {
				GlobalService.consoleLog("Http请求出错" + JSON.stringify(res));
				throw new Error("Get file size error...");
            })

            //下载文件出现异常/////////////////////
            .catch(function(err) {
                if (err) {
                    output.err = err;
                    let d = JSON.stringify(err);
                    GlobalService.consoleLog("下载文件出现异常:" + d);
                } else {
                    output.err = "unkown error";
                }
                GlobalService.consoleLog("获取文件大小失败!!!!!!!!!!!!!!");
                return output;
            })
    }

    ///// 获取文件剩余文件一个块//////////////
    // @parameter: desturi 本地路径
    // @parameter: sourceurl 远端路径
    // @return Promise<output>
    ///////////////////////////////////////
    ab2str(u,f) {
           var b = new Blob([u]);
           var r = new FileReader();
           r.readAsText(b, 'utf-8');
           r.onload = () =>{if(f)f.call(null,r.result)}
    }
    public _downloadoneblock() {
        let self = this;
        let cache = this.cache;

        let totalsize = cache.totalsize;
        let downloadsize = cache.downloadsize;
        let desturi = cache.desturi;
        let sourceurl = cache.sourceurl;

        let range_start = parseInt(downloadsize);
        let range_end = range_start + this.oneBlockSize - 1;
        let headers = { "Range": "bytes=" + range_start + "-" + range_end };

        let re = desturi.match(/^(.*)\/([^\/^\?]+)(\?[^\?]+)?$/);
        let filePath = re[1];
        let fileName = re[2];


        let oldFileName = fileName + ".[Range==bytes=0-" + (range_start - 1) + "=Total==" + totalsize + "].download";
        let tmpFileName = Md5.hashStr(fileName) + ".downloading";
        let tmpFilePath = filePath + "/" + tmpFileName;

        // let url = this.global.getBoxApi('downloadFile') + "?fullpath=" + encode
        GlobalService.consoleLog("单块下载: [" + "bytes=" + range_start + "-" + range_end + "] to tmpfilePath:" + tmpFilePath);
        GlobalService.consoleLog("下载请求的路径" + sourceurl);
        return this.http.downloadFile(sourceurl, {
            filePath: filePath,
            tmpFileName: tmpFileName
        }, headers)
        //追加buf到已下载文件中保存
        .then((buf:any) => {
            let length = buf.byteLength;
            GlobalService.consoleLog("获取到文件长度：" + length +  "   buf.byteLength " );

            if(length !== Math.min(this.oneBlockSize, totalsize - range_start)) {
                GlobalService.consoleLog("下载大小不正确:" + this.oneBlockSize + "," + totalsize + "," + range_start + "," + length);
                throw new Error("下载的文件大小不正确");
            } else {
                GlobalService.consoleLog("追加buf到已下载文件中保存:" + oldFileName);
                return this.file.writeFile(filePath, oldFileName, buf, { append: true });
            }
        })
        //追加成功，移动到新文件
        .then(() => {
            GlobalService.consoleLog("追加成功，移动到新文件");
            if (totalsize > range_end + 1) {
                fileName += ".[Range==bytes=0-" + range_end + "=Total==" + totalsize + "].download";
            }
            // GlobalService.consoleLog("继续下载:" + fileName);

            //rename file
            return this.file.moveFile(filePath, oldFileName, filePath, fileName);
        })
        //返回结果
        .then(() => {
            return ["", range_end + 1]
        })
        //捕获异常
        .catch(error => {
            let errstr = "";
            // webrtc请求超时
            if (error && error == "RequestTimeout"){
                errstr = "requesttimeout";
            }
            // webrtc信道中断
            else if (error && error == "ChannelClosed"){
                errstr = "channelclosed";
            }
            // 其他错误
            else try {
                errstr = JSON.stringify(error);
            } catch (e) {
                errstr = JSON.stringify(e);
            }
            console.log("下载异常：" + errstr);
            return [errstr, range_end + 1];
        });
    }
}
