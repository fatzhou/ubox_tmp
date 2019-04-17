import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
// import { FileTransport, FileUploadOptions, FileTransportObject } from '@ionic-native/file-transfer';
import { Md5 } from "ts-md5/dist/md5";
import { ToastController } from 'ionic-angular';
import * as Wallet from 'ethereumjs-wallet'
// import * as serviceDiscovery from 'cordova-plugin-discovery/www/serviceDiscovery';
import { Lang } from './Language';
import { Events, App, Platform } from 'ionic-angular';
import xml2js from 'xml2js';
import { Storage } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Clipboard } from '@ionic-native/clipboard';
import { AppsInstalled } from './AppsInstalled';
import { UappPlatform } from "./UappPlatform";
// import { FileTransport } from './FileTransport';
declare var chcp: any;
declare var createObjectURL: any;
declare var webkitURL: any;
declare var URL: any;
declare var window;
declare var cordova;
declare var serviceDiscovery;

@Injectable()
export class Util {
    constructor(
        // private transfer: FileTransport,
        private events: Events,
        private http: HttpService,
        public storage: Storage,
        private browser: InAppBrowser,
        private platform: Platform,
        private file: File,
        private fileOpener: FileOpener,
        public barcodeScanner: BarcodeScanner,
        private global: GlobalService,
        private uappPlatform: UappPlatform,
		private appsInstalled: AppsInstalled,
		// private fileTransport: FileTransport,
        private clipboard: Clipboard,
    ) {
        GlobalService.consoleLog("Util构造函数。。")

    };

    public static validator = {
        email(str) {
            if (!str) {
                return 1;
            }
            if (/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(str)) {
                return 0;
            }
            return 2;
        },
        passwd(str) {
            if (!str) {
                return 1;
            }
            if (str.length < 8 || str.length > 18) {
                return 2;
            }
            if (!/^[a-zA-Z0-9!\@\#\$\%\^\&\*\(\)\-_\=\+\\\|\[\]\{\};:\/\?\.\>]+$/g.test(str)) {
                return 2;
            }
            return 0;
        },
        wallet(str) {
            if (!str) {
                return 1;
            }
            return 0;
        },
        paypasswd(str) {
            if (!str) {
                return 1;
            }
            return 0;
        }
    };

    public compareVersion(version1, version2) {
        let num1 = parseInt(version1.replace(/\./g, '')),
            num2 = parseInt(version2.replace(/\./g, ''));
        return num1 > num2;
    }

    public updateAppIndeed($scope) {
        GlobalService.consoleLog("开始升级APP....");
        let _this = $scope;
        //关闭弹窗
        GlobalService.consoleLog("即将打开链接:" + GlobalService.DownloadPath[_this.global.platformName])
        if(_this.global.platformName == 'android') {
            GlobalService.consoleLog("Android优先使用Google Play");
            this.fileOpener.appIsInstalled('com.android.vending')
            .then((res) => {
                GlobalService.consoleLog('openApp ' +JSON.stringify(res))
                if (res.status === 0) {
                    window.location.href = GlobalService.DownloadPath[_this.global.platformName];
                } else {
                    GlobalService.consoleLog('Google Play is installed.')
                    window.open('market://details?id=com.ulabs.ubbeybox', '_system');
                }
            })
            .catch(e => {
                GlobalService.consoleLog('调用失败')
            })
        } else {
            GlobalService.consoleLog("iOS直接使用App Store");
            window.location.href = GlobalService.DownloadPath[_this.global.platformName];
        }
    }

    public searchSelfBox($scope) {
        //Step 1. 不是wifi， 直接失败
        let network = this.global.networkType === 'wifi' || !this.platform.is('cordova');
        if (!network) {
            GlobalService.consoleLog("搜索自己的盒子：网络模式不匹配，返回未找到盒子");
            return Promise.reject(null)
        }

        //Step 2. 中心明确显示用户无绑定的盒子
        if (!$scope.global.centerUserInfo || $scope.global.centerUserInfo.bind_box_count <= 0){
            GlobalService.consoleLog("搜索自己的盒子：中心明确显示用户无绑定的盒子，返回用户没有盒子：USER_HAVE_NO_BOX");
            return Promise.reject("USER_HAVE_NO_BOX")
        }

        //Step 3. 尝试获取本地缓存的盒子id
        return this.global.getSelectedBox(true)
        .then((res)=>{
            if(res && res.boxId){
                GlobalService.consoleLog("搜索自己的盒子：获取到本地缓存boxid成功:" + res.boxId);
                return res.boxId;
            }else{
                GlobalService.consoleLog("搜索自己的盒子：获取到本地缓存boxid失败");
                return "";
            }
        }).catch(()=>{
            GlobalService.consoleLog("搜索自己的盒子：获取到本地缓存boxid失败");
            return "";
        })

        //Step 4. 搜索获取盒子列表
        .then((cachedBoxId)=> {
            return this.searchUbbey(false, cachedBoxId).then((boxes: any) => {
                if (boxes && boxes.length) {
                    return boxes;
                } else {
                    return [];
                }
            })
        })

        //Step 5. 过滤出自己的盒子
        .then((boxes)=>{
            //检查盒子是否有自己的盒子
            let userHash = Md5.hashStr($scope.global.centerUserInfo.uname).toString();
            let myBox = boxes.find(item => item.bindUserHash === userHash);
            if(myBox) {
                //本地有自己的盒子, 使用近场模式
                GlobalService.consoleLog("搜索查找到自己的盒子：" + JSON.stringify(myBox));
                return myBox;
            } else {
                GlobalService.consoleLog("搜索未查找到自己的盒子");
                return Promise.reject(null);
            }
        })
    }

    public loginAndCheckBox($scope, tips = true) {
        return new Promise((resolve, reject)=>{
            //用户没有输入密码通过getUserInfo判断后续操作模式
            if(!$scope.username || !$scope.password) {
                resolve();
                return
            }
            //用户直接输入账号密码登录
            let loginUrl = GlobalService.centerApi["login"].url;
            	$scope.http.post(loginUrl, {
                    uname: $scope.username,
                    password: Md5.hashStr($scope.password).toString(),
                    // password: $scope.password,
                }, tips)
            .then((res) => {
                GlobalService.consoleLog("登录中心成功，获取个人信息" + JSON.stringify(res));
                if (res.err_no === 0) {
                    GlobalService.consoleLog("登录中心成功，获取个人信息");
                    resolve(res)
                } else {
                    GlobalService.consoleLog("登录中心失败");
                    reject(res);
                }
            })
        })

        //尝试从中心直接获取用户信息
        .then(res=>{
            return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {}, tips).then((res:any)=>{
                if (res.err_no !== 0) {
                    GlobalService.consoleLog("获取用户信息错误.......");
                    return Promise.reject("UserInfo Error");
                }

                GlobalService.consoleLog("获取用户信息成功，保存用户信息...." + JSON.stringify(res.user_info));
				$scope.global.centerUserInfo = res.user_info;
				$scope.global.centerUserInfo.unameHash = Md5.hashStr(res.user_info.uname).toString();
            })
        })

        //尽最大努力获取用户盒子信息, 获取不到返回失败
        .then(res=> {
			return this.checkoutBox($scope)
			.then(res => {
				return res;
			})
			.catch(e => {
				return Promise.reject("selectboxfailed");
			})
        })

        //成功登录&成功获取到盒子用户信息啦啦
        .then(res => {
            GlobalService.consoleLog("成功获取到盒子用户信息, 已链接盒子：" + this.global.deviceSelected)
            if(!this.global.deviceSelected) {
                GlobalService.consoleLog("成功获取到盒子用户信息, 但是选择盒子为空, ***UNREACHABLE CODE***");
                return Promise.reject("***UNREACHABLE CODE***")
            }
        })

        .catch(res => {
			GlobalService.consoleLog("登录并获取盒子失败........");
            GlobalService.consoleLog(res);
            $scope.global.closeGlobalLoading($scope);
            //没有盒子或者其他错误，只需登录中心即可
			// errorCallback && errorCallback();
			if(res == 'selectboxfailed') {
				return Promise.resolve();
			} else {
				$scope.global.setSelectedBox(null);
				return Promise.reject(res);
			}
        })
    }

    checkoutBox($scope){
        //尝试用本地缓存中的信息ping一下本地盒子, ping不通之后再搜索
        let logid = Date.now();
        let doSelect =  $scope.global.getSelectedBox(true

        //Case 1: 尝试ping一下本地盒子, ping不通之后再搜索
        ).then((mybox)=> {return this.pingLocalBox(mybox)})

        //Case 2: ping通之后, 直接使用缓存
        .then((pingbox)=>{
            GlobalService.consoleLog("["+logid+"]" + "ping本地盒子成功, 直接使用缓存");
            $scope.global.setSelectedBox(pingbox);
            return $scope.global.deviceSelected
        })

        //Case 3: ping不通之后再尝试搜索
        .catch(()=>{
            GlobalService.consoleLog("["+logid+"]" + "ping本地盒子不通, 尝试搜索....");
            return this.searchSelfBox($scope).then(mybox => {
                $scope.global.setSelectedBox(mybox);
                return $scope.global.deviceSelected
            }).catch((err) => {
                if (err == "USER_HAVE_NO_BOX") {
                    GlobalService.consoleLog("[" + logid + "]" + "用户明确无盒子，本地搜索盒子失败");
                    return Promise.reject("USER_HAVE_NO_BOX");
                } else {
                    return null;
                }
            });
        })

        //优先尝试本地模式，无本地盒子则启动远程盒子
        .then((localBox)=> {
            if(localBox){
                //本地有自己的盒子，关闭远程模式
                $scope.http.stopWebrtcEngine();
            } else {
                //本地没有有自己的盒子，尝试启动远程模式
                return $scope.http.startWebrtcEngine()
            }
        })

        //成功选择到盒子,登录[盒子]
        .then((res:any) => {

            if (!this.global.deviceSelected) {
                GlobalService.consoleLog("["+logid+"]" + "选择盒子失败, ***UNREACHABLE CODE***");
                return Promise.reject("["+logid+"]" + "***UNREACHABLE CODE***")
            }

            return new Promise((resolve, reject) => {
                if ($scope.username && $scope.password) {
                    GlobalService.consoleLog("["+logid+"]" + "[用户输入]用户名和密码");
                    return resolve({
                        username: $scope.username,
                        password: $scope.password,
                    });
                } else {
                    GlobalService.consoleLog("[" + logid + "]" + "[从缓存中提取]用户名和密码");
                    return this.storage.get('UserList')
                        .then(res => {
                            GlobalService.consoleLog("缓存UserList状态：" + JSON.stringify(res));
                            if (res) {
                                let userLoginList = JSON.parse(res);
                                let userLoginInfo;
                                if (this.global.deviceSelected) {
                                    userLoginInfo = userLoginList['boxid'][this.global.deviceSelected.boxId] || null;
                                }
                                if (!userLoginInfo){
                                    userLoginInfo = userLoginList['remote'] || null;
                                }
                                return resolve(userLoginInfo);
                            }
                        })
                }
            }).then((user: any) => {
                GlobalService.consoleLog("["+logid+"]" + "使用获取的[用户名和密码]登录盒子");
                GlobalService.consoleLog("["+logid+"]" + "使用获取的[用户名和密码]登录盒子xx:" + user.username + "/" + user.password);
                return $scope.util.loginBox(user.username, user.password)
                    .then(res => {
                        //这里封装的不是很好，loginBox的返回值要么是盒子信息，要么是null，和之前不统一
                        if (res) {
                            return this.global.deviceSelected;
                        } else {
                            return null;
                        }
                    })
            });
        })

        //获取盒子的用户信息
        .then(()=>{
            return this.http.post(this.global.getBoxApi('getUserInfo'), {}, false).then(res => {
                GlobalService.consoleLog("["+logid+"]" + "检测盒子的登录态" + JSON.stringify(res));
                if(res.err_no === 0) {
                    this.global.boxUserInfo = res.userinfo;
                    return this.global.deviceSelected;
                }else{
                    console.error("["+logid+"]" + "没有盒子登录态，手动清除中心登录信息");
                    this.global.setSelectedBox(null);
                    this.global.centerUserInfo = {};
                    return Promise.reject("Error occured...");
                }
            })
        })

        //获取盒子状态
        .then(()=> {
            this.getDiskStatus()
                .then(() => {
                    console.error("["+logid+"]" + "选取盒子: 获取盒子状态成功，刷新list");
                    this.events.publish('list:refresh');
                })
                .catch(() => {
                    console.error("["+logid+"]" + "选取盒子: 获取盒子状态失败，!!!!!!!!");
                })
        });


        return new Promise((resolve, reject)=>{
            // Case 1: timeout
            setTimeout((logid)=>{
                GlobalService.consoleLog("["+logid+"]" + "选取盒子超时， 引擎继续运行中，直至成功选取盒子...");
                reject()
            }, 2000, logid);

            // case 2: select
            if (0) {
                doSelect.then(resolve, reject);
            }
            ////////// 持续搜索，直至成功 ///// begain ///////////////
            else {
                let retrycount = 0;
                let doSelectLoop = function () {
                    retrycount++;
                    let oldlogid = logid;
                    logid = Date.now();
                    GlobalService.consoleLog("["+ oldlogid + ":" + logid+"]" + "选取盒子开始第"+retrycount+"次运行...");
                    doSelect.then(resolve).catch((err)=>{

                        GlobalService.consoleLog("["+logid+"]" + "选取盒子第" + retrycount + "次失败， 等待X秒后继续重试... error=" + JSON.stringify(err));
                        setTimeout(()=>{doSelectLoop()}, 15000);
                    })
                };
                doSelectLoop();
            }
            ////////// 持续搜索，直至成功 ///// end //////////////////
        });
    }

    loginBox(username, password) {
        let url = this.global.getBoxApi('login');
        return this.http.post(url, {
            username: username,
            password: Md5.hashStr(password).toString(),
            // password: $scope.password,
        })
        .then(res => {
            if(res.err_no === 0) {
				let userInfoUrl = this.global.getBoxApi('getUserInfo');
				return this.http.post(userInfoUrl, {})
				.then(res => {
					if(res.err_no === 0) {
						this.global.boxUserInfo = res.userinfo;
						return this.global.boxUserInfo;
					} else {
						return null;
					}
				})
            } else {
                return null;
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            return null;
        })
    }

    _checkRemoteBoxAvailable(boxId) {
        let url = GlobalService.centerApi["getBoxList"].url;
        let errorCallback = () => {
            setTimeout(() => {
                this._checkRemoteBoxAvailable(boxId);
            }, 6000);
        }
        //WEBRTC模式
        this.http.post(url, {})
        .then(res => {
            if(res.err_no === 0) {
                //检测盒子sdp_register
                let boxList = res.boxinfo || [];
                if(boxList.find(item => item.boxid == boxId && item.sdp_register)) {
                    //盒子已恢复,重新建立连接
                    this.http.startWebrtcEngine();

                    this.http.globalCallbackList["request"].push(() => {
                        this.global.createGlobalToast(this, {
                            message: this.global.L("RebootSuccess")
                        })
                    })
                } else {
                    //盒子未恢复
                    errorCallback();
                }
            } else {
                errorCallback();
            }
        })
        .catch(e => {
            errorCallback();
        })
    }

    openUapp(item, goProgress) {
        if(item.type === 0) {
            //网页应用或者已
            this.openUrl(item.xml);
        } else if(this.appsInstalled.uappInstalled[item.id]) {
            //应用已安装, 直接打开
            this.uappPlatform.openApp(item.id);
        } else {
            //应用未安装，先安装
            if(item.box) {
                //依赖盒子，但是没有盒子
                if(!this.global.centerUserInfo.bind_box_count) {
                    this.global.createGlobalToast(this, {
                        message: this.global.L('BindBoxFirst')
                    })
                    return false;
                } else if(!this.global.deviceSelected) {
                    this.global.createGlobalToast(this, {
                        message: this.global.L('BoxOffline')
                    })
                    return false;
                }
            }
            //下载安装, 安装中则直接返回
            if(item.progress === undefined) {
                this.global.createGlobalToast(this, {
                    message: this.global.Lf('AppInstalling', item.title)
                })
                item.progress = 1;
                //尚未安装
                this.appsInstalled.installUapp({
                    id: item.id,
                    xml: item.xml,
                    type: item.type,
                    box: item.box,
                    enter: item.enter,
                    title: item.title,
                    version: item.version
                }, (res) => {
                    GlobalService.consoleLog("安装进度：" + JSON.stringify(res));
                    let processProgress = this.getUappProgress(item, res);
                    goProgress(processProgress);
                })
                .then(res => {
                    //安装完成.....
                    GlobalService.consoleLog("APP已安装成功.......");
                    this.global.createGlobalToast(this, {
                        message: this.global.Lf('UappInstallSucceed', item.title)
                    })
                })
                .catch(e => {
                    item.progress = undefined;
                })
            }
        }
    }

    public getUappProgress(item, progress) {
        let processRate = 0;
        switch(progress.process) {
            case 'start':
                processRate = 1;
                break;
            case 'folderCreated':
                processRate = 3;
                break;
            case 'xmlDownloaded':
                processRate = 6;
                break;
            case 'pkgZipped':
                processRate = item.box ? 20 : 80;
                break;
            case 'boxAppInstalled':
                processRate = 85;
                break;
            case 'boxDownloading':
                let rate = Math.floor(progress.finish / progress.total * 45) + 30;
                processRate = rate;
                break;
            case 'installFinished':
                processRate = 90;
                break;
                case 'installFinished':
            case 'finished':
                processRate = 100;
                break;
        }
        return processRate;
    }

    _checkLocalBoxAvailable(boxId) {
        let errorCallback = () => {
            setTimeout(()=>{
                this._checkLocalBoxAvailable(boxId);
            }, 10000)
        };
        //搜索匹配盒子
        this.searchUbbey()
        .then((res:any) => {
            if(res.length > 0) {
                let box = res.find(item => item.boxId === boxId);
                if(box) {
                    this.global.setSelectedBox(box);
                    this.global.createGlobalToast(this, {
                        message: this.global.L("RebootSuccess")
                    })
                } else {
                    errorCallback();
                }
            } else {
                errorCallback();
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e);
            errorCallback();
        })
    }

    rebootDevice($scope) {
        if(!$scope.global.deviceSelected) {
            return false;
        }
        let url = $scope.global.getBoxApi("rebootDevice");
        $scope.http.post(url, {})
        .then(res => {
            if(res.err_no === 0) {
                $scope.global.createGlobalToast($scope, {
                    message: $scope.global.L("DeviceRebooting")
                })
                $scope.navCtrl.pop()
                .then(res => {
                    //盒子即将重启.......
                    let boxId = $scope.global.deviceSelected.boxId;
                    this.global.setSelectedBox(null)
                    if($scope.global.useWebrtc) {
                        //关闭webrtc连接
                        $scope.http.stopWebrtcEngine()
                    }

                    setTimeout(() => {
                        //查询盒子是否已经重启完毕
                        if($scope.global.useWebrtc) {
                            this._checkRemoteBoxAvailable(boxId);
                        } else {
                            this._checkLocalBoxAvailable(boxId);
                        }
                    }, 6000);
                })
            }
        })
    }

    unbindBox($scope, boxId, callback) {
        let self = this;
        $scope.global.createGlobalAlert(this, {
            title: Lang.L('WORD67551a7e'),
            message: Lang.L('WORD9f502956'),
            buttons: [
                {
                    text: Lang.L('WORDd0ce8c46'),
                    handler: data => {
						//已登录中心，直接修改
						self.removeBox($scope, boxId, callback);
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {

                    }
                },
            ]
        })
    }

    removeBox($scope, boxId, callback) {
        $scope.http.post(GlobalService.centerApi["unbindBox"].url, {
            boxid: boxId,
        })
        .then(res => {
            if(res.err_no === 0) {
                var url = $scope.global.getBoxApi('unbindBox');
                return $scope.http.post(url, {
                    boxid: boxId,
                    signature: res.credential
                    // signature: encodeURIComponent(res.credential)
                })
            } else {
                throw new Error(Lang.L('WORD4b3c3932'));
            }
        })
        .then(res => {
            if(res.err_no === 0) {
                var url = GlobalService.centerApi["unbindBoxConfirm"].url;
                return $scope.http.post(url, {
                    boxid: boxId,
                })
            } else {
                throw new Error(Lang.L('WORD3f31fa42'));
            }
        })
        .then(res => {
            if(res.err_no == 0) {
                $scope.global.deviceSelected = null;
                $scope.global.boxUserInfo = {};
                $scope.global.centerUserInfo.bind_box_count = 0;
                callback && callback();
            }
        })
        .catch (res => {
            GlobalService.consoleLog(res);
        })
    }

    // public static loginCenter($scope, callback, tips: any = true, errorCallback = null) {
    //     var userInfoUrl = GlobalService.centerApi["login"].url;
    //     $scope.http.post(userInfoUrl, {
    //         uname: $scope.username,
    //         password: Md5.hashStr($scope.password).toString(),
    //         // password: $scope.password,
    //     }, tips)
    //     .then((res) => {
    //         if (res.err_no === 0) {
    //             GlobalService.consoleLog("登录中心成功，获取个人信息");
    //             return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {}, false);
    //         } else {
    //             throw new Error('登录中心失败');
    //         }
    //     })
    //     .then((res) => {
    //         if (res.err_no === 0) {
    //             $scope.global.centerUserInfo = res.user_info;
    //             var boxUsername = $scope.global.boxUserInfo.username;
    //             GlobalService.consoleLog("中心登录成功：" + boxUsername + "," + res.user_info.uname);
    //             callback && callback(res);
    //         }
    //     })
    //     .catch(res => {
    //         GlobalService.consoleLog(res);
    //         $scope.global.closeGlobalLoading($scope);
    //         errorCallback && errorCallback();
    //     })
    // }

    parseDeviceList(devices,callback) {
        var maps = {};
        var deviceList = [];
        GlobalService.consoleLog("设备："+ JSON.stringify(devices));
        for (var i = 0, len = devices.length; i < len; i++) {
            let xml = devices[i].xml;
            if(!xml) {
                continue;
            }
            let parser = new xml2js.Parser({
                trim: true,
                explicitArray: true
            });
            if(xml==undefined){
                if(i ==(len-1)){
                    callback(deviceList);
                }else{
                    continue;
                }
            }
            parser.parseString(xml, function(err, result) {
                var device = result.root.device;
                var dv = device[0];
                if (maps[dv.boxId[0]]) {
                    if(i == (len-1)){
                        GlobalService.consoleLog("设备列表  :"+JSON.stringify(deviceList))
                        callback(deviceList);
                    }
                    return false;
                } else {
                    maps[dv.boxId[0]] = true;
                    deviceList.push({
                        boxId: dv.boxId[0],
                        bindUser: dv.bindUser[0],
                        friendlyName: dv.friendlyName[0],
                        manufacturer: dv.manufacturer[0],
                        manufacturerURL: dv.manufacturerURL[0],
                        deviceType: dv.deviceType[0],
						version: dv.version[0],
						boxType: dv.boxType && dv.boxType[0] || 'UbbeyBox',
						storage: dv.storage && dv.storage[0] || '',
                        URLBase: result.root.URLBase,
                        bindUserHash: dv.bindUserHash[0]
                    });
                    GlobalService.consoleLog("绑定用户：" + dv.bindUser[0]);
                    if(i == (len-1)){
                        GlobalService.consoleLog("设备列表  :"+JSON.stringify(deviceList))
                        callback(deviceList);
                    }
                    return true;
                }
            })
        }
    }

    openFile(path) {
        let urlResolve = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
        urlResolve(path, (fileEntry) => {
            fileEntry.file(data => {
                let mime = data.type;
                if(mime) {
                    // path = 'file://' + path.replace(/^file:\/\//, '');
                    GlobalService.consoleLog("正在打开文件..." + path + "," + mime);
                    this.fileOpener.open(path, mime)
                    .then(res =>{
                        GlobalService.consoleLog("打开成功：" + JSON.stringify(res));
                    })
                    .catch(e => GlobalService.consoleLog('Error opening file' + JSON.stringify(e)));
                } else {
                    this.global.createGlobalToast(this, {
                        message: Lang.L('SystemFileError')
                    })
                }
            })
        })
    }

    searchUbbey(imediate = false, fastSearchBoxid = "") {
		let start = Date.now();
		let minSearchTime = 3000;
        GlobalService.consoleLog("开始盒子扫描，imediate=" + imediate + ",fastSearchBoxid=" + fastSearchBoxid);
        return new Promise((resolve, reject) => {
            // if(1) {
            if(!this.platform.is('cordova')) {
				setTimeout(() => {
                    resolve([{"boxId":"UBOXV1001548593547181270","bindUser":"1****@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001548593547181270","version":"1.3.0","URLBase":["192.168.0.2:37867"],"bindUserHash":"d615d5793929e8c7d70eab5f00f7f5f1"}, {"boxId":"UBOXV1001548593547181270","bindUser":"1****@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001548593547181270","version":"1.3.0","URLBase":["192.168.0.14:37867"],"bindUserHash":"d615d5793929e8c7d70eab5f00f7f5f1"}])
                    // resolve([]);
				}, minSearchTime);
				// resolve([]);
				return ;
            }

            var self = this;
            var flag = false;
            var serviceType = "upnp:ubbeybox";
            var deviceList = [];
            let SEARCH_TIMEOUT = 10000;
            let timeout = setTimeout(()=>{
                setSearchFinish(deviceList);
            }, SEARCH_TIMEOUT);

            var setSearchFinish = (devices) => {
                GlobalService.consoleLog("盒子扫描完毕! 扫描到到盒子个数：" + devices.length);
                clearTimeout(timeout);
				timeout = null;

				let t = minSearchTime - (Date.now() - start);
				if (imediate || t<0){
				    t = 0;
                }
				setTimeout(() => {
					if (devices.length) {
						// GlobalService.consoleLog("解析并获取设备列表" + JSON.stringify(devices));
						self.parseDeviceList(devices, deviceList => {
							// GlobalService.consoleLog("解析完毕" + JSON.stringify(deviceList));
							self.global.foundDeviceList = deviceList;
                            GlobalService.consoleLog("盒子扫描1共耗时:" + (Date.now() - start));
                            resolve(deviceList);
						});
					} else {
                        GlobalService.consoleLog("盒子扫描2共耗时:" + (Date.now() - start));
                        resolve([]);
					}
				}, t);
            };
            let processRes = (devices) => {
                GlobalService.consoleLog("发现接口成功回调");
                //ios需要手动下载xml
                if(devices.length) {
                    for(var i = 0, len = devices.length; i < len; i++) {
                        var myLocation = devices[i].LOCATION.replace(/\/\/([^\/]+)$/g, "/$1");
                        self.http.get(myLocation, {}, false, {}, {}, true)
                        .then(res => {
                            GlobalService.consoleLog("成功！！" + JSON.stringify(res));
                            if(typeof res === 'string') {
                                deviceList.push({
                                    xml: res
                                });
                            } else {
                                deviceList.push({
                                    xml: ''
                                });
                            }

                            if(deviceList.length === len) {
                                setSearchFinish(deviceList);
                            }
                        })
                        .catch(e => {
                            GlobalService.consoleLog("失败！");
                            GlobalService.consoleLog(JSON.stringify(e));
                            deviceList.push({
                                xml: ''
                            });
                            if(deviceList.length === len) {
                                setSearchFinish(deviceList);
                            }
                        })
                    }
                } else {
                    setSearchFinish(deviceList);
                }
            };
            let failure = () => {
                reject();
            }

            serviceDiscovery.getNetworkServices(serviceType, fastSearchBoxid, processRes, failure);
        })

    }

    getBoxVersion(boxId:string = "") {
        let url = this.global.getBoxApi('keepAlive');
        let count = 3;

        let updateDeviceSelected = () => {
            let deviceSelected = this.global.foundDeviceList.find(item => {
                return item.boxId === boxId;
            });
            this.global.setSelectedBox(deviceSelected)
        };

        return this.http.post(url, {}, false)
        .then((res:any) => {
            GlobalService.consoleLog("查询盒子版本号" + JSON.stringify(res));
            if(res.err_no === 0) {
                // updateDeviceSelected();
                if(this.global.deviceSelected) {
                    this.global.deviceSelected.version = res.version;
                }
                return res.version;
            } else {
                throw new Error('GetBoxVersionError');
            }
        }).catch(res => {
            GlobalService.consoleLog("查看盒子版本号失败");
            return new Promise((resolve, reject) => {
                let searchUbbey = () => {
                    this.searchUbbey(false, boxId)
                    .then(res => {
                        updateDeviceSelected();
                        if(this.global.deviceSelected) {
                            resolve(this.global.deviceSelected.version);
                        } else {
                            if(count > 0) {
                                count--;
                                setTimeout(()=>{
                                   searchUbbey();
                                }, 5000);
                            } else {
                                reject();
                            }
                        }
                    })
                    .catch(e => {
                        GlobalService.consoleLog(e.stack);
                        reject();
                    })
                };
                searchUbbey();
            })

        });
    }

    getCoinbase() {
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        let getBoxList = () => {
            return this.http.post(GlobalService.centerApi["getBoxList"].url, {})
            .then(res => {
                if(res.err_no === 0) {
                    let boxInfo = res.boxinfo && res.boxinfo[0];
                    if(boxInfo) {
                        return {
                            coinbase: boxInfo.coinbase,
                            ifMining: boxInfo.if_mine
                        };
                    } else {
                        return {
                            coinbase: '',
                            ifMining: false
                        };
                    }
                } else {
                    return {
                        coinbase: '',
                        ifMining: false
                    };
                }
            })
        }

        if(chainType === 'ERC20') {
            if(this.global.boxUserInfo.coinbase) {
                return Promise.resolve({
                        coinbase: this.global.boxUserInfo.coinbase,
                        ifMining: !!this.global.boxUserInfo.share_switch
                    });
            } else {
                return getBoxList();
            }
        } else {
            if(this.global.deviceSelected){
                return this.http.post(this.global.getBoxApi('getChainProfile'), {})
                .then(res => {
                    if(res.err_no === 0) {
                        return {
                            coinbase: res.coinbase,
                            ifMining: res.if_mine === 1
                        };
                    } else {
                        return {
                            coinbase: '',
                            ifMining: false
                        };
                    }
                })
            } else {
                return getBoxList();
            }
        }
    }

    floatToPricision(n, dec) {
        let index = n.indexOf('e');
        let precision = dec + 2;
        let main = n.slice(0, Math.min(index, precision));
        main = (main + '000000000').slice(0, precision);
        return main + n.slice(index);
    }

    cutFloat(number, dec, flag:any = false) {
        let suffix = '000000';
        if(flag) {
            //强制向上进位
            let offset = Math.pow(10, -dec);
            number = number + offset;
        }
        //支持传入数字
        number = number.toString();
        if(number.indexOf('e') > -1) {
            return this.floatToPricision(number, dec)
        } else {
            if(number.indexOf('.') > -1) {
                //固定保留小数位
                number = number + suffix;
            } else {
                number = number + "." + suffix;
            }
            return number.substring(0, number.lastIndexOf('.') + dec + 1);
        }
    }

    computeTxStatus(status) {
        return {
            "1": Lang.L('TransactionPackaging'),
            "2": Lang.L('SuccessfulDeal'),
            "3": Lang.L('TransactionFailure'),
            "4": Lang.L('TransactionCancal'),
            "5": Lang.L('WaitTransactionPackage')
        }[status] || "";
    }

    /**
     * [generateFileID 计算文件上传/下载任务的文件ID]
     * @param {[type]} desturi   [远程目录，包含文件名]
     * @param {[type]} sourceurl [本地目录，包含文件名]
     * @param {[type]} action    [行为，包括'download', 'upload']
     */
    generateFileID(desturi, sourceurl, action , id = '') {
        if(action == 'upload') {
            return id
        } else {
            return Md5.hashStr(desturi + sourceurl + action + this.global.deviceSelected.boxId + this.global.deviceSelected.bindUserHash + this.global.currDiskUuid, false) + "";
        }
        // return Md5.hashStr(file.localPath + file.path + '/' + file.name, false) + "";
    }
    //切换分享状态
    toggleIfMining(obj) {
        var storage:any;
        var isChangeSize = true;
        storage = obj.newSize;
        GlobalService.consoleLog('传入的参数：   '+JSON.stringify(obj));
        if(obj.oldSize == obj.newSize){
            isChangeSize = false;
        }
        if(obj.chainType === 'ERC20') {
            let url = this.global.getBoxApi('setMineInfo');
            return this.http.post(url, {
                storage: storage,
                switch: obj.ifMining ? 1 : 0
            })
        } else {
            let setMiningUrl = this.global.getBoxApi('setChainMining');

            if(isChangeSize == false) {
                return this.http.post(setMiningUrl, {
                    switch: obj.ifMining ? 1 : 2
                })
            } else {
                this.global.createGlobalLoading(this, {
                    message: Lang.L('changeSize')
                });
                return this.http.post(setMiningUrl, {
                    switch: obj.ifMining ? 1 : 2
                })
                .then(res => {
                    if(res.err_no === 0) {
                        let url = this.global.getBoxApi('stopShare');
                        return this.http.post(url, {})
                    } else {
                        throw new Error('Stop Share error');
                    }
                })
                .then(res => {
                    if(res.err_no === 0) {
                        let setStoreUrl = this.global.getBoxApi('setChainStorage');
                        this.global.closeGlobalLoading(this);
                        return this.http.post(setStoreUrl, {
                            sharesize: storage
                        })
                    }
                })
            }
        }
    }
    /**
     * [computeFileMIMEType 根据文件名后缀计算MIME类型]
     * @param {[type]} name [MIME]
     */
    computeFileMIMEType(name) {
        let matches = name.match(/[^\.]+$/g);
        let style = matches && matches[0] || '';
        var suffix = style.toLowerCase();
        if (/^(jpe?g|gif|heic)$/.test(suffix)) {
            return "image/jpeg";
        }
        if (/^(tif?f)$/.test(suffix)) {
            return "image/tiff";
        }
        if (/^png$/.test(suffix)) {
            return "image/png";
        }
        if (/^gif$/.test(suffix)) {
            return "image/gif";
        }
        if (/^(mp3|ogg|asf|wma|vqf|midi|module|ape|real|wav|flac|amr|m4a)$/.test(suffix)) {
            return 'audio/mpeg';
        }
        if (/^(mp4|avi|rm|rmvb|mov|mp(e)g|wmv|flv|3gp|ts)$/.test(suffix)) {
            return 'video/mpeg';
        }
        if (/^(doc|docx)$/.test(suffix)) {
            return "application/msword";
        }
        if (/^txt|c|h|js|html|css$/.test(suffix)) {
            return "text/plain";
        }
        if (/^ico$/.test(suffix)) {
            return "image/x-icon";
        }
        if (/^(pdf)$/.test(suffix)) {
            return "application/pdf";
        }
        if (/^(ppt|pptx)$/.test(suffix)) {
            return "application/vnd.ms-powerpoint";
        }
        if (/^(xls|xlsx)$/.test(suffix)) {
            return "application/vnd.ms-excel";
        }
        if (/^(zip)$/.test(suffix)) {
            return "application/zip";
        }
        if (/^(tar)$/.test(suffix)) {
            return "application/x-tar";
        }
        return "";
    }

    //ping近场盒子
    pingLocalBox(mybox = null){
        return new Promise((resolve, reject)=>{
            let url = GlobalService.boxApi["keepAlive"].url;
            if(mybox && mybox.URLBase){
                url = "http://" + mybox.URLBase + url;
            } else if(this.global.deviceSelected && this.global.deviceSelected.URLBase){
                url = "http://" + this.global.deviceSelected.URLBase + url;
            } else{
                url = ""
            }

            if (url){
                let rejected = false;
                let pingTimer = setTimeout(()=>{
                    rejected = true;
                    reject()
                }, 2000);

                this.http.post(url, {}, false, {}, {})
                    .then(()=>{
                        if (!rejected){
                            resolve(mybox || this.global.deviceSelected)
                        }
                    }, ()=>{
                        if (!rejected){
                            clearTimeout(pingTimer);
                            reject();
                        }
                    })
            }else{
                reject()
            }
        });
    }

    //填充汇率
    getDisplayRate() {
        if(this.global.globalRateInfo.length == 0){
            return this.http.post(GlobalService.centerApi["getUbbeyRate"].url, {})
            .then(res => {
                if(res.err_no === 0) {
                    if(res.rates) {
                        for(let i = 0, len = res.rates.length; i < len; i++) {
                            res.rates[i].symbol = {
                                "USD": "$",
                                "RMB": "¥",
                                "KWR": "₩",
                                "BTC": "฿"
                            }[res.rates[i].curreycy] || res.rates[i].curreycy;
                        }
                    }
                    this.global.globalRateInfo = res.rates;
                }
                return this.global.globalRateInfo;
          })
        } else {
            return new Promise((resolve, reject) => {
                resolve(this.global.globalRateInfo);
            })
        }
    }

    getWalletList(force = false){
		if(this.global.walletList.length > 0 && !force) {
			return Promise.resolve(this.global.walletList);
		}
		let url = "";
        if(!!this.global.deviceSelected) {
            //已连接盒子，直接
            url = this.global.getBoxApi("getWalletList");
        } else if(this.global.centerUserInfo && this.global.centerUserInfo.bind_box_count === 0) {
            //未绑定盒子
            url = GlobalService.centerApi['getKeystore'].url;
        } else {
			// throw new Error("Wrong case in getWalletData");
			return Promise.reject([]);
        }
        return this.http.post(url, {
            type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
		})
		.then((res:any) => {
			if (res.err_no === 0) {
				this.global.walletList = res.wallets;
				let wallet = res.wallets.map(w => w.addr);
				return this.http.post(GlobalService.centerApi["getWalletBalance"].url, {
					wallet: wallet.join(',')
				})
			} else {
				return []
			}
		})
		.then((res:any) => {
			if(res.err_no == 0) {
				for(let i = 0, len = this.global.walletList.length; i < len; i++) {
					this.global.walletList[i].earn_this_month = this.cutFloat(res.wallet[i].earn_this_month / GlobalService.CoinDecimal, 2);
				}
			}

		})

		// this.storage.get('walletList')
        // .then(res => {
        //     // GlobalService.consoleLog("缓存钱包状态：" + JSON.stringify(res));
        //     if(res) {
		// 		this.global.walletList = JSON.parse(res);
		// 		// return this.global.walletList;
        //         let uname = this.global.centerUserInfo.uname;
        //         let hash = Md5.hashStr(uname.toLowerCase()).toString();
        //         let boxId = 'CENTERUSER',
        //             walletItem = null;
        //         if(this.global.deviceSelected) {
        //             let boxId = this.global.deviceSelected.boxId || '';
        //             walletItem = this.global.walletList.find(item => {
        //                 return hash == item.bindUserHash && item.boxId == boxId;
        //             })
        //         } else {
        //             walletItem = this.global.walletList.find(item => {
        //                 return hash == item.bindUserHash && item.boxId == 'CENTERUSER';
        //             })
        //         }

        //         if(!walletItem) {
        //             this.global.nowUserWallet = {};
        //         } else {
        //             this.global.nowUserWallet = walletItem.walletList;
        //         }
        //     } else {
		// 		return {};
		// 	}
        // })
        // .catch(e => {
		// 	return {};
        //     // this.global.nowUserWallet = {};
        // })
    }

    setWalletList(){
        let uname = this.global.centerUserInfo.uname;
        let hash = Md5.hashStr(uname.toLowerCase()).toString();
        let walletItem = null;
        let boxId = 'CENTERUSER';
        if(this.global.deviceSelected) {
            boxId = this.global.deviceSelected.boxId || '';
        }
        walletItem = this.global.walletList.find(item => {
            return hash == item.bindUserHash && item.boxId === 'CENTERUSER';
        });

        if(!walletItem) {
            this.global.walletList.push({
                bindUserHash: hash,
                walletList: this.global.nowUserWallet,
                boxId: boxId
            });
        } else {
            walletItem.walletList = this.global.nowUserWallet;
        }
        this.storage.set('walletList', JSON.stringify(this.global.walletList))
        .then(res => {
            GlobalService.consoleLog("缓存钱包状态：" + res);
        })
        .catch(e => {
        })
    }

    getUserList() {
        return new Promise((resolve, reject) => {
            this.storage.get('UserList')
            .then(res => {
                GlobalService.consoleLog("缓存UserList状态：" + JSON.stringify(res));
                if(res) {
                    let userLoginList = JSON.parse(res);
                    let userLoginInfo;
                    if(this.global.deviceSelected){
                        userLoginInfo = userLoginList['boxid'][this.global.deviceSelected.boxId] || null;
                    } else {
                        userLoginInfo = userLoginList['remote'] || null;
                    }
                    if(userLoginInfo && (Date.now() - userLoginInfo.timestamp) < 24 * 3600 * 1000 * 7) {
                        this.global.userLoginInfo = userLoginInfo;
                    } else {
                        this.global.userLoginInfo = null;
                    }
                    this.global.userLoginList = userLoginList;
                }
                resolve(this.global.userLoginInfo);
            })
            .catch(e => {
                GlobalService.consoleLog(e.stack)
                resolve(this.global.userLoginInfo);
            })
        })
    }

    setUserList(){
        if(!this.global.deviceSelected){
            this.global.userLoginList['remote'] = this.global.userLoginInfo;
        } else {
            this.global.userLoginList['boxid'] = this.global.userLoginList['boxid'] || {};
            this.global.userLoginList['boxid'][this.global.deviceSelected.boxId] = this.global.userLoginInfo;
        }
        return this.storage.set('UserList', JSON.stringify(this.global.userLoginList))
        .then(res => {
            // GlobalService.consoleLog("缓存UserList状态：" + res);
        })
        .catch(e => {
        })
    }

    openUrl(url){
        const browser = this.browser.create(url, "_blank", "withcookie=a%3D1%26b%3D2&location=no&hardwareback=yes&hidespinner=yes&closebuttoncaption=close&clearcache=yes&clearsessioncache=yes");
        if(browser.on('loadstop').subscribe){
            browser.on('loadstop').subscribe(event => {
            GlobalService.consoleLog("加载完毕'");
            browser.show();
            });
            browser.on('exit').subscribe(event => {
                GlobalService.consoleLog("加载完毕'");
                browser.close();
            });
        } else {
            browser.show();
        }
    }

    preciseAdd(f1, f2, p) {
        p = Math.floor(p);
        let multiplier = Math.pow(10, p);
        return ((f1 * multiplier) + (f2 * multiplier)) / multiplier;
    }

    scanQrcode(){
        return this.barcodeScanner.scan({
            showFlipCameraButton: true,
            showTorchButton: true
        }).then((barcodeData) => {
            GlobalService.consoleLog("Success to get code:" + JSON.stringify(barcodeData))
            if(!barcodeData.cancelled && barcodeData.format === 'QR_CODE') {
                return barcodeData.text;
            } else {
                return ''
            }
        }, (err) => {
            return ''
        });
    }

    popToPage($scope, num) {
        GlobalService.consoleLog(`返回{num}上层  :`  + $scope.navCtrl.length());
        $scope.navCtrl.popTo($scope.navCtrl.getByIndex($scope.navCtrl.length() - num))
    }

    copyInfo(info) {
        GlobalService.consoleLog("复制到剪贴板");
         return this.clipboard.copy(info)
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
    }

    public static bufferToStr(buf, type) {
        if (type) {
            return buf.toString(type);
        } else {
            return buf.toString();
        }
    }

    public static createWallet(password, callback) {
        let wallet = new Wallet.generate();
        let keystore = wallet.toV3(password, {
            n: 1024
        });
        let filename = wallet.getV3Filename();
        let address = '0x' + Util.bufferToStr(wallet.getAddress(), 'hex');
        callback && callback(keystore, filename, address);
    }

    // public static loginBox($scope, callback, centerLogin:Boolean = true, errorCallback = null) {
    //     GlobalService.consoleLog("开始登录盒子！！！");
    //     var boxInfo = $scope.global.deviceSelected;
    //     // var url = "http://" + boxInfo.URLBase + GlobalService.boxApi["login"].url;
    //     var url = $scope.global.getBoxApi('login');
    //     // var userInfoUrl = "http://" + boxInfo.URLBase + GlobalService.boxApi["getUserInfo"].url;
    //     var userInfoUrl = $scope.global.getBoxApi('getUserInfo');
    //     var loginCallback = (res)=>{
    //         GlobalService.consoleLog("进入登录回调！！" + centerUsername);
    //         var centerUsername = $scope.global.centerUserInfo.uname && $scope.global.centerUserInfo.uname.toLowerCase() || undefined;
    //         var boxUsername = $scope.global.boxUserInfo.username && $scope.global.boxUserInfo.username.toLowerCase() || undefined;
    //         if(centerUsername !== undefined && centerUsername === boxUsername) {
    //             GlobalService.consoleLog("登录态一致，可进入首页" + !!callback);
    //             if(callback) {
    //                 callback(res);
    //             }
    //         } else if(centerUsername !== undefined && boxUsername !== undefined && centerUsername != boxUsername) {
    //             GlobalService.consoleLog("登录态不一致：" + centerUsername + "," + boxUsername);
    //             $scope.util.logoutCenter(()=>{
    //                 if(callback) {
    //                     callback(res);
    //                 }
    //             })
    //         }  else {
    //             if(callback) {
    //                callback(res);
    //             }
    //         }
    //     };
    //     $scope.http.post(url, {
    //         username: $scope.username,
    //         password: Md5.hashStr($scope.password).toString(),
    //         // password: $scope.password,
    //     })
    //     .then((res) => {
    //         if (res.err_no === 0) {
    //             GlobalService.consoleLog("登录盒子成功，获取盒子用户信息");

    //             if(centerLogin) {
    //                 GlobalService.consoleLog("自动登录中心");
    //                 Util.loginCenter($scope, null, true);
    //             }

    //             return $scope.http.post(userInfoUrl, {})
    //         } else {
    //             callback && callback(res);
    //             throw new Error('登录盒子失败');
    //         }
    //     })
    //     .then((res) => {
    //         if (res.err_no === 0) {
    //             $scope.global.boxUserInfo = res.userinfo;
    //             GlobalService.consoleLog("盒子cookie：" + $scope.http.getCookieString(url));
    //             loginCallback(res);
    //         }
    //     })
    //     .catch(res => {
    //         errorCallback&&errorCallback();
    //         GlobalService.consoleLog(res);
    //     })
	// }
	
    public logoutCenter(callback) {
        this.global.centerUserInfo = {};
        return this.http.post(GlobalService.centerApi["logout"].url, {}, false)
        .then(res => {
            callback && callback();
        })
    }
    public logout(callback) {
        var self = this;
        this.global.logoutInit();
        setTimeout(()=>{
            this.global.boxUserInfo = {};
            this.global.centerUserInfo = {};
            callback && callback();
        }, 0);

        this.http.post(this.global.getBoxApi("logout"), {}, false)
        .then(()=>{
            this.http.stopWebrtcEngine();
        })
        .catch(()=>{
            this.http.stopWebrtcEngine();
        });

        this.http.post(GlobalService.centerApi["logout"].url, {}, false)
        this.global.setSelectedBox(null, true);
        this.global.foundDeviceList = [];
        this.global.albumBackupSwitch = undefined;
	}

    public bindBox($scope) {
        var boxInfo = $scope.global.deviceSelected;
        GlobalService.consoleLog(boxInfo.URLBase)
        GlobalService.consoleLog(JSON.stringify(GlobalService.boxApi["bindBox"]))
        // var url = "http://" + boxInfo.URLBase + GlobalService.boxApi["bindBox"].url;
        var url = $scope.global.getBoxApi('bindBox');
        let username = "",
            password = "";

        GlobalService.consoleLog("弱中心预绑定，先登录");

        return new Promise((resolve, reject) => {
            if($scope.username && $scope.password) {
				GlobalService.consoleLog("直接传入了用户名。。。")
                username = $scope.username;
                password = $scope.password;
                resolve();
            } else if(this.global.userLoginInfo && this.global.userLoginInfo.username) {
				GlobalService.consoleLog("全局饮用用户名。。。")
				username = this.global.userLoginInfo.username;
                password = this.global.userLoginInfo.password;
                resolve();
			} else {
				GlobalService.consoleLog("缓存中读取用户名......")
                 this.getUserList()
                .then((r:any) => {
                    GlobalService.consoleLog(JSON.stringify(r))
                    if(r) {
                        username = r.username;
                        password = r.password;
                        resolve();
                    } else {
                        reject();
                    }
                })
            }
        })
        .then(res => {
           return this.http.post(GlobalService.centerApi["getUserInfo"].url, {})
        }, res => {
            $scope.global.centerUserInfo = {};
            this.events.publish('token:expired', {
                that: $scope,
                action: 'login'
            });
            //需要先登录
            throw new Error("Password lost and cannot bind...");
        })
         .then(res => {
             if(res.err_no === 0) {
                 return res;
             } else {
                 if($scope.username && $scope.password) {
                    return $scope.http.post(GlobalService.centerApi["login"].url, {
                        uname: username,
                        password: Md5.hashStr(password).toString(),
                    })
                    .then(r => {
                        if(r.err_no === 0) {
                            return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {})
                        } else {
                            throw new Error("Password error");
                        }
                    })
                 } else {
                     throw new Error("No username and password");
                 }
             }
         })
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("登录成功，开始预绑定");
                this.global.centerUserInfo = res.user_info;
                return this.http.post(GlobalService.centerApi["bindBox"].url, {
                    boxid: boxInfo.boxId
                })
            } else {
                throw new Error('预绑定失败');
            }
        })
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("预绑定成功，开始绑定盒子");
                return this.http.post(url, {
                    username: username,
                    password: Md5.hashStr(password).toString(),
                    boxid: boxInfo.boxId,
                    // signature: encodeURIComponent(res.credential),
                    signature: res.credential,
                })
            } else {
                throw new Error('盒子绑定失败');
            }
        })
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("盒子端绑定成功，开始中心确认");
                return this.http.post(GlobalService.centerApi["bindBoxConfirm"].url, {
                    boxid: boxInfo.boxId
                })
            } else {
                throw new Error('中心确认失败');
            }
        })
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("盒子确认成功，登录盒子");
                //更新用户绑定盒子的数量
                this.global.centerUserInfo.bind_box_count = 1;
                //更新盒子用户数据
                boxInfo.bindUser = username;
                boxInfo.bindUserHash = Md5.hashStr(username.toLowerCase()).toString();
                return this.loginBox(username, password);
            } else {
                GlobalService.consoleLog("盒子确认失败，需解除绑定");
                return this.http.post(url, {
                    boxid: boxInfo.boxId,
                    signature: res.credential,
                })
                .then((res) => {
                    GlobalService.consoleLog("解除绑定成功");
                    return false;
                })
            }
        })
        .then(res => {
            if(res) {
                GlobalService.consoleLog("开始转移钱包");
                //绑定成功，开始转移钱包
                let url = GlobalService.centerApi['getKeystore'].url;
                // let boxStatusUrl = this.global.getBoxApi("getDiskStatus");
                // return this.http.post(boxStatusUrl, {})
                // .then(res => {
                //     //盒子状态获取错误的出错率较高，目前出错继续保存钱包
                //     if(res.err_no === 0) {
                //         //获取到盒子状态信息
                //         let label = ['A','B','C','D','E','F','G','H','I','J','K','M','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
                //         let index = 0;
                //         this.global.diskInfo = res.box;
                //         this.global.diskInfo.disks = res.disks || [];

                //         this.global.diskInfo.disks.map((item)=> {
                //             if(item.label == '') {
                //                 item.label = 'DISK ' + label[index];
                //                 index++;
                //             }
                //             // item.used = this.cutFloat(item.used / GlobalService.DISK_G_BITS, 0).replace('.','') + 'GB';
                //             // item.size = this.cutFloat(item.size / GlobalService.DISK_G_BITS, 0).replace('.','') + 'GB';
                //             if(item.position == 'base') {
                //                 this.global.currDiskUuid = item.uuid;
                //                 this.global.currSelectDiskUuid = item.uuid;
                //             }
                //         })
                //         this.global.diskInfoStatus = !!(this.global.diskInfo.disks && this.global.diskInfo.disks.length);
                //         return this.http.post(url, {type: 0});
                //     } else {
                //         return this.http.post(url, {type: 0});
                //     }
                // })
                return this.getDiskStatus()
                .then(()=>{
                    return this.http.post(url, {type: 0});
                })
                .then(res => {
                    if(res.err_no === 0) {
                        //获取备份在中心的钱包
                        if(res.wallets) {
                            GlobalService.consoleLog("绑定成功，需要同步钱包");
                            let promises = [];
                            let url = this.global.getBoxApi('createWallet');
                            let wallets = res.wallets || [];
                            res.wallets.forEach(item => {
                                //盒子创建钱包，不报错...
                                let promise = $scope.http.post(url, {
                                    name: item.name,
                                    addr: item.addr,
                                    keystore: item.keystore,
                                    type: 0
                                }, false)
                                promises.push(promise);
                            })
                            return Promise.all(promises)
                            .then(res => {
                                return true;
                            })
                            .catch(e => {
                                return true;
                            })
                        } else {
                            GlobalService.consoleLog("绑定成功，不需同步钱包");
                            return true;
                        }
                    } else {
                        GlobalService.consoleLog("绑定失败");
                        return false;
                    }
                })
                .catch(e => {
                    return false;
                })
            } else {
                return false;
            }
        })
        .catch((res) => {
            GlobalService.consoleLog(res);
            return false;
        })
    }

    public static getLocalTime(ts, split = "-") {
        let time = new Date(ts);
        let year = time.getFullYear();
        let date = ('00' + time.getDate()).slice(-2);
        let month = ('00' + (time.getMonth() + 1)).slice(-2);
        let hour = ('00' + time.getHours()).slice(-2);
        let minute = ('00' + time.getMinutes()).slice(-2);
        let second = ('00' + time.getSeconds()).slice(-2);
        return [year, month, date].join(split) + ' ' + [hour, minute, second].join(':');
    }

    public static getUTCTime(ts, split = "-") {
        var date = new Date(ts);
        var y = date.getUTCFullYear();
        var m = ('00' + (date.getUTCMonth() + 1)).slice(-2);
        var d = ('00' + date.getUTCDate()).slice(-2);
        return [y, m, d].join(split) + " 00:00:00";
    }

    public static getTime(ts, split = "-", onlyDay = false) {
        var date = new Date(ts);
        var y = date.getFullYear();
        var m = ('00' + (date.getMonth() + 1)).slice(-2);
		var d = ('00' + date.getDate()).slice(-2);
		let ret = [y, m, d].join(split);
		if(!onlyDay) {
			ret += " 00:00:00";
		}
        return ret;
    }

    public static askForLogin($scope, needBack, callback) {
        GlobalService.consoleLog("用户未登录中心，提示用户登录");
        var username = $scope.global.boxUserInfo.username || $scope.global.centerUserInfo.uname;
        $scope.username = username;
        // $scope.global.createGlobalAlert($scope, {
        //     title: Lang.L('NeedPassword'),
        //     message: Lang.Lf('PlsInputCurrentPassword', username),
        //     inputs: [{
        //         name: 'password',
        //         type: 'password',
        //         placeholder: Lang.L('PasswordPlaceholder')
        //     }, ],
        //     buttons: [{
        //             text: needBack ? Lang.L('Back') : Lang.L('Cancel'),
        //             handler: data => {
        //                 GlobalService.consoleLog('Cancel clicked enhhhhhh');
        //                 // $scope.app.getRootNav().pop();
        //                 if (needBack) {
        //                     try {
        //                         var index = $scope.navCtrl.parent.previousTab();
        //                         $scope.navCtrl.parent.select(index);
        //                     } catch (error) {
        //                         $scope.navCtrl.pop();
        //                     }
        //                 } else {

        //                 }
        //             }
        //         },
        //         {
        //             text: Lang.L('ReLogin'),
        //             handler: data => {
        //                 if (!data.password) {
        //                     GlobalService.consoleLog("密码为空，不处理");
        //                     return false;
        //                 }
        //                 //开始登录
        //                 $scope.password = data.password;
        //                 Util.loginCenter($scope, (res) => {
        //                     GlobalService.consoleLog("成功登录中心，获取盒子列表");
        //                     callback && callback(res);
        //                 },true);
        //                 return true;
        //             }
        //         }
        //     ]
        // })
    }

     /**
      * [computeFileType 根据文件后缀，计算文件类型]
      * @param {[type]} name [文件名]
      * @param {[type]} type [是否为文件夹]
      */
    computeFileType(name, type = 0) {
        let matches = name.match(/[^\.]+$/g);
        let style = matches && matches[0] || '';
        var suffix = style.toLowerCase();
        if (type === 1) {
            return "folder";
        } else {
            if (/^(jpe?g|png|gif|heic|tif?f|bmp)$/.test(suffix)) {
                return "image";
            }
            if (/^(mp3|ogg|asf|wma|vqf|midi|module|ape|real|wav|flac|amr|m4a)$/.test(suffix)) {
                return "music";
            }
            if (/^(mp4|avi|rm|rmvb|mov|mp(e)g|mov|wmv|ts|3gp|flv)$/.test(suffix)) {
                return "video";
            }
            if (/^(doc|docx)$/.test(suffix)) {
                return "doc";
            }
            if (/^(txt)$/.test(suffix)) {
                return "txt";
            }
            if (/^(pdf)$/.test(suffix)) {
                return "pdf";
            }
            if (/^(ppt|pptx)$/.test(suffix)) {
                return "ppt";
            }
            if (/^(xls|xlsx)$/.test(suffix)) {
                return "xls";
            }
            if (/^(zip)$/.test(suffix)) {
                return "zip";
            }
            return "default";
        }
    }

    hasThumbnail(type) {
        if(this.platform.is('android')) {
            return type === 'image';
        } else {
            return type === 'video' || type === 'image';
        }
    }

    computeThumbnailName(path, name) {
        path = path.replace(/\/$/g, '') + "/";
        return Md5.hashStr(path + name).toString() + ".png";
    }

    /**
     * [deleteFile 批量删除文件]
     * @param {[type]} path [文件远程路径的数组]
     */
    deleteFile(path) {
        //调用远程接口删除,暂不删除缩略图文件
        var url = this.global.getBoxApi("removeFile");
        return this.http.post(url, {
            fullpath: JSON.stringify(path),
            disk_uuid: this.global.currDiskUuid
        })
    }

    //询问是否需要删除文件
    deleteFileDialog(path, hasFolder, callback = null,  errCallback = null) {
        GlobalService.consoleLog("开始删除文件");
        var self = this;
        this.global.createGlobalAlert(this, {
            title: hasFolder ? Lang.L('WORD3aff2d2f') : Lang.L('WORD5e19363c'),
            message: hasFolder ? Lang.L('WORD248579dd') : Lang.L('WORD5627ad0c'),
            // enableBackdropDismiss: false,
            buttons: [
                {
                    text: Lang.L('WORD0e46988a'),
                    handler: data => {
                        self.deleteFile(path)
                        .then(res => {
                            if(res.err_no === 0) {
                                callback && callback();
                            } else {
                                errCallback && errCallback();
                            }
                        })
                        return true;
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.global.alertCtrl.dismiss();
                        // this.handleBack();
                    }
                },
            ]
        });
        return true;
    }

    /**
     * [moveFile 移动文件，如果文件包含缩略图信息，则需要触发重命名]
     * @param {[type]} newName [新文件名字]
     * @param {[type]} newPath [新文件路径]
     * @param {[type]} oldName [老文件名字]
     * @param {[type]} oldPath [老文件路径]
     */
    moveFile(oldPath, oldName, newPath, newName) {
        //保证新老路径最后一定有/
        newPath = newPath.replace(/\/$/g, '') + "/";
        oldPath = oldPath.replace(/\/$/g, '') + "/";
        // var oNameSuffix = matches ? matches[0] : "";
        var url = this.global.getBoxApi("moveFile");
        return this.http.post(url, {
            src_path: oldPath + oldName,
            dst_path: newPath + newName,
            src_diskuuid: this.global.currDiskUuid,
            dst_diskuuid: this.global.currSelectDiskUuid
        })
        .then(res => {
            if(res.err_no !== 0) {
                //移动文件失败，不操作缩略图
                return false;
            }
            //检测是否需要修改缩略图
            let type = this.computeFileType(oldName);
            if(this.hasThumbnail(type)) {
                //需操作缩略图
                //计算新老缩略图名字
                let newThumbnailName = this.computeThumbnailName(newPath, newName);
                let oldThumbnailName = this.computeThumbnailName(oldPath, oldName);
                let thumbnailRemotePath = this.global.ThumbnailRemotePath + "/";
                let thumbnailLocalPath = this.global.fileSavePath + this.global.ThumbnailSubPath + "/";
                GlobalService.consoleLog("缩略图移动：" + oldThumbnailName + " " + newThumbnailName);
                //更新远程缩略图名字变更，不需要等待
                this.http.post(url, {
                    src_path: thumbnailRemotePath + oldThumbnailName,
                    dst_path: thumbnailRemotePath + newThumbnailName
                }, false)

                //操作本地缩略图，不论成功失败都操作
                return this.file.moveFile(thumbnailLocalPath, oldThumbnailName, thumbnailLocalPath, newThumbnailName)
                .then(entry => {
                    return true;
                })
                .catch(e => {
                    return true;
                })
            } else {
                return true;
            }
        })
    }

    getDeviceID() {
        if(!this.global.deviceID) {
            return new Promise((resolve, reject) => {
                this.storage.get('deviceId')
                .then(res => {
                    if(res) {
                        this.global.deviceID = res;
                    } else {
                        this.global.deviceID = window.device && window.device.uuid || 'com.yqtc.ubbeybox.uuid';
                    }
                    GlobalService.consoleLog("设备UUID:" + this.global.deviceID);
                    this.storage.set('deviceID', this.global.deviceID);
                    resolve(this.global.deviceID);
                })
            });
        } else {
            return Promise.resolve(this.global.deviceID);
        }
    }

    getDisplayTime(ts) {
        var date = new Date(ts);
        var month = date.getMonth() + 1;
        var Y = ('00' + date.getFullYear()).slice(-2),
            M = ('00' + month).slice(-2),
            D = ('00' + date.getDate()).slice(-2),
            h = ('00' + date.getHours()).slice(-2),
            m = ('00' + date.getMinutes()).slice(-2),
            s = ('00' + date.getSeconds()).slice(-2);
        return [Y, M, D].join('-') + ' ' + [h, m, s].join(':');
    }

    downloadBt(bturl,id) {
        var url = this.global.getBoxApi("btDownlaod");
        this.global.createGlobalLoading(this, {
            message: Lang.L('Creating')
        });
        return this.http.post(url, {
            magnet: bturl,
            resourceid: id
        })
        .then((res)=>{
            if(res.err_no === 0 || res.err_no == 10002) {
                this.global.closeGlobalLoading(this);
                GlobalService.consoleLog("下载bt成功");
                this.global.createGlobalToast(this, {
                    message: Lang.L('StartDownloading')
                })
            } else {
                this.global.closeGlobalLoading(this);
            }
        })
        .catch(e => {
            this.global.closeGlobalLoading(this);
            this.global.createGlobalToast(this, {
                message: Lang.L('DownloadError')
            })
        })
    }

    getDiskStatus() {
		var url = this.global.getBoxApi("getDiskStatus");
		return this.http.postWithStorage(url, {}, true, {}, {
			storageName: 'DiskStatusInfo'
		})
		.then((data:any) => {
			if (data.err_no === 0) {
				let label = ['A','B','C','D','E','F','G','H','I','J','K','M','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
				let index = 0;
				this.global.diskInfo = data.box;
				this.global.diskInfo.disks = data.disks || [];
				this.global.diskInfo.disks.map((item)=> {
					if(item.label == '') {
						item.label = 'DISK ' + label[index];
						index++;
					}
					// item.used = this.cutFloat(item.used / GlobalService.DISK_G_BITS, 0).replace('.','') + 'GB';
					// item.size = this.cutFloat(item.size / GlobalService.DISK_G_BITS, 0).replace('.','') + 'GB';
					if(item.position == 'base') {
						this.global.currDiskUuid = item.uuid;
						this.global.currSelectDiskUuid = item.uuid;
					}
				});
				if(!(this.global.diskInfo.disks && this.global.diskInfo.disks.length)){
					this.global.diskInfoStatus = false;
				} else {
					this.global.diskInfoStatus = true;
				}
			}
		})
		.catch(()=>{
			return false
		})
    }
}
