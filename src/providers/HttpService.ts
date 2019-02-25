import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from './Util';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
// import { HttpService } from './HttpService';
import { HTTP } from '@ionic-native/http';
import { Buffer } from 'safe-buffer'
import { Platform } from 'ionic-angular';
import { Lang } from './Language';
import 'rxjs/add/operator/toPromise';
import { Events } from 'ionic-angular';
import { Md5 } from 'ts-md5/dist/md5';
import { File } from '@ionic-native/file';
import * as FormData from 'form-data';
// import * as base64 from 'base64-js';
declare var window;
declare var cordova;
declare var TextDecoder;
@Injectable()
export class HttpService {
    maxBoxSdpRetryTimes = 10; //获取盒子sdp重试次数
    boxSdpRetryGap = 2000; //盒子获取sdp时间间隔
    networkTimeout = 15000; //网络超时时间
    dataChannelTimeout = 40000; //网络超时时间
    requestCheckGap = 1000; //channel状态检查间隙
    requestStorageTime = 10000; //请求缓存时间
    aliveIntervalTime = 10000; //保活时间
    aliveInterval = null; //保活的interval
    successiveConnectGap = 15000; //连续两次重试的间隔

    deviceSelected = null;

    boxSdpRetryTimes = 0; //获取盒子sdp已重试的次数
    connectBoxSdp: any = null; //连接的盒子的sdp
    // userBoxCheck: Boolean = false; //是否已查询过用户有无盒子
    sessionId = ""; //盒子会话id
    dataChannel = null; //盒子会话channel
    peerConnection: any = null; //盒子会话连接
    dataChannelOpen = "closed"; //"closed", "opening", "opended"
    cookies:any = {}; //盒子cookie保存
    createDataChannelPoint:number = 0; //上一次重建连接的时间点，用于超时检测


    globalRequestMap = {}; //已发送的回调
    globalWaitingList = []; //未发送队列
    globalCallbackList = []; //未发送的回调函数
    globalRequestManagerTimer = null; //channel管理器计时器

    lastReceivedTime:number = Date.now();

    iceServerConfig: any = {
        iceServers: [{
            // urls: ["turn:iamtest.yqtc.co:3478?transport=udp"],
            urls: ["turn:139.199.180.239:3478"],
            username: 'appuser',
            credential: 'appuser',
            credentialType: 'password'
        }]
        // { urls: ["stun:stun.l.google.com:19302"] }
    };

    constructor(
        private http: HTTP,
        private aHttp: Http,
        private file: File,
        private events: Events,
        private platform: Platform,
        private global: GlobalService
    ) {
        GlobalService.consoleLog("进入HttpService构造函数");
    }

    public initWebrtc() {
        this.global.useWebrtc = true;
        this.clearWebrtc();
        this.keepWebrtcAlive();
    }

    public keepWebrtcAlive() {
        this.channelStatusManager();
        this.keepAlive();
    }

    private keepAlive() {
        if(!this.aliveInterval) {
            this.aliveInterval = setInterval(()=>{
                if(!this.global.useWebrtc) {
                    clearInterval(this.aliveInterval);
                } else if(this.dataChannelOpen === 'opened') {
                    let url = this.global.getBoxApi('keepAlive');
                    GlobalService.consoleLog("发起保活请求发出------" + Date.now().toString());
                    this.webrtcRequest(url, 'post', {})
                    .catch(e => {
                        GlobalService.consoleLog(e.stack);
                    })
                }
            }, this.aliveIntervalTime);
        }
    }

    private channelStatusManager() {
        if(this.globalRequestManagerTimer) {
            clearTimeout(this.globalRequestManagerTimer);
            this.globalRequestManagerTimer = null;
        }
        this.globalRequestManagerTimer = setTimeout(()=>{
            if(!this.global.useWebrtc) {
                return;
            }
            this.globalRequestManagerTimer = setTimeout(()=>{
                this.channelStatusManager();
            }, this.requestCheckGap);
            switch(this.dataChannelOpen) {
                case 'opening':
                    // GlobalService.consoleLog("正在建立连接流程.........");
                    if(Date.now() - this.createDataChannelPoint > this.dataChannelTimeout) {
                        this.dataChannelOpen = 'closed';
                    } else {
                        break;
                    }
                case 'closed':
                    GlobalService.consoleLog(".............重新建立连接流程.............");
                    this.createDataChannel()
                    .catch(e => {
                        GlobalService.consoleLog(e);
                    })
                    break;
                case 'opened':
                    //debug
                    let channelState = this.dataChannel.readyState;
                    GlobalService.consoleLog("连接已建立：" + channelState);
                    if(Date.now() - this.lastReceivedTime > this.aliveIntervalTime * 6) {
                        GlobalService.consoleLog("--------连接超时，关闭信道-------" + Date.now() + "-------" + this.lastReceivedTime + '====信道状态====' + channelState);
                        this.dataChannelOpen = 'closed';
                        this.lastReceivedTime = Date.now();
                        this.dataChannel && this.dataChannel.close();
                        break;
                    }

                    while(this.globalWaitingList.length) {
                        let request = this.globalWaitingList.pop();
                        if(Date.now() - request.time < this.requestStorageTime) {
                            GlobalService.consoleLog("发送缓存的请求........." + request.url);
                            //强制刷新cookie
                            request.headers.cookie = this.getCookieString(request.url);
                            this[request.method](request.url, request.paramObj, request.errorHandler, request.headers)
                            .then(res => {
                                request.resolve(res);
                            }, res => {
                                request.reject(res);
                            })
                        }
                    }
                    while(this.globalCallbackList.length) {
                        let callback = this.globalCallbackList.pop();
                        callback();
                    }
                    break;
                case 'nobox':
                    while(this.globalCallbackList.length) {
                        // GlobalService.consoleLog("执行全局回调");
                        let callback = this.globalCallbackList.pop();
                        callback();
                    }
            }
        }, this.requestCheckGap)
    }

    public clearWebrtc() {
        // this.global.useWebrtc = false;
        this.dataChannelOpen = "closed";
        if(this.globalRequestManagerTimer) {
            clearTimeout(this.globalRequestManagerTimer);
            this.globalRequestManagerTimer = null;
        }
        clearInterval(this.aliveInterval);
        this.aliveInterval = null;
        for(let session in this.globalRequestMap) {
            let mySession = this.globalRequestMap[session];
            mySession.reject && mySession.reject("Channel closed");
            clearTimeout(mySession.timer);
            mySession.timer = null;
            delete this.globalRequestMap[session];
        }
        this.globalCallbackList = [];
        // this.peerConnection = null;
        this.lastReceivedTime = Date.now();
        this.sessionId = "";
        this.boxSdpRetryTimes = 0;
        this.sessionId = "";
        // this.cookies = {};
        // this.userBoxCheck = false;
        this.connectBoxSdp = null;
        if(this.dataChannel) {
             this.dataChannel.close();
             this.dataChannel = null;
        }
        if(this.peerConnection) {
             this.peerConnection.close();
             this.peerConnection = null;
        }
        // this.global.deviceSelected = null;
        // this.global.centerBoxSelected = null;
        // this.global.centerAvailableBoxList = [];
    }

    public get(url: string, paramObj: any, errorHandler: any = true, headers:any = {}, options:any = {}, cordova = false) {
        if (!url) {
            return new Promise((resolve, reject) => {
                resolve({
                    err_no: -1
                })
            })
        } else {
            paramObj = paramObj || {};
            // paramObj._t = Date.now();
            GlobalService.consoleLog("发出get请求:" + url);
            GlobalService.consoleLog("请求参数:" + this.toQueryString(paramObj));

            headers['X-Request-Id'] = this.getXRequestId();
            if (url.startsWith('http') || !this.global.useWebrtc) {
                if (cordova || this.global.platformName == "android") {
                // if (this.platform.is('cordova') || cordova) {
                    GlobalService.consoleLog("native的http请求;");
                    return this.http.get(url + this.toQueryString(paramObj), {}, headers)
                        .then(res => {
                            if(options.needHeader) {
                                return this.handleSuccess(url, res, errorHandler)
                            } else {
                                return this.handleSuccess(url, res.data, errorHandler)
                            }
                        })
                        // .catch(error => this.handleError(error, errorHandler));
                } else {
                    // GlobalService.consoleLog("非cordova的http请求");
                    // headers['withCredentials'] = true;
                    // let getHeaders = new Headers(headers);
                    return this.aHttp.get(url + this.toQueryString(paramObj))
                        .toPromise()
                        .then(res => {
                            if(options.needHeader) {
                                return this.handleSuccess(url, res, errorHandler)
                            } else {
                                return this.handleSuccess(url, res.json(), errorHandler)
                            }
                        })
                        .catch(error => this.handleError(error, errorHandler));
                }
            } else {
               //Webrtc
                if (this.dataChannelOpen === 'opened') {
                    // GlobalService.consoleLog("已经连接盒子sdp，直接get'");
                    return this.webrtcRequest(url, 'get', paramObj, headers)
                    .then((res:any) => {
                        if(options.needHeader) {
                            return this.handleSuccess(url, res, errorHandler)
                        } else {
                            return this.handleSuccess(url, res.json(), errorHandler)
                        }
                    })
                    .catch(error => this.handleError(error, errorHandler));
                } else {
                    GlobalService.consoleLog("缓存请求，稍后get..." + url);

                    return new Promise((resolve, reject) =>{
                         this.globalWaitingList.push({
                            url: url,
                            resolve: resolve,
                            reject: reject,
                            paramObj: paramObj,
                            errorHandler: errorHandler,
                            headers: headers,
                            method: 'get',
                            time: Date.now()
                        })
                    })
                }
            }
        }
    }

    public post(url: string, paramObj: any, errorHandler: any = true,  headers: any = {}, cordova = false) {
        url = url || '';
        headers['X-Request-Id'] = this.getXRequestId();
        if (url.startsWith('http') || !this.global.useWebrtc) {
            //接口可指明不使用webrtc模式，如果当前全局的rtc模式未开启，也使用普通模式
            return this._post(url, paramObj, headers, errorHandler, cordova);
        } else {
            if (this.dataChannelOpen === 'opened') {
                // GlobalService.consoleLog("已经连接盒子sdp，直接post'");
                return this.webrtcRequest(url, 'post', paramObj, headers)
                .then((res:any) => this.handleSuccess(url, res.data, errorHandler))
                    .catch(error => this.handleError(error, errorHandler));
            } else {
                GlobalService.consoleLog("缓存请求，稍后post..." + url);

                return new Promise((resolve, reject) =>{
                    this.globalWaitingList.push({
                        url: url,
                        resolve: resolve,
                        reject: reject,
                        paramObj: paramObj,
                        errorHandler: errorHandler,
                        headers: headers,
                        method: 'post',
                        time: Date.now()
                    })
                })
            }
        }
    }

    getXRequestId() {
        return this.global.deviceID + '_' + Date.now()
    }

    _post(url: string, paramObj: any, headers: any = {}, errorHandler: any = true, cordova = false) {
        if (!url) {
            GlobalService.consoleLog("无效请求");
            return new Promise((resolve, reject) => {
                resolve({
                    err_no: -1
                })
            })
        } else {
            GlobalService.consoleLog("发出post请求:" + url);
            GlobalService.consoleLog("请求参数:" + this.toBodyString(paramObj));

            if (cordova || this.global.platformName == "android") {
            // if (this.platform.is('cordova') || cordova) {
                return this.http.post(url, paramObj, headers)
                .then((res:any) => {
                    // if(res.headers && res.headers['set-cookie']) {
					// 	console.log(url + "需要设置cookie:" + res.headers['set-cookie']);
                    //     this.setCookie(url, res.headers['set-cookie']);
                    // }
                    return this.handleSuccess(url, JSON.parse(res.data), errorHandler)
                })
                .catch(error => this.handleError(error, errorHandler));
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                // headers['withCredentials'] = true;
                // headers['credentials'] = 'include';
                let postHeaders = new Headers(headers);
                return this.aHttp.post(url, this.toBodyString(paramObj), new RequestOptions({ headers: postHeaders,withCredentials: true}))
                    .toPromise()
                    .then((res:any) => {
                        console.log(url + "ahttp : + " +JSON.stringify(res))
                        // console.log(url +JSON.stringify(res.headers))

                        //   console.log(!!res.headers)
                        //   console.log(!!res.headers['set-cookie'])
                        // if(res.headers && res.headers['set-cookie']) {
                        //     console.log(url + "需要设置cookie:" + res.headers['set-cookie'][0]);
                        //     this.setCookie(url, res.headers['set-cookie'][0]);
                        // }
                        return this.handleSuccess(url, res.json(), errorHandler)
                    })
                    .catch(error => this.handleError(error, errorHandler));
            }
        }
    }

    public handleSuccess(url, result, errorHandler = true) {
        GlobalService.consoleLog("请求响应结果:" + JSON.stringify(result) + "请求url:" + url);

        //使用统一出错弹窗提示，如果针对错误有特殊处理，则需手动传入errorHandler为true
        var thisLanguage = Lang.ErrBox[result.err_no] || Lang.ErrBridge[result.err_no];
        if(result.status && result.status == 206) {
            return result;
        }
        var l = this.global.getAppLang();
        if (result.err_no === 30400) {
            this.global.createGlobalToast(this, { message: Lang.ErrBox[result.err_no].Title[l] });
        }
        if (result.err_no === 20010 || result.err_no === 1103) {
            var cookie = this.getCookieString(url);
            console.error("接口报错登录态失效:" + JSON.stringify(result));
            GlobalService.consoleLog("cookie:" + cookie);
            // this.global.logger("丢失cookie的URL:" + url);
            // this.global.logger("获取用户信息失败cookie:" + cookie);
            GlobalService.consoleLog("localStorage:" + JSON.stringify(window.localStorage));
        }
        //   result.err_no = 1503;
        if (result.err_no === 1502) {
            this.global.boxStatus = false;
            this.global.createGlobalToast(this, { message: Lang.ErrBox[result.err_no].Title[l] });
        } else {
            this.global.boxStatus = true;
        }

        if (result && result.err_no !== 0 && errorHandler) {
            let handlers = thisLanguage;
            if (handlers) {
                //弹出err_msg的内容
                if (handlers.action) {
                    var buttons = [];
                    if(thisLanguage.ButtonText.length) {
                        for(let i = 0; i < thisLanguage.ButtonText.length; i++) {
                            buttons.push({
                                text: thisLanguage.ButtonText[i] && thisLanguage.ButtonText[i][l] || this.global.L('WORDd0ce8c46'),
                                handler: () => {
                                    // throw new Error(result.err_msg);
                                    handlers.action[i] && handlers.action[i].call(this, this);
                                    // this.events.publish('token:expired', Date.now());
                                }
                            });
                        }
                    } else {
                        buttons.push({
                            text: thisLanguage.ButtonText && thisLanguage.ButtonText[l] || this.global.L('WORDd0ce8c46'),
                            handler: () => {
                                // throw new Error(result.err_msg);
                                handlers.action && handlers.action.call(this);
                                // this.events.publish('token:expired', Date.now());
                            }
                        });
                    }
                    this.global.createGlobalAlert(this, {
                        title: thisLanguage.Title[l] || handlers.title,
                        subTitle: thisLanguage.Subtitle[l] || handlers.subtitle,
                        enableBackdropDismiss: false,
                        buttons: buttons
                    })
                } else {
                    this.global.createGlobalToast(this, {
                        message: thisLanguage.Title[l] || handlers.title,
                    });
                    return result;
                }
            } else {
                this.global.createGlobalToast(this, {
                    message: thisLanguage.UnkownError[l] || "未知错误",
                });
                return result;
            }
        } else if (result.err_no < 0 && errorHandler) {
            this.global.createGlobalToast(this, {
                message: Lang.SystemError[l] || "系统错误，请稍候再试",
            });
            return result;
        }
        return result;
        // return new Promise
    }


    public getCookieString(url) {
        if(!url.startsWith('http') && this.global.useWebrtc) {
            let boxId = this.deviceSelected && this.deviceSelected.boxId;
            // GlobalService.consoleLog('-----获取cookie-----' + boxId + "," +  this.cookies[boxId])
            return this.cookies[boxId] || "";
        } else {
            return this.http.getCookieString(url);
        }
    }

    public setCookie(url, cookie) {
        // document.cookie = cookie + ";Domain=" + GlobalService.centerApiDomain[GlobalService.ENV];
        if(this.platform.is('cordova')) {
           this.http.setCookie(url, cookie);
        }
    }

     /**
       * @param obj　参数对象
       * @return {string}　参数字符串
       * @example
       *  声明: var obj= {'name':'小军',age:23};
       *  调用: toQueryString(obj);
       *  返回: "?name=%E5%B0%8F%E5%86%9B&age=23"
       */
      private toQueryString(obj) {
          // let ret = [];
          // for (let key in obj) {
          //   key = encodeURIComponent(key);
          //   let values = obj[key];
          //   if (values && values.constructor == Array) { //数组
          //     let queryValues = [];
          //     for (let i = 0, len = values.length, value; i < len; i++) {
          //       value = values[i];
          //       queryValues.push(this.toQueryPair(key, value));
          //     }
          //     ret = ret.concat(queryValues);
          //   } else { //字符串
          //     ret.push(this.toQueryPair(key, values));
          //   }
          // }
          // return '?' + ret.join('&');

          if (obj && JSON.stringify(obj) !== '{}') {
              var ret = this.toBodyString(obj);
              return '?' + ret;
          } else {
              return "";
          }

      }

    private handleError(error: Response | any = {}, errorHandler = true) {
        // GlobalService.consoleLog("==================");
        var l = this.global.getAppLang();
        if (!errorHandler) {
            GlobalService.consoleLog("接口设定无需处理网络情况");
            return { success: false, msg: Lang.NetworkError[l] };
        }
        GlobalService.consoleLog("json解析失败" + JSON.stringify(error));
        let msg = Lang.RequestError[l] || '请求失败';
        GlobalService.consoleLog("关闭loading");
        this.global.closeGlobalLoading(this);

        msg = Lang.SystemError[l] || "网络错误，请稍候再试";

        // if(this.dataChannelOpen) {
        //     this.clearWebrtc();
        // }

        if (this.global.networking) {
            msg = error.err_msg || msg;
            this.global.createGlobalToast(this, {
                message: msg,
            });
        } else {
            this.global.createGlobalAlert(this, {
                subTitle: Lang.ConnectNetworkError[l] || '无法连接网络，请检查网络情况！',
                enableBackdropDismiss: false,
                buttons: [{
                    text: Lang.Ok[l] || '确定'
                }]
            })
        }
        return { success: false, msg: msg };
    }

    private toBodyString(obj) {
        let ret = [];
        for (let key in obj) {
            key = encodeURIComponent(key);
            let values = obj[key];
            if (values && values.constructor == Array) { //数组
                let queryValues = [];
                for (let i = 0, len = values.length, value; i < len; i++) {
                    value = values[i];
                    queryValues.push(this.toQueryPair(key, value));
                }
                ret = ret.concat(queryValues);
            } else { //字符串
                ret.push(this.toQueryPair(key, values));
            }
        }
        return ret.join('&');
    }

    private toQueryPair(key, value) {
        if (typeof value == 'undefined') {
            return key;
        }
        return key + '=' + encodeURIComponent(value === null ? '' : String(value));
        // return key + '=' + (value === null ? '' : String(value));
    }

    selectBox(box) {
        this.deviceSelected = {
            version: "",
            friendlyName: box.boxid,
            bindUserHash: Md5.hashStr(this.global.centerUserInfo.uname.toLowerCase()).toString(),
            boxId: box.boxid,
            bindUser: this.global.centerUserInfo.uname
        }
    }

    /**
     * [getFileLocalOrRemote 获取文件，若本地存在则使用本地，否则通过远程下载]
     * @param {[type]} remoteUrl [远程文件夹路径，不包含文件名]
     * @param {[type]} localPath [本地文件夹路径，不包含文件名]
     * @param {[type]} name      [文件名称]
     * @param {[type]} fileSubPath [本地文件夹下的文件类型的子目录名字]
     */
    getFileLocalOrRemote(remoteUrl, localPath, name, fileSubPath) {
        remoteUrl = remoteUrl.replace(/\/$/, '') + "/";
        localPath = localPath.replace(/\/$/, '') + "/";
        //第1步，判断本地是否存在，若存在则直接使用
        return this.file.checkFile(localPath, name)
        .then(res => {
            GlobalService.consoleLog("目标文件存在:" + name + JSON.stringify(res));
            //文件已存在
            return localPath + name;
        }, res => {
            GlobalService.consoleLog("目标文件不存在:" + name + JSON.stringify(res));
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

    /**
     * [downloadRemoteFile 从服务器上下载文件]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     */
    downloadRemoteFile(remoteUrl, localPath, name, fileSubPath) {
        return this.downloadRemoteFileData(remoteUrl, localPath, name)
        .catch(e => {
            //文件夹不存在
            GlobalService.consoleLog("写文件失败，创建文件夹");
            return this.file.createDir(this.global.fileSavePath, fileSubPath, false)
            .then((res: any) => {
                //创建文件夹成功..
                GlobalService.consoleLog("创建文件夹成功，重新写文件");
                return this.downloadRemoteFileData(remoteUrl, localPath, name);
            })
            .catch(e => {
                GlobalService.consoleLog("文件夹已存在，直接写文件");
                //文件夹正在创建...
                return this.downloadRemoteFileData(remoteUrl, localPath, name);
            })
        })
    }

    /**
     * [downloadRemoteFileData 从远程获取文件的数据]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     */
    downloadRemoteFileData(remoteUrl, localPath, name) {
        var url = this.global.getBoxApi('downloadFile');
        GlobalService.consoleLog(`远程目录${remoteUrl},本地目录${localPath},文件名${name}`)
        if(!this.global.useWebrtc) {
            return this.http.downloadFile(url, {
                fullpath: remoteUrl + name
            }, {}, localPath + name)
            .then(data => {
                //检查文件是否合法
                return this.file.readAsText(localPath, name)
            })
            .then((res: any) => {
                try {
                    let data = JSON.parse(res);
                    if(data.err_no === 1401) {
                        GlobalService.consoleLog("远端文件不存在...." + remoteUrl + name);
                        return this.file.removeFile(localPath, name)
                        .then(res => {
                            return false;
                        })
                    } else {
                        return false;
                    }
                } catch(e) {
                    return true;
                }
            })
        } else {
            GlobalService.consoleLog("webrtc下载");
            return new Promise((resolve, reject) => {
                this.webrtcRequest(url, 'get', {
                    fullpath: remoteUrl + name
                }, {
                   "Range": "bytes=0-"
                })
                .then((res:any) => {
                    GlobalService.consoleLog("文件下载结果：" + res.status)
                    //debug
                    // resolve(true);
                    //下载成功，需手动写文件
                    if(res.status === 200 || res.status === 206) {
                        this.file.writeFile(localPath, name, res.data)
                        .then(res => {
                            GlobalService.consoleLog("写文件：" + JSON.stringify(res));
                            return this.file.checkFile(localPath, name)
                        })
                        .then(res => {
                            GlobalService.consoleLog("CheckFIle:" + JSON.stringify(res));
                            resolve(true);
                        })
                        .catch(e => {
                            reject(false);
                        })
                    } else {
                        reject(false);
                    }
                }, (res:any) => {
                    GlobalService.consoleLog("webrtc请求reject......");
                    reject(false);
                })
            })
        }
    }

    downloadFile(remoteUrl, params, headers, forceLocal = false) {
        GlobalService.consoleLog("开始下载任务");
        var url = this.global.getBoxApi('downloadFile');
        GlobalService.consoleLog(`下载url: ${url}, 远端路径: ${remoteUrl}, 文件路径:${params.filePath}, 临时文件：${params.tmpFileName}`);
        if(!this.global.useWebrtc || forceLocal) {
            return this.http.downloadFile(url, {
                fullpath: remoteUrl
            }, headers, params.filePath + '/' + params.tmpFileName)
           .then((res) => {
                // GlobalService.consoleLog("下载成功，读取下载的文件到buf：" + JSON.stringify(res));
                return this.file.readAsArrayBuffer(params.filePath, params.tmpFileName)
                .then(buf => {
                    this.file.removeFile(params.filePath, params.tmpFileName)
                    return buf;
                })
            })
        } else {
            GlobalService.consoleLog("webrtc下载");
            return new Promise((resolve, reject) => {
                this.webrtcRequest(url, 'get', {
                    fullpath: remoteUrl
                }, headers)
                .then((res:any) => {
                    // GlobalService.consoleLog("成功返回:" + JSON.stringify(res));
                    // GlobalService.consoleLog(typeof res.data)
                    resolve(res.data);
                }, (res:any) => {
                    reject(res);
                })
            })
        }
    }

    backupFile(localPath, fileName, albumId, deviceId) {
        let uri = this.global.getBoxApi('uploadCopyAlbums');
        return this.http.uploadFile(uri, {
            path: "/" + albumId + "/" + fileName,
            equip_id: this.global.deviceID
        }, {}, localPath, "file");
    }

    uploadFile(uploadUrl, params, tmpFilePath, tmpFileName, data:any) {
        GlobalService.consoleLog("开始上传---..." + data.byteLength)
        let url = this.global.getBoxApi('uploadFileBreaking');
        if(!this.global.useWebrtc) {
            GlobalService.consoleLog("临时文件路径：" + tmpFilePath + "---" + tmpFileName);
            //使用直连模式
            return this.file.writeFile(tmpFilePath, tmpFileName, data, {
                replace: true
            })
            .then((res) => {
                GlobalService.consoleLog("写文件成功，开始上传文件" + tmpFilePath + "-----" + tmpFileName);
                return this.http.uploadFile(url, params, {}, tmpFilePath + tmpFileName, "file")
            }, res => {
                GlobalService.consoleLog("写文件失败：" + JSON.stringify(res));
                throw new Error("Write file failed");
            })
        } else {
            //webrtc
            return new Promise((resolve, reject) => {
                var form = new FormData();
                var buf = new Buffer('');
                let r = Date.now();

                form.on("data", (d) => {
                    // GlobalService.consoleLog("文件数据接收事件:" + (d.length || d.byteLength));
                    buf = Buffer.concat([buf, new Buffer(d)]);
                })

                form.on("end", () => {
                    // GlobalService.consoleLog("文件数据接收完毕");
                    this.webrtcRequest(url, 'post', buf, {
                        'Content-Type': form.getHeaders({})['content-type']
                    })
                    .then(resolve, reject);
                })
                form.append("range",params.range);
                form.append("path",params.path);
                form.append("name",params.name);

                form.append("file", new Buffer(data), {
                    filename: params.name
                });
                form.resume();
                GlobalService.consoleLog("文件数据已发送");
            })

        }

    }

    createDataChannel() {
        GlobalService.consoleLog("webrtc创建盒子连接: 开始");
        this.dataChannelOpen = "opening";
        this.createDataChannelPoint = Date.now();

        return new Promise((gResolve, gReject) => {
            // setTimeout(()=>{
            //     if(this.dataChannelOpen === 'opening') {
            //         this.dataChannelOpen = 'closed';
            //         gReject && gReject('closed');
            //     }
            //     return "";
            // }, this.dataChannelTimeout);

            this._post(GlobalService.centerApi["getBoxList"].url, {})
                .then((res: any) => {
                    GlobalService.consoleLog(res);
                    if (res.err_no === 0) {
                        GlobalService.consoleLog("webrtc创建盒子连接: 获取盒子列表成功");
                        let centerBoxList = res.boxinfo || [];
                        if (centerBoxList.length > 0) {
                            GlobalService.consoleLog("webrtc创建盒子连接: 用户拥有盒子，查询盒子在线状态");
                            let centerAvailableBoxList = centerBoxList.filter(item => item.sdp_register === 1);
                            GlobalService.consoleLog("webrtc创建盒子连接: 在线盒子数目：" + centerAvailableBoxList.length);
                            if (centerAvailableBoxList.length > 0) {
                                // GlobalService.consoleLog("设定用户盒子");
                                let deviceSelected = centerAvailableBoxList[0];
                                // GlobalService.consoleLog("重新连接以后盒子是否一致：" + this.global.deviceSelected.boxId === this.global.centerBoxSelected.boxid)
                                this.selectBox(deviceSelected);
                                // GlobalService.consoleLog("默认选择盒子:" + this.global.centerBoxSelected.boxid);
                            } else {
                                this.deviceSelected = null;
                            }
                            return this.deviceSelected;
                        } else {
                            //用户没有盒子
                            // this.userBoxCheck = true;
                            this.dataChannelOpen = 'nobox';
                            this.deviceSelected = null;
                            return Promise.reject("nobox");
                        }
                    } else {
                        GlobalService.consoleLog("webrtc创建盒子连接: 获取盒子列表失败");
                        return Promise.reject("Get box list error.");
                    }
                })
                .then((res: any) => {
                    if (res && res.boxId) {
                        GlobalService.consoleLog("webrtc创建盒子连接: 当前有盒子在线，获取盒子sdp");
                        return this.getBoxSdp(res.boxId);
                    } else {
                        GlobalService.consoleLog("webrtc创建盒子连接: 当前没有盒子在线");
                        // this.userBoxCheck = true;
                        this.dataChannelOpen = 'nobox';
                        //用户没有盒子
                        return Promise.reject("nobox");
                    }
                })
                .then((sdp: any) => {
                    GlobalService.consoleLog("webrtc创建盒子连接: 获取sdp成功:" + JSON.stringify(sdp));
                    try {
                        this.connectBoxSdp = JSON.parse(sdp);
                    } catch (e) {
                        GlobalService.consoleLog("webrtc创建盒子连接: 解析sdp失败：" + sdp);
                    }
                    this.sessionId = this.getSessionIdFromSDP(this.connectBoxSdp.sdp);
                    // GlobalService.consoleLog("解析sessionid:" + this.sessionId);
                    this.createPeerConnection(gResolve, gReject);
                    GlobalService.consoleLog("webrtc创建盒子连接: 连接对象建立完毕，开始SDP应答：" + JSON.stringify(this.connectBoxSdp));
                    try {
                       return this.peerConnection.setRemoteDescription(this.connectBoxSdp);
                    } catch(e) {
                        GlobalService.consoleLog("box sdp异常");
                        let sdp = new RTCSessionDescription();
                        sdp.type = this.connectBoxSdp.type;
                        sdp.sdp = this.connectBoxSdp.sdp;
                        return this.peerConnection.setRemoteDescription(sdp);
                    }
                })
                .then((res: any) => {
                    GlobalService.consoleLog("webrtc创建盒子连接: SDP应答成功:" + JSON.stringify(res));
                    if ('offer' === this.connectBoxSdp.type) {
                        return this.sendAnswer();
                    } else {
                        throw new Error("Box sdp type not equal to offer.");
                    }
                })
                .catch((e: any) => {
                    GlobalService.consoleLog("webrtc创建盒子连接: 建立连接流程出错:" + JSON.stringify(e));
                    this.global.closeGlobalLoading(this);
                    if(this.dataChannelOpen !== 'nobox') {
                        console.log("webrtc创建盒子连接: 手动关闭远程连接.....");
                        setTimeout(()=>{
                            this.dataChannelOpen = "closed";
                        }, this.successiveConnectGap)
                    } else {
                        this.global.deviceSelected = null;
                    }
                    // if(this.deviceSelected) {
                    //     //盒子已掉线
                    //     if(this.global.centerBoxSelected === null) {
                    //         this.global.deviceSelected = null;
                    //         this.global.createGlobalAlert(this, {
                    //             title: "您的盒子已经离线",
                    //             buttons: [{
                    //                 text: "重试",
                    //                 handler: () => {
                    //                     this.dataChannelOpen = "closed";
                    //                 }
                    //             }, {
                    //                 text: "前往首页",
                    //                 handler: () => {
                    //                     this.events.publish('token:expired');
                    //                 }
                    //             }]
                    //         });
                    //     }
                    // }

                    // if(!this.userBoxCheck) {
                    //     GlobalService.consoleLog("用户连接盒子的时候出现错误");
                    //     gReject && gReject(e);
                    // } else {
                    //     GlobalService.consoleLog("用户没有在线的盒子");
                    //     //用户没有盒子
                    //     gResolve && gResolve();
                    // }
                    gResolve(null);
                })
        }).then((res)=>{
            GlobalService.consoleLog("webrtc创建盒子连接: 建立连接成功.....");
            return res
        }).catch((res)=>{
            GlobalService.consoleLog("webrtc创建盒子连接: 建立连接失败.....");
            return Promise.reject(res)
        });
    }

    sendAnswer() {
        try {
            GlobalService.consoleLog("sendAnswer支持promise");
            return this.peerConnection.createAnswer()
            .then(sdp => {
                //qbing test add
                return this.peerConnection.setLocalDescription(sdp);
                // return this.sendLocalSdp(sdp);
            })
        } catch(e) {
            GlobalService.consoleLog("sendAnswer不支持promise");
            return new Promise((resolve, reject) => {
                this.peerConnection.createAnswer((sdp) => {
                    // GlobalService.consoleLog("发送应答:" + JSON.stringify(sdp));
                    this.peerConnection.setLocalDescription(sdp);
                    //qbing ????? why delete
                    //
                    // .then(res => {
                    //     resolve(res);
                    // })
                }, (e)=>{
                    GlobalService.consoleLog("创建应答失败");
                    reject(e);
                })
            })
        }
    }

    createPeerConnection(resolve, reject) {
        GlobalService.consoleLog("开始创建连接对象");
        let myRTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection  || window.webkitRTCPeerConnection;
        GlobalService.consoleLog("RTCPeerConnection支持情况：" + !!window.RTCPeerConnection + "," + !!window.mozRTCPeerConnection + "," + !!window.webkitRTCPeerConnection)
        this.peerConnection = new myRTCPeerConnection(this.iceServerConfig);

        this.peerConnection.onicecandidate = (evt) => {
            // GlobalService.consoleLog('onicecandidate.............');
            var candidate = evt.candidate;
            if (null == candidate) {
                GlobalService.consoleLog("Finished gathering ICE candidates. Start to send local sdp.");
                this.sendLocalSdp(this.peerConnection.localDescription);
                return;
            } else {
                GlobalService.consoleLog("addIceCandidate:" + JSON.stringify(candidate));
                this.peerConnection.addIceCandidate(candidate);
            }
        }
        this.peerConnection.onnegotiationneeded = () => {
            GlobalService.consoleLog('onnegotiationneeded.............')
            // this.sendOffer();
        }
        this.peerConnection.ondatachannel = (dc) => {
            // GlobalService.consoleLog('................ondatachannel............');
            this.dataChannel = dc.channel;
            this.prepareDataChannel(resolve, reject);
        }
    }

    ab2str(buf) {
        var decoder = new TextDecoder("utf-8");
        return decoder.decode(new Uint8Array(buf));
        // return Buffer.from(buf, 'binary').toString('binary');
    }

    generateRandom() {
        return Date.now().toString();
    }

    webrtcRequest(url: string, method: string, paramObj: any, headers: any = {}) {
        var start = Date.now(),
            maxTime = 5000;
        return new Promise((resolve, reject) => {
            var __request = (_url, _paramObj) => {
                if (this.dataChannelOpen === 'opened') {
                    var r: string = this.generateRandom();
                    let logprefix = "session:" + r + ",url:" + url + " :";

                        let timer = setTimeout(() => {
                        if (this.globalRequestMap[r]) {
                            GlobalService.consoleLog(logprefix + "超时");
                            if(this.globalRequestMap[r]) {
                                this.globalRequestMap[r].reject && this.globalRequestMap[r].reject("timeout");
                            }
                            delete this.globalRequestMap[r];
                        }
                    }, this.networkTimeout);

                    this.globalRequestMap[r] = {
                        resolve: resolve,
						reject: reject,
						url: url,
                        timer: timer
                    };
                    this.sendMessage(url, method, paramObj, r, headers);
                } else {
                    if (Date.now() - start < maxTime) {
                        //通道未建立完成，等待200毫秒后重试
                        setTimeout(() => {
                            __request(_url, _paramObj);
                        }, 200);
                    } else {
                        //通道未建立完成，并且已超时
                        GlobalService.consoleLog("通道未建立完成，请求超时:" + url + ",reject Promise")
                        reject && reject({
                            err_no: -9999,
                            err_msg: "连接超时"
                        });
                    }
                }
            };
            __request(url, paramObj);
        })
    }

    prepareDataChannel(resolve, reject) {
        let channel = this.dataChannel;
        channel.onopen = () => {
            GlobalService.consoleLog("webrtc创建盒子连接: ---------------Data channel opened----------------");
            this.dataChannelOpen = "opened";
            this.global.useWebrtc = true;
            this.global.deviceSelected = this.deviceSelected;
            let url = this.global.getBoxApi('keepAlive');
            GlobalService.consoleLog("webrtc创建盒子连接: 启动keepAlive");
            this.keepWebrtcAlive();
            this.webrtcRequest(url, 'post', {})
            .then((res:any) => {
                if(res.status === 200 && res.data.err_no === 0) {
                    this.global.deviceSelected.version = res.data.version;
                    //填充盒子版本号
                    resolve && resolve(this.global.deviceSelected);
                } else {
                    reject && reject(this.global.deviceSelected);
                }
            })
            .catch(e => {
                reject && reject(this.global.deviceSelected);
            })
            // this.startChat();
        }
        channel.onclose = () => {
            GlobalService.consoleLog("Data channel closed.");
            // this.clearWebrtc();
            this.dataChannelOpen = "closed";
            this.peerConnection.close()
        }
        channel.onerror = () => {
            GlobalService.consoleLog("Data channel error!!");
            // reject && reject();
        }
        channel.onbufferedamountlow = (res) => {
            GlobalService.consoleLog("onbufferedamountlow");
            GlobalService.consoleLog(JSON.stringify(res));
        }
        channel.onmessage = (msg) => {
            GlobalService.consoleLog("Message received!!");
            var recvStr = this.ab2str(msg.data);
            GlobalService.consoleLog("Test:" + recvStr.slice(0, 200) + "..." + recvStr.slice(-50))
            this.lastReceivedTime = Date.now();
            let session;
            try {
                var recv: any = JSON.parse(recvStr);
                var resultHeaders = JSON.parse(recv.header);
                var body:any;
				let headers = {};
                for(let h in resultHeaders) {
                    headers[h.toLowerCase()] = resultHeaders[h][0];
                }
                session = headers["request-session"];
                GlobalService.consoleLog("session:" + session);

                if(headers["set-cookie"]) {
                    GlobalService.consoleLog("需要设置cookie");
					this.cookies[this.deviceSelected.boxId] = headers["set-cookie"];
					this.setCookie(this.globalRequestMap[session].url, headers["set-cookie"]);
                }
                //是否为文件下载
                if(headers['content-range']) {
                    // GlobalService.consoleLog("下载接口数据转换---------");
                    // body = base64.toByteArray(recv.body);
                    // GlobalService.consoleLog(body)
                    let dataBody = Buffer.from(recv.body, 'base64')
                    body = new ArrayBuffer(dataBody.length);
                    let view = new Uint8Array(body);
                    for(var i = 0; i < dataBody.length; i++) {
                        view[i] = dataBody[i];
                    }
                } else {
                    let dataBody = Buffer.from(recv.body, 'base64').toString('utf-8');
                    body = JSON.parse(dataBody);
                    GlobalService.consoleLog("响应数据：" + dataBody);
                }

                GlobalService.consoleLog("接口响应耗时:" + (Date.now() - session));
                if (session && this.globalRequestMap[session] && this.globalRequestMap[session].resolve) {
                    GlobalService.consoleLog("进入成功回调:" + session + ",url:" + this.globalRequestMap[session].url);
                    clearTimeout(this.globalRequestMap[session].timer);
                    this.globalRequestMap[session].resolve({
                        status: recv.code,
                        headers: headers,
                        data: body
                    });
                    delete this.globalRequestMap[session];
                } else {
                    GlobalService.consoleLog("执行post回调异常!!!!!!!!!!!!!!");
                }
            } catch (e) {
                if (session && this.globalRequestMap[session] && this.globalRequestMap[session].reject) {
                    GlobalService.consoleLog("进入失败回调:" + session + ",url:" + this.globalRequestMap[session].url);
                    clearTimeout(this.globalRequestMap[session].timer);
                    this.globalRequestMap[session].reject({
                        status: recv.code,
                        data: body
                    });
                    delete this.globalRequestMap[session];
                }
                GlobalService.consoleLog("解析出错:" + JSON.stringify(e) + e.stack + e.message)
            }
        }
    }

    sendLocalSdp(sdp) {
        GlobalService.consoleLog("开始上传本地sdp...");
        var localSdp = {
            type: sdp.type,
            sdp: sdp.sdp,
            myrandsessionid: this.sessionId
        }

        return this._post(GlobalService.centerApi["submitLocalSdp"].url, {
                box_id: this.deviceSelected.boxId,
                app_sdp: JSON.stringify(localSdp)
            })
            .then((res: any) => {
                GlobalService.consoleLog(res);
                if (res.err_no === 0) {
                    GlobalService.consoleLog("上传本地sdp成功:" + JSON.stringify(localSdp));
                } else {
                    GlobalService.consoleLog("Sdp上传失败");
                    //alert(res.err_msg || "app上传sdp错误")
                    throw new Error("Send sdp file failed");
                }
                return res;
            })
    }

    getBoxSdp(id) {
        return new Promise((resolve, reject) => {
            this._post(GlobalService.centerApi["getBoxSdpById"].url, {
                    box_id: id
                })
                .then(res => {
                    if (res.err_no === 0 && res.box_sdp) {
                        //设置用户名和密码
                        this.iceServerConfig.iceServers[0].username = res.turn_user;
                        this.iceServerConfig.iceServers[0].credential = res.turn_password;
                        this.iceServerConfig.iceServers[0].urls = [res.domain];
                        GlobalService.consoleLog(`用户名：${res.turn_user}, 密码：${res.turn_password}`);
                        resolve(res.box_sdp);
                    } else {
                        if (this.boxSdpRetryTimes >= this.maxBoxSdpRetryTimes) {
                            reject({
                                err_no: -10,
                                err_msg: "Connect box timeout"
                            });
                        } else {
                            this.boxSdpRetryTimes++;
                            setTimeout(() => {
                                this.getBoxSdp(id);
                            }, this.boxSdpRetryGap);
                        }
                    }
                })
                .catch(e => {
                    GlobalService.consoleLog("获取sdp出错:" + e.stack);
                    throw new Error("获取sdp出错.....");
                })
        })

    }

    getSessionIdFromSDP(sdp: string) {
        GlobalService.consoleLog("开始解析session")
        if (!sdp) {
            return "";
        }
        let session: string = sdp.split("\r\n")[1].split(" ")[1];
        GlobalService.consoleLog("session解析完毕" + session);
        return session;
    }

    sendMessage(url: string, method: string, paramObj: any, sessionId: string, headers:any = {}) {
        let body = paramObj;
        let _url = url;
        if(method === 'post') {
            if(paramObj instanceof Buffer) {
                GlobalService.consoleLog("发送Buffer数据:" + (paramObj.length));
                body = paramObj;
            } else if(typeof paramObj === 'object') {
                body = new Buffer(this.toBodyString(paramObj));
            }
            body = body.toString('base64');
        } else {
            body = '';
            _url += this.toQueryString(paramObj);
        }

        GlobalService.consoleLog("发出WEBRTC post请求," + "session:" + sessionId + ", url:" + _url);
        GlobalService.consoleLog("请求参数:" + body);
        GlobalService.consoleLog("cookie:" + this.getCookieString(url));
        headers['request-session'] = sessionId;
        headers['cookie'] = this.getCookieString(url);
        headers['Content-Type'] = (headers['Content-Type'] || 'application/x-www-form-urlencoded') + '; charset=UTF-8';
        headers['Accept'] = 'application/json, text/plain, */*';
        for(let h in headers) {
            headers[h] = [headers[h]];
        }
        // GlobalService.consoleLog("请求头部:" + JSON.stringify(headers));
        try {
            var data = {
                url: _url,
                method: method,
                header: JSON.stringify(headers),
                bodyLength: body.length
            };

            var str = new Buffer(JSON.stringify(data) + "$BOUNDARY$" + body + "\n");
            GlobalService.consoleLog("session:" + sessionId
                + ",数据发送长度:" + body.length + "," + str.length
                + ",state:" + this.dataChannelOpen + "," + this.dataChannel.readyState
                + ",bufferedAmount:" + this.dataChannel.bufferedAmount + "," + this.dataChannel.bufferedAmountLowThreshold);
            this.dataChannel.send(str);
        } catch (e) {
            GlobalService.consoleLog("发送数据出错，RTCDataChannel.readyState=", this.dataChannel.readyState);
            GlobalService.consoleLog("发送数据出错:"+ JSON.stringify(e) + ", session:" + sessionId + ", url:" + _url);
            if (sessionId && this.globalRequestMap[sessionId] && this.globalRequestMap[sessionId].reject) {
                GlobalService.consoleLog("发送数据出错, reject:" + sessionId);
                clearTimeout(this.globalRequestMap[sessionId].timer);
                this.globalRequestMap[sessionId].reject({
                    status: -1,
                    data: ""
                });
                delete this.globalRequestMap[sessionId];
            }
        }
    }

}
