import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { NavController, NavParams } from 'ionic-angular';
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
import { FileTransport } from './FileTransport';
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
	aliveIntervalTime = 30000; //保活时间
	// aliveInterval = null; //保活的interval
	successiveConnectGap = 15000; //连续两次重试的间隔

	deviceSelected = null;
	channelLabels = ["webrtcdc", "upload", "download"];
	boxSdpRetryTimes = 0; //获取盒子sdp已重试的次数
	connectBoxSdp: any = null; //连接的盒子的sdp
	// userBoxCheck: Boolean = false; //是否已查询过用户有无盒子
	sessionId = ""; //盒子会话id
	// dataChannel = null; //盒子会话channel
	peerConnection: any = null; //盒子会话连接
	// dataChannelOpen = "closed"; //"closing", "closed", "opening", "opended"
	cookies: any = {}; //盒子cookie保存
	// createDataChannelPoint: number = 0; //上一次重建连接的时间点，用于超时检测
	channels:any = {}; //所有的datachannels
    webrtcEngineStatus          = "stoped";     //"closing", "closed", "opening", "opended"
    webrtcEngineLastAliveTime   = Date.now();   //最后活跃时间
    webrtcEngineRestartTimer    = null;         //开启重试定时器

	globalRequestMap = {}; //已发送的回调
	globalWaitingList = {}; //未发送队列
	globalCallbackList = {}; //未发送的回调函数
	// globalRequestManagerTimer = null; //channel管理器计时器

	// lastReceivedTime: number = Date.now();

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
        private global: GlobalService,
	) {
		GlobalService.consoleLog("进入HttpService构造函数");
		this.channelLabels.forEach(item => {
			this.channels[item] = {};
			this.globalCallbackList[item] = {};
			this.globalWaitingList[item] = {};
		})
	}


	public keepWebrtcAlive(label) {
		let dataChannel = this.channels[label];
		if (!dataChannel.aliveInterval) {
			dataChannel.aliveInterval = setInterval(() => {
				if (!this.global.useWebrtc) {
					clearInterval(dataChannel.aliveInterval);
				} else if (!this.rateLimit(label) && dataChannel.status === 'opened') {
					let url = this.global.getBoxApi('keepAlive');
					GlobalService.consoleLog("发起保活请求发出------" + Date.now().toString());
					this.webrtcRequest(url, 'post', {}, {}, {
						channelLabel: label
					})
					.catch(e => {
						GlobalService.consoleLog(e.stack);
					})
				}else{
                    GlobalService.consoleLog("发起保活tick ignore: dataChannel.status:" + dataChannel.status);
                }
			}, this.aliveIntervalTime);
		}
	}

	private channelStatusManager(label) {
		let dataChannel = this.channels[label],
			channel = dataChannel.channel;
		if (dataChannel.statusTimer) {
			clearTimeout(dataChannel.statusTimer);
			dataChannel.statusTimer = null;
		}
		dataChannel.statusTimer = setTimeout(() => {
			if (!this.global.useWebrtc) {
				return;
			}
			//自调用
			dataChannel.statusTimer = setTimeout(() => {
				this.channelStatusManager(label);
			}, this.requestCheckGap);

            if(!dataChannel.status == undefined) {
                return false;
            }

            switch (this.webrtcEngineStatus){
                case 'opening':
                    if (Date.now() - this.webrtcEngineLastAliveTime < this.successiveConnectGap) {
                        break;
                    }
                    GlobalService.consoleLog("webrtc创建盒子连接: openning状态超时, this.webrtcEngineStatus置为closed.");
                    this.webrtcEngineStatus = 'closed';
                case 'closed':
                    if (Date.now() - this.webrtcEngineLastAliveTime < this.successiveConnectGap) {
                        break;
                    }
                    GlobalService.consoleLog("webrtc创建盒子连接: ....[重新]建立连接流程.............");
                    this._createDataChannel();
                    break;
            }

			switch (dataChannel.status) {
				case 'opening':
                    break;
				case 'closed':
                    GlobalService.consoleLog("channel[" + label + "] 状态为cloased, this.webrtcEngineStatus置为closed.");
                    this.webrtcEngineStatus = "closed";
					break;
				case 'opened':
					let channelState = channel.readyState;
					// GlobalService.consoleLog("连接已建立：" + channelState);
					if (channelState == "closing") {
						GlobalService.consoleLog("--------数据通道进入closing，关闭信道-------" + Date.now() + "-------" + dataChannel.lastReceivedTime);
						dataChannel.status = 'closed';
						dataChannel.lastReceivedTime = Date.now();
						channel.close();
						break;
					} else if (Date.now() - dataChannel.lastReceivedTime > this.aliveIntervalTime * 6) {
						GlobalService.consoleLog("--------连接超时，关闭信道-------" + Date.now() + "-------" + dataChannel.lastReceivedTime + '====信道状态====' + channelState);
						dataChannel.status = 'closed';
						dataChannel.lastReceivedTime = Date.now();
						channel.close();
						break;
					}
					while (this.globalWaitingList[label].length) {
						let request = this.globalWaitingList[label].pop();
						if (Date.now() - request.time < this.requestStorageTime) {
							GlobalService.consoleLog("发送缓存的请求........." + request.url);
							//强制刷新cookie
							request.headers.cookie = this.getCookieString(request.url);
							this[request.method](request.url, request.paramObj, request.errorHandler, request.headers, {
								channelLabel: label
							})
							.then(res => {
								request.resolve(res);
							}, res => {
								request.reject(res);
							})
						}
					}
					while (this.globalCallbackList[label].length) {
						let callback = this.globalCallbackList[label].pop();
						callback();
					}
					break;
				case 'closing':
					break;
				case 'nobox':
					while (this.globalCallbackList[label].length) {
						// GlobalService.consoleLog("执行全局回调");
						let callback = this.globalCallbackList[label].pop();
						callback();
					}
			}
		}, this.requestCheckGap)
	}

	public _clearWebrtc(label) {
		let dataChannel = this.channels[label];
		dataChannel.status = "closing";
		if (dataChannel.statusTimer) {
			clearTimeout(dataChannel.statusTimer);
			dataChannel.statusTimer = null;
		}
		clearInterval(dataChannel.aliveInterval);
		dataChannel.aliveInterval = null;
		for (let session in this.globalRequestMap) {
			let mySession = this.globalRequestMap[session];
			mySession.reject && mySession.reject("ChannelClosed");
			clearTimeout(mySession.timer);
			mySession.timer = null;
			delete this.globalRequestMap[session];
		}

		this.globalCallbackList[label] = [];
		dataChannel.lastReceivedTime = Date.now();
		this.sessionId = "";
		this.boxSdpRetryTimes = 0;
		this.sessionId = "";
		// this.cookies = {};
		// this.userBoxCheck = false;
		this.connectBoxSdp = null;
		if (dataChannel.channel) {
			dataChannel.channel.close();
			dataChannel.channel = null;
		}
		if (this.peerConnection) {
			this.peerConnection.close();
			this.peerConnection = null;
		}
		// this.global.deviceSelected = null;
		// this.global.centerBoxSelected = null;
		// this.global.centerAvailableBoxList = [];
		dataChannel.status = "cleared";
	}

	public get(url: string, paramObj: any, errorHandler: any = true, headers: any = {}, options: any = {}, cordova = false) {
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
				if (cordova && this.platform.is('cordova') || this.platform.is('cordova') && this.global.platformName == "android") {
					// if (this.platform.is('cordova') || cordova) {
					return this.http.get(url + this.toQueryString(paramObj), {}, headers)
						.then(res => {
							if (options.needHeader) {
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
							if (options.needHeader) {
								return this.handleSuccess(url, res, errorHandler)
							} else {
								return this.handleSuccess(url, res.json(), errorHandler)
							}
						})
						.catch(error => this.handleError(error, errorHandler));
				}
			} else {
				let label = options.channelLabel || this.channelLabels[0],
					channel = this.channels[label].channel,
					status = this.channels[label].status;
				//Webrtc
				if (status === 'opened') {
					// GlobalService.consoleLog("已经连接盒子sdp，直接get'");
					return this.webrtcRequest(url, 'get', paramObj, headers, options)
						.then((res: any) => {
							if (options.needHeader) {
								return this.handleSuccess(url, res, errorHandler)
							} else {
								return this.handleSuccess(url, res.json(), errorHandler)
							}
						})
						.catch(error => this.handleError(error, errorHandler));
				} else {
					GlobalService.consoleLog("缓存请求，稍后get..." + url);
					return new Promise((resolve, reject) => {
						this.globalWaitingList[label].push({
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

	public post(url: string, paramObj: any, errorHandler: any = true, headers: any = {}, options: any = {}, cordova = false) {
		url = url || '';
		headers['X-Request-Id'] = this.getXRequestId();
		console.log("是否使用webrtc?" + this.global.useWebrtc);
		if (url.startsWith('http') || !this.global.useWebrtc || cordova) {
			//接口可指明不使用webrtc模式，如果当前全局的rtc模式未开启，也使用普通模式
			return this._post(url, paramObj, headers, errorHandler, cordova);
		} else {
			let label = options.channelLabel || this.channelLabels[0],
				channel = this.channels[label].channel,
				status = this.channels[label].status;
			if (status === 'opened') {
				// GlobalService.consoleLog("已经连接盒子sdp，直接post'");
				return this.webrtcRequest(url, 'post', paramObj, headers, options)
					.then((res: any) => this.handleSuccess(url, res.data, errorHandler))
					.catch(error => this.handleError(error, errorHandler));
			} else {
				GlobalService.consoleLog(label + "缓存请求，稍后post..." + url);
				return new Promise((resolve, reject) => {
					this.globalWaitingList[label].push({
						url: url,
						resolve: resolve,
						reject: reject,
						paramObj: paramObj,
						errorHandler: label == this.channelLabels[0] == label ? errorHandler : false,
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

			if (cordova || this.platform.is('cordova')) {
				// if (this.platform.is('cordova') || cordova) {
				return this.http.post(url, paramObj, headers)
					.then((res: any) => {
						if(res.headers && res.headers['set-cookie']) {
							if (this.global.deviceSelected && url.indexOf(GlobalService.boxApi["login"].url)>=0){
                                console.log(url + "登录接口需要设置cookie:" + res.headers['set-cookie']);
                                this.cookies[this.global.deviceSelected.boxId] = res.headers['set-cookie'];
                            }
						}
						return this.handleSuccess(url, JSON.parse(res.data), errorHandler)
					})
					.catch(error => this.handleError(error, errorHandler));
			} else {
				headers['Content-Type'] = 'application/x-www-form-urlencoded';
				// headers['withCredentials'] = true;
				// headers['credentials'] = 'include';
				let postHeaders = new Headers(headers);
				return this.aHttp.post(url, this.toBodyString(paramObj), new RequestOptions({ headers: postHeaders, withCredentials: true }))
					.toPromise()
					.then((res: any) => {
						// console.log(url + "angular http : + " + JSON.stringify(res))
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
		if (result.status && result.status == 206) {
			return result;
		}
		var l = this.global.getAppLang();
		if (result.err_no === 30400) {
			this.global.createGlobalToast(this, { message: Lang.ErrBox[result.err_no].Title[l] });
		}
		if (result.err_no === 20010 || result.err_no === 1103) {
			var cookie = this.getCookieString(url);
			console.error("接口" + url + "报错登录态失效:" + JSON.stringify(result) + "是否处理：" + errorHandler);
			GlobalService.consoleLog("cookie:" + cookie);
			// this.global.logger("丢失cookie的URL:" + url);
			// this.global.logger("获取用户信息失败cookie:" + cookie);
			// GlobalService.consoleLog("localStorage:" + JSON.stringify(window.localStorage));
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
					if (thisLanguage.ButtonText.length) {
						for (let i = 0; i < thisLanguage.ButtonText.length; i++) {
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
		if (!url.startsWith('http') && this.global.useWebrtc) {
			let boxId = this.deviceSelected && this.deviceSelected.boxId;
			// GlobalService.consoleLog('-----获取cookie-----' + boxId + "," +  this.cookies[boxId])
			return this.cookies[boxId] || "";
		} else {
			return this.http.getCookieString(url);
		}
	}

	public setCookie(url, cookie) {
		// document.cookie = cookie + ";Domain=" + GlobalService.centerApiDomain[GlobalService.ENV];
		if (this.platform.is('cordova')) {
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
		console.log("是否handleError:" + errorHandler)
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
		//     this._clearWebrtc();
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
	    if(box){
            this.deviceSelected = {
                version: "",
                friendlyName: box.boxid,
                bindUserHash: Md5.hashStr(this.global.centerUserInfo.uname.toLowerCase()).toString(),
                boxId: box.boxid,
                bindUser: this.global.centerUserInfo.uname
            }
        }else{
            this.deviceSelected = null
        }

        return this.deviceSelected
	}

    /**
     * [getFileLocalOrRemote 获取文件，若本地存在则使用本地，否则通过远程下载]
     * @param {[type]} remoteUrl [远程文件夹路径，不包含文件名]
     * @param {[type]} localPath [本地文件夹路径，不包含文件名]
     * @param {[type]} name      [文件名称]
     * @param {[type]} fileSubPath [本地文件夹下的文件类型的子目录名字]
     */
	// getFileLocalOrRemote(remoteUrl, localPath, name, fileSubPath) {
	// 	remoteUrl = remoteUrl.replace(/\/$/, '') + "/";
	// 	localPath = localPath.replace(/\/$/, '') + "/";
	// 	//第1步，判断本地是否存在，若存在则直接使用
	// 	return this.file.checkFile(localPath, name)
	// 		.then(res => {
	// 			GlobalService.consoleLog("目标文件存在:" + name + JSON.stringify(res));
	// 			//文件已存在
	// 			return localPath + name;
	// 		}, res => {
	// 			GlobalService.consoleLog("目标文件不存在:" + name + JSON.stringify(res));
	// 			//文件不存在，尝试远程下载
	// 			return this.downloadRemoteFile(remoteUrl, localPath, name, fileSubPath)
	// 				.then(res => {
	// 					if (res) {
	// 						//下载成功，直接返回本地路径
	// 						return localPath + name;
	// 					} else {
	// 						return "";
	// 					}
	// 				})
	// 				.then(res => {
	// 					return this.file.checkFile(localPath, name)
	// 						.then(res => {
	// 							return localPath + name;
	// 						})
	// 						.catch(e => {
	// 							return "";
	// 						})
	// 				})
	// 				.catch(e => {
	// 					return "";
	// 				})
	// 		})
	// }

    /**
     * [downloadRemoteFile 从服务器上下载文件]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     */
	// downloadRemoteFile(remoteUrl, localPath, name, fileSubPath) {
	// 	return this.downloadRemoteFileData(remoteUrl, localPath, name)
	// 		.catch(e => {
	// 			//文件夹不存在
	// 			GlobalService.consoleLog("写文件失败，创建文件夹");
	// 			return this.file.createDir(this.global.fileSavePath, fileSubPath, false)
	// 				.then((res: any) => {
	// 					//创建文件夹成功..
	// 					GlobalService.consoleLog("创建文件夹成功，重新写文件");
	// 					return this.downloadRemoteFileData(remoteUrl, localPath, name);
	// 				})
	// 				.catch(e => {
	// 					GlobalService.consoleLog("文件夹已存在，直接写文件");
	// 					//文件夹正在创建...
	// 					return this.downloadRemoteFileData(remoteUrl, localPath, name);
	// 				})
	// 		})
	// }

    /**
     * [downloadRemoteFileData 从远程获取文件的数据]
     * @param {[type]} remoteUrl [远程目录相对地址，不包含文件名]
     * @param {[type]} localPath [本地地址，不包含文件名]
     * @param {[type]} name      [文件名]
     */
	downloadRemoteFileData(remoteUrl, localPath, name) {
		var url = this.global.getBoxApi('downloadFile');
		GlobalService.consoleLog(`远程目录${remoteUrl},本地目录${localPath},文件名${name}`)
		if (!this.global.useWebrtc) {
			return this.http.downloadFile(url, {
				fullpath: remoteUrl + name,
				disk_uuid: this.global.currDiskUuid
			}, {}, localPath + name)
				.then(data => {
					//检查文件是否合法
					return this.file.readAsText(localPath, name)
				})
				.then((res: any) => {
					try {
						let data = JSON.parse(res);
						if (data.err_no === 1401) {
							GlobalService.consoleLog("远端文件不存在...." + remoteUrl + name);
							return this.file.removeFile(localPath, name)
								.then(res => {
									return false;
								})
						} else {
							return false;
						}
					} catch (e) {
						return true;
					}
				})
		} else {
			GlobalService.consoleLog("webrtc下载");
			return new Promise((resolve, reject) => {
				this.webrtcRequest(url, 'get', {
					fullpath: remoteUrl + name,
					disk_uuid: this.global.currDiskUuid
				}, {
						"Range": "bytes=0-"
					}, {
						label: 'download'
					})
					.then((res: any) => {
						GlobalService.consoleLog("文件下载结果：" + res.status)
						//debug
						// resolve(true);
						//下载成功，需手动写文件
						if (res.status === 200 || res.status === 206) {
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
					}, (res: any) => {
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
		if (!this.global.useWebrtc || forceLocal) {
			return this.http.downloadFile(url, {
				fullpath: remoteUrl,
				disk_uuid: this.global.currDiskUuid
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
					fullpath: remoteUrl,
					disk_uuid: this.global.currDiskUuid
				}, headers, {
						maxTime: 8000,
						retries: 3,
						channelLabel: this.channels['download'] ? 'download' : this.channelLabels[0]
					})
					.then((res: any) => {
						// GlobalService.consoleLog("成功返回:" + JSON.stringify(res));
						// GlobalService.consoleLog(typeof res.data)
						resolve(res.data);
					}, (res: any) => {
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

	uploadFile(uploadUrl, params, tmpFilePath, tmpFileName, data: any) {
		GlobalService.consoleLog("开始上传---..." + data.byteLength)
		let url = this.global.getBoxApi('uploadFileBreaking');
		if (!this.global.useWebrtc) {
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
					}, {
							maxTime: 8000,
							retries: 3,
							channelLabel: this.channels['upload'] ? 'upload' : this.channelLabels[0]
						})
						.then(resolve, reject);
				})
				form.append("range", params.range);
				form.append("path", params.path);
				form.append("name", params.name);
				form.append("disk_uuid", this.global.currDiskUuid);
				form.append("file", new Buffer(data), {
					filename: params.name
				});
				form.resume();
				GlobalService.consoleLog("文件数据已发送");
			})
		}
	}

    clearWebrtcEngine() {
        this.channelLabels.forEach(label => {
            this._clearWebrtc(label);
        });
    }

    stopWebrtcEngine() {
        GlobalService.consoleLog("webrtc停止...");
        this.global.useWebrtc = false;
        this.webrtcEngineStatus = "stoped";
        if(this.webrtcEngineRestartTimer){
            clearTimeout(this.webrtcEngineRestartTimer);
            this.webrtcEngineRestartTimer = null;
        }
        this.channelLabels.forEach(label => {
            this._clearWebrtc(label);
        });
    }

    startWebrtcEngine() {
        GlobalService.consoleLog("webrtc开始启动...");
        //Step 0. 如果之前已经开启，直接返回
        if (this.global.useWebrtc && this.webrtcEngineStatus != "stoped"){
            GlobalService.consoleLog("webrtc创建盒子连接: 开始");
            return Promise.resolve()
        }

        //Step 1. init Engine
        this.global.useWebrtc = true;

        //Step 2. start createdata channel
        return this._createDataChannel()
    }

    _createDataChannel() {
        GlobalService.consoleLog("webrtc创建盒子连接: 开始");
        this.webrtcEngineStatus = "opening";
        this.webrtcEngineLastAliveTime = Date.now();
        this.channelLabels.forEach(label => {
            this._clearWebrtc(label);
        });

        return new Promise((gResolve, gReject) => {
            // Step 1. 去中心查找用户的盒子列表　
            this._post(
                GlobalService.centerApi["getBoxList"].url, {}
            )
            // Step 2. 选择出第一个在线的盒子　
            .then((res: any) => {
                GlobalService.consoleLog("webrtc创建盒子连接, getBoxList: " + JSON.stringify(res));
                if (res.err_no !== 0) {
                    GlobalService.consoleLog("webrtc创建盒子连接: 从中心获取盒子列表失败");
                    return Promise.reject("Get box list error.");
                }

                GlobalService.consoleLog("webrtc创建盒子连接: 获取盒子列表成功");
                let centerBoxList = res.boxinfo || [];
                if (centerBoxList.length == 0) {
                    //用户没有盒子
                    GlobalService.consoleLog("webrtc创建盒子连接, 用户没有任何盒子");
                    this.selectBox(null);
                    return Promise.reject("nobox");
                }

                let centerAvailableBoxList = centerBoxList.filter(item => item.online_status === 1);
                GlobalService.consoleLog("webrtc在线盒子总数目/在线盒子数目：" + centerAvailableBoxList.length + "/" + centerBoxList.length);

                if (centerAvailableBoxList.length == 0) {
                    GlobalService.consoleLog("webrtc创建盒子连接, 用户无在线的盒子");
                    this.selectBox(null);
                    return Promise.reject("no online box");
                }

                let deviceSelected = centerAvailableBoxList[0];
                GlobalService.consoleLog("webrtc创建盒子连接, 选择第一个在线的盒子: " + deviceSelected.boxid
                    + ", onlineStatus:" + deviceSelected.online_status
                    + "，sdpRegister:"  + deviceSelected.sdp_register);
                this.selectBox(deviceSelected);
                this.global.setSelectedBox(deviceSelected);
                GlobalService.consoleLog("deviceSelected:" + JSON.stringify( this.global.deviceSelected));
                return this.deviceSelected;
            })
            //Step 3. 通过当前选择的盒子的id，去中心拉取盒子的sdp
            .then((res: any) => {
                GlobalService.consoleLog("webrtc创建盒子连接: 当前有盒子在线，获取盒子sdp");
                return this.getBoxSdp(res.boxId);
            })
            //Step 4. 设置appwebrtc的RemoteDescription
            .then((sdp: any) => {
                GlobalService.consoleLog("webrtc创建盒子连接: 获取sdp成功:" + JSON.stringify(sdp));
                try {
                    this.connectBoxSdp = JSON.parse(sdp);
                    this.sessionId = this.getSessionIdFromSDP(this.connectBoxSdp.sdp);
                } catch (e) {
                    GlobalService.consoleLog("webrtc创建盒子连接: 解析sdp失败：" + sdp);
                    return Promise.reject("parse sdp failed")
                }

                GlobalService.consoleLog("webrtc创建盒子连接: 开始创建连接对象... ");
                this._newPeerConnection(gResolve, gReject);

                GlobalService.consoleLog("webrtc创建盒子连接: 连接对象构造完毕，开始准备发送APP SDP应答：" + JSON.stringify(this.connectBoxSdp));
                try {
                    // setRemoteDescription支持json.parse()类型的sdp
                    return this.peerConnection.setRemoteDescription(this.connectBoxSdp);
                } catch (e) {
                    // setRemoteDescription不支持json.parse()类型的sdp
                    GlobalService.consoleLog("webrtc创建盒子连接: 不支持json objeckt类型的sdp, 构建新的object重试...");
                    let sdp = new RTCSessionDescription();
                    sdp.type = this.connectBoxSdp.type;
                    sdp.sdp = this.connectBoxSdp.sdp;
                    return this.peerConnection.setRemoteDescription(sdp);
                }
            })
            //Step 5. 发送datachannel answer应答
            .then((res: any) => {
                GlobalService.consoleLog("webrtc创建盒子连接: SDP应答成功. ");
                if ('offer' === this.connectBoxSdp.type) {
                    return this._createAnswer();
                } else {
                    return Promise.reject("Box sdp type not equal to offer.");
                }
            })
            //Step 6. 无异常，切换状态为已连接
            .then(()=>{
                this.webrtcEngineStatus = "connected"
            })
            //Step 7. 异常，切换状态为已关闭
            .catch((e: any) => {
                GlobalService.consoleLog("webrtc创建盒子连接: 建立连接流程出错:" + JSON.stringify(e) + e.toString());
                this.global.closeGlobalLoading(this);
                this.webrtcEngineStatus = "closed"
                gReject(null);
            })
        }).then((res) => {
            GlobalService.consoleLog("webrtc创建盒子连接: 建立连接成功，启动保活监控.....");
            this.channelLabels.forEach(label => {
                this.channelStatusManager(label);
            });
            this.keepWebrtcAlive(this.channelLabels[0]);

            return res
        }).catch((res) => {
            if (this.webrtcEngineStatus != "stoped"){
                GlobalService.consoleLog("webrtc创建盒子连接: 建立连接失败，一定时间后重新启动.....");
                this.webrtcEngineRestartTimer = setTimeout(()=>{
                    this._createDataChannel();
                }, this.successiveConnectGap);
            }else{
                GlobalService.consoleLog("webrtc创建盒子连接: 建立连接失败，引擎已关闭，不重新启动");
            }

            return Promise.reject(res)
        });
    }

	_createAnswer() {
		try {
			GlobalService.consoleLog("webrtc创建盒子连接: createAnswer支持promise, try ....");
			return this.peerConnection.createAnswer()
				.then(sdp => {
					//qbing test add
					sdp.sdp = this.setApplicationBitrate(sdp.sdp, 5000);
					return this.peerConnection.setLocalDescription(sdp);
				})
		} catch (e) {
			GlobalService.consoleLog("webrtc创建盒子连接: createAnswer不支持promise");
			return new Promise((resolve, reject) => {
				this.peerConnection.createAnswer((sdp) => {
					//qbing test add
					sdp.sdp = this.setApplicationBitrate(sdp.sdp, 5000);
					this.peerConnection.setLocalDescription(sdp);
					resolve();
				}, (e) => {
					GlobalService.consoleLog("创建应答失败");
					reject(e);
				})
			})
		}
	}

	_newPeerConnection(resolve, reject) {
		let myRTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        this.peerConnection = new myRTCPeerConnection(this.iceServerConfig);

        this.peerConnection.onicecandidate = (evt) => {
			GlobalService.consoleLog('onicecandidate.............');
			let candidate = evt.candidate;
			if (null == candidate) {
				GlobalService.consoleLog("Finished gathering ICE candidates. Start to send local sdp.");
				this.sendLocalSdp(this.peerConnection.localDescription);
				return;
			} else {
				GlobalService.consoleLog("addIceCandidate:" + JSON.stringify(candidate));
                this.peerConnection.addIceCandidate(candidate);
			}
		};

        this.peerConnection.onnegotiationneeded = () => {
			GlobalService.consoleLog('onnegotiationneeded.............')
		};

        this.peerConnection.ondatachannel = (dc) => {
			GlobalService.consoleLog('................ondatachannel: ' + dc.channel.label);
			dc.BinaryType = "arraybuffer";
			dc.BufferedAmountLowThreshold = 65535;
			let label = dc.channel.label;
			if (!this.channels[label]){
                this.channels[label] = {}
            }
            let tdc = this.channels[label];
            tdc.channel             = dc.channel;
            tdc.status              = 'opening';
            tdc.statusTimer         = null;
            tdc.aliveInterval       = null;
            tdc.createTime          = Date.now();
            tdc.lastReceivedTime    = Date.now();
            tdc.dataBuffered        = "";
            tdc.dataBufferedCount   = 0;

			this.prepareDataChannel(label, resolve, reject);
		};

        return this.peerConnection;
	}

	ab2str(buf) {
		let decoder = new TextDecoder("utf-8");
		return decoder.decode(new Uint8Array(buf));
		// return Buffer.from(buf, 'binary').toString('binary');
	}

	generateRandom() {
		let pad = "0000000000";
		let str = Math.floor((Math.random() * 10000000000)).toString();
		return pad.substring(0, pad.length - str.length) + str;
	}

	webrtcRequestWithRetries(url: string, method: string, paramObj: any, headers: any = {}, options: any = {}) {
		return this.webrtcRequest(url, method, paramObj, headers, options)
			.then(res => {
				return res;
			}, res => {
				if (options.retries) {
					options.retries--;
					return this.webrtcRequestWithRetries(url, method, paramObj, headers, options);
				} else {
					return Promise.reject(res);
				}
			});
	}

	//////qbing add for test //////begin ////////////
	rateLimit(label) {
		let limit = false;
		if (Object.keys(this.globalRequestMap).length > 5) {
			limit = true;
		}
		return limit;
	}
	//////qbing add for test //////end //////////////


	webrtcRequest(url: string, method: string, paramObj: any, headers: any = {}, options: any = {}) {
		var start = Date.now(),
			maxTime = options.maxTime || 30000;
		let label = options.channelLabel || this.channelLabels[0],
			dataChannel = this.channels[label];

		//通道尚未建立时，选择其他可用通道
		if(!dataChannel || dataChannel.status != 'opened') {
			this.channelLabels.some((item) => {
				let status = this.channels[item] && this.channels[item].status == 'opened';
				if(status) {
					label = item;
					dataChannel = this.channels[label];
				}
				return status;
			})
		}
		return new Promise((resolve, reject) => {
			let __request = (_url, _paramObj) => {
				if (!this.rateLimit(label) && dataChannel.status === 'opened' && dataChannel.channel.readyState === "open") {
					let r: string = this.generateRandom();
					let logprefix = "session:" + r + ",url:" + url + " :";

					let timer = setTimeout(() => {
						if (this.globalRequestMap[r]) {
							GlobalService.consoleLog(logprefix + "超时");
							if (this.globalRequestMap[r]) {
								this.globalRequestMap[r].reject && this.globalRequestMap[r].reject("RequestTimeout");
							}
							delete this.globalRequestMap[r];
						}
					}, this.networkTimeout);

					this.globalRequestMap[r] = {
						resolve: resolve,
						reject: reject,
						label: label,
						url: url,
						start: start,
						timer: timer,
					};
					this.sendMessage(url, method, paramObj, r, headers);
				} else if (Date.now() - start < maxTime) {
					//通道未建立完成或者通道正忙，等待200毫秒后重试
					setTimeout(() => {
						__request(_url, _paramObj);
					}, 200);
				} else {
					//通道未建立完成或者通道正忙，并且已超时
					GlobalService.consoleLog("通道未建立完成，请求超时:" + url + ",reject Promise")
					reject && reject("RequestTimeout");
				}
			};
			__request(url, paramObj);
		})
	}

	setApplicationBitrate(sdp, bitrate) {
		let lines = sdp.split("\n");
		let line = -1;
		let media = 'application';
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].indexOf("m=" + media) === 0) {
				line = i;
				break;
			}
		}
		if (line === -1) {
			console.debug("Could not find the m line for", media);
			return sdp;
		}
		console.debug("Found the m line for", media, "at line", line);

		// Pass the m line
		line++;

		// Skip i and c lines
		while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {
			line++;
		}

		// If we're on a b line, replace it
		if (lines[line].indexOf("b") === 0) {
			console.debug("Replaced b line at line", line);
			lines[line] = "b=AS:" + bitrate;
			return lines.join("\n");
		}

		// Add a new b line
		console.debug("Adding new b line before line", line);
		let newLines = lines.slice(0, line);
		newLines.push("b=AS:" + bitrate);
		newLines = newLines.concat(lines.slice(line, lines.length));
		return newLines.join("\n")
	}

	prepareDataChannel(label, resolve, reject) {
		let dataChannel = this.channels[label],
			channel = dataChannel.channel;
		channel.onopen = () => {
            GlobalService.consoleLog("webrtc创建盒子连接: ---------------Data channel"+ label +" opened----------------");
            dataChannel.status = "opened";

            this.global.setSelectedBox(this.deviceSelected)

            if(label == this.channelLabels[0]) {
                let url = this.global.getBoxApi('keepAlive');
                GlobalService.consoleLog("webrtc创建盒子连接: 启动keepAlive");

                //request信道建立完成，则立即获取版本号
                //也用于其他信道的请求连接测试
                GlobalService.consoleLog("请求连接测试开始：" + label)
                this.webrtcRequest(url, 'post', {}, {}, {
					channelLabel: label
				})
				.then((res: any) => {
					if (res.status === 200 && res.data.err_no === 0) {
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
			}
		};
		channel.onclose = () => {
			GlobalService.consoleLog("Data channel closed.");
			dataChannel.status = "closed";
			if(this.peerConnection) {
				this.peerConnection.close()
			}

		};
		channel.onerror = () => {
			GlobalService.consoleLog("Data channel error!!");
			// reject && reject();
		};
		channel.onbufferedamountlow = (res) => {
			GlobalService.consoleLog("onbufferedamountlow");
			GlobalService.consoleLog(JSON.stringify(res));
		};

		channel.onmessage = (msg) => {
            GlobalService.consoleLog("webrtc收到数据...");
            let recvStr = this.ab2str(msg.data);
            GlobalService.consoleLog("webrtc收到数据长度:" + msg.data.byteLength + '/' + recvStr.length + ",首尾数据:" + recvStr.slice(0, 512) + "..." + recvStr.slice(-50));

            let recv: any;
            let recv_parseerror = false;
            let remaindStr = "";

            do{
                /////////处理两个包粘连到一起///////////////////
                let endjson = recvStr.indexOf('"}\n{"');
                if (endjson>=0){
                    remaindStr = recvStr.slice(endjson + 2);
                    recvStr = recvStr(0, endjson + 3)
                }

                /////////////解析协议数据整体 //////////////////
                try {
                    //// 第一次尝试解码////////
                    recv_parseerror = false;
                    recv = JSON.parse(recvStr);
                } catch (e) {
                    recv_parseerror = true;

                    if (dataChannel.dataBuffered != ""){
                        GlobalService.consoleLog("webrtc收到数据, 之前有缓存的数据，拼接后继续尝试解析");
                        recvStr = dataChannel.dataBuffered + recvStr;

                        try {
                            //// 第二次尝试解码////////
                            recv_parseerror = false;
                            recv = JSON.parse(recvStr);
                        } catch (ee){
                            GlobalService.consoleLog("webrtc收到数据, 拼接上之前的数据重新解析后依然失败");
                            recv_parseerror = true;
                        }
                    }
                }
                if (recv_parseerror == true && dataChannel.dataBufferedCount>=10){
                    GlobalService.consoleLog("webrtc收到数据, 解析收到的数据出错, 且重试多次，已不可救药，忽略收到的数据!!!");
                    dataChannel.dataBuffered = "";
                    dataChannel.dataBufferedCount = 0;
                    continue;
                } else if (recv_parseerror == true){
                    GlobalService.consoleLog("webrtc收到数据, 解析收到的数据出错, 继续缓存收到的数据!!!");
                    dataChannel.dataBuffered = recvStr;
                    dataChannel.dataBufferedCount++;
                    continue;
                } else {
                    dataChannel.dataBuffered = "";
                    dataChannel.dataBufferedCount = 0;
                }

                ////////////处理一个完整的消息 ////////////////////
                dataChannel.onmessage(recv);

            }while((recvStr = remaindStr) != "");

        };

        dataChannel.onmessage = (recv) => {
			let session;
			let resultHeaders: any;
			let body: any;
			let headers = {};
			let err = "";

            dataChannel.lastReceivedTime = Date.now();
			do {//////////////////////////// 中断直接退出 ////// begin //////////

                /////////////解析协议数据中的header ////////////
				try {
					resultHeaders = JSON.parse(recv.header);
					for (let h in resultHeaders) {
						headers[h.toLowerCase()] = resultHeaders[h][0];
					}
					session = headers["request-session"];
					GlobalService.consoleLog("webrtc收到数据, session:" + session);

					if (headers["set-cookie"]) {
						GlobalService.consoleLog("webrtc收到数据, 需要设置cookie, session:" + session);
						this.cookies[this.deviceSelected.boxId] = headers["set-cookie"];
						this.setCookie(this.globalRequestMap[session].url, headers["set-cookie"]);
					}
				} catch (e) {
					GlobalService.consoleLog("webrtc收到数据, 解析收到的数据出错, 数据头字段应该为json. 忽略收到的数据!!!");
					GlobalService.consoleLog("webrtc收到数据, 错误：" + JSON.stringify(e) + "\r\n" + e.stack + e.message)
					err = "parse recv.header error";
					break
				}

				/////////////解析协议数据中的body ////////////////
				try {
					//是否为文件下载
					if (headers['content-range']) {
						// GlobalService.consoleLog("下载接口数据转换---------");
						// body = base64.toByteArray(recv.body);
						// GlobalService.consoleLog(body)
						let dataBody = Buffer.from(recv.body, 'base64');
						body = new ArrayBuffer(dataBody.length);
						let view = new Uint8Array(body);
						for (let i = 0; i < dataBody.length; i++) {
							view[i] = dataBody[i];
						}
					}
					//正常数据
					else {
						let dataBody = Buffer.from(recv.body, 'base64').toString('utf-8');
						body = JSON.parse(dataBody);
						GlobalService.consoleLog("webrtc收到数据, session:" + session + ", 响应数据：" + dataBody);
					}
				} catch (e) {
					GlobalService.consoleLog("webrtc收到数据, 解析收到的数据出错, 数据body应该为json. 忽略收到的数据!!!");
					GlobalService.consoleLog("webrtc收到数据, 错误：" + JSON.stringify(e) + "\r\n" + e.stack + e.message)
					err = "parse recv.body error";
					break
				}
			} while (false);//////////////////////////// 中断直接退出 ////// end/////


			//////////////////////// 处理解析后的结果信息 ///////////////////
			let sessionMap = this.globalRequestMap[session];
			if (session && sessionMap) {
				clearTimeout(sessionMap.timer);
				GlobalService.consoleLog("webrtc收到数据, 进入成功回调:" + session + ",接口响应耗时:" + (Date.now() - sessionMap.start));
				if (!err && sessionMap.resolve) {
					sessionMap.resolve({
						status: recv.code,
						headers: headers,
						data: body
					});
				} else if (sessionMap.reject) {
					sessionMap.reject({
						status: recv.code,
						data: body
					});
				}
				delete this.globalRequestMap[session];
			} else {
				GlobalService.consoleLog("webrtc收到数据, 接受到数据响应，但是执行post回调异常(session 不存在)!!!!!!!!!!!!!!");
			}
		}
	}

	sendLocalSdp(sdp) {
		GlobalService.consoleLog("开始上传本地sdp...");
		let localSdp = {
			type: sdp.type,
			sdp: sdp.sdp,
			myrandsessionid: this.sessionId
		};

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
			}, {}, false)
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
							this.getBoxSdp(id)
							.then(resolve, reject)
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

	sendMessage(url: string, method: string, paramObj: any, sessionId: string, headers: any = {}, options: any = {}) {
		let body = paramObj;
		let _url = url;
		if (method === 'post') {
			if (paramObj instanceof Buffer) {
				GlobalService.consoleLog("发送Buffer数据:" + (paramObj.length));
				body = paramObj;
			} else if (typeof paramObj === 'object') {
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
		for (let h in headers) {
			headers[h] = [headers[h]];
		}
		// GlobalService.consoleLog("请求头部:" + JSON.stringify(headers));
		let label = options.channelLabel || this.channelLabels[0],
			dataChannel = this.channels[label].channel,
			openStatus = this.channels[label].status;
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
				+ ",state:" + openStatus + "," + dataChannel.readyState
				+ ",bufferedAmount:" + dataChannel.bufferedAmount + "," + dataChannel.bufferedAmountLowThreshold);
			dataChannel.send(str);
		} catch (e) {
			GlobalService.consoleLog("发送数据出错，RTCDataChannel.readyState=" + dataChannel.readyState);
			GlobalService.consoleLog("发送数据出错:" + JSON.stringify(e) + ", session:" + sessionId + ", url:" + _url);
			let requestMap = this.globalRequestMap[sessionId];
			if (sessionId && requestMap && requestMap.reject) {
				GlobalService.consoleLog("发送数据出错, reject:" + sessionId);
				clearTimeout(requestMap.timer);
				requestMap.reject({
					status: -1,
					data: ""
				});
				delete this.globalRequestMap[sessionId];
			}
		}
	}

}
