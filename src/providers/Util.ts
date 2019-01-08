import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
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
        // private transfer: FileTransfer,
        private events: Events,
        private http: HttpService,
        public storage: Storage,
        private browser: InAppBrowser,
        private platform: Platform,
        private file: File,
        private fileOpener: FileOpener,
        public barcodeScanner: BarcodeScanner,
        private global: GlobalService,
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
            if (!/^[a-zA-Z0-9]+$/g.test(str)) {
                return 2;
            }
            if (!/^(?![a-zA-Z]+$)(?![0-9]+$)[a-zA-Z0-9]+$/g.test(str)) {
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
            console.log("Android优先使用Google Play");
            this.fileOpener.appIsInstalled('com.android.vending')
            .then((res) => {
                console.log('openApp ' +JSON.stringify(res))
                if (res.status === 0) {
                    window.location.href = GlobalService.DownloadPath[_this.global.platformName];
                } else {
                    console.log('Google Play is installed.')
                    window.open('market://details?id=com.ulabs.ubbeybox', '_system');
                }
            })
            .catch(e => {
                console.log('调用失败')
            })
        } else {
            console.log("iOS直接使用App Store");
            window.location.href = GlobalService.DownloadPath[_this.global.platformName];
        }
    }

    public loginAndCheckBox($scope, silence = true) {
        let url = GlobalService.centerApi["getUserInfo"].url;
        return this.http.post(url, {}, false)
        .then(res => {
            //获取中心的用户信息
            if(res.err_no === 0) {
                $scope.global.centerUserInfo = res.user_info;
                return res;
            } else {
                if($scope.username && $scope.password) {
                    var loginUrl = GlobalService.centerApi["login"].url;
                    return $scope.http.post(loginUrl, {
                        uname: $scope.username,
                        password: Md5.hashStr($scope.password).toString(),
                        // password: $scope.password,
                    }, silence)
                    .then((res) => {
                        if (res.err_no === 0) {
                            GlobalService.consoleLog("登录中心成功，获取个人信息");
                            return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {}, silence)
                        } else {
                            // throw new Error('登录中心失败');
                            return Promise.reject("Login Error");
                        }
                    })                       
                } else {
                    return Promise.reject("Login Error");
                }
            }
        })
        .then((res:any) => {
            //获取盒子列表
            if (res.err_no === 0) {
                console.log("保存用户信息...." + JSON.stringify(res.user_info));
                $scope.global.centerUserInfo = res.user_info;
                let network = this.global.networkType === 'wifi';
                //查询用户的盒子
                if(res.user_info.bind_box_count > 0 && network) {
                    //用户有盒子
                    return this.searchUbbey();
                } else {
                    //用户没有盒子
                    return [];
                }
            } else {
                return Promise.reject("UserInfo Error");
            }             
        })
        .then((res:any) => {
            //建立盒子连接
            if(res.length) {
                //检查盒子是否有自己的盒子
                let userHash = Md5.hashStr($scope.global.centerUserInfo.uname).toString();
                let myBox = res.find(item => item.bindUserHash === userHash);
                if(myBox) {
                    console.log("查找到自己的盒子：" + JSON.stringify(myBox));
                    $scope.global.useWebrtc = false;
                    $scope.global.deviceSelected = myBox;
                    return $scope.global.deviceSelected.version;
                } else {
                    //本地没有自己的盒子
                    return Promise.reject("NOBOX");
                }
            } else {
                console.log("本地不存在盒子，远程登录查看")
                return $scope.http.createDataChannel()
                // .then(res => {
                //     if($scope.global.deviceSelected) {
                //         return this.getBoxVersion($scope.global.deviceSelected.deviceId);
                //     } else {
                //         return Promise.reject("NOBOX");
                //     }
                // })                   
            }
        })
        .then((res:any) => {
            //成功连接到盒子,获取盒子登陆态
            if(this.global.deviceSelected) {
                //检测盒子的登陆态
                let userInfoUrl = this.global.getBoxApi('getUserInfo');
                return this.http.post(userInfoUrl, {}, false)
                .then(res => {
                    if(res.err_no === 0) {
                        this.global.boxUserInfo = res.userinfo;
                        return this.global.deviceSelected;
                    } else {
                        if(!$scope.username || !$scope.password) {
                            return this.getUserList()
                            .then((r:any) => {
                                if(r) {
                                    //获取到用户名和密码
                                    return $scope.util.loginBox(r.username, r.password)
                                    .then(res => {
                                        if(res) {
                                            // return this.global.deviceSelected;
                                            //开始获取用户信息
                                            return this.http.post(userInfoUrl, {}, false)
                                            .then(res => {
                                                if(res.err_no === 0) {
                                                    this.global.boxUserInfo = res.userinfo;
                                                    return this.global.deviceSelected;
                                                } else {
                                                    return null;
                                                }
                                            })
                                        } else {
                                            return null;
                                        }
                                    })
                                } else {
                                    //没有用户名或者密码
                                    return null;
                                }
                            })
                            .catch(e => {
                                return null;
                            })
                        } else {
                            //直接登录
                            return $scope.util.loginBox($scope.username, $scope.password)
                            .then(res => {
                                //这里封装的不是很好，loginBox的返回值要么是盒子信息，要么是null，和之前不统一
                                if(res) {
                                    return this.global.deviceSelected;
                                } else {
                                    return null;
                                }
                            })
                        }                        
                    }
                })
            } else {
                return [];
            }
        })
        .then(res => {
            //成功获取到盒子登陆态，否则清除登陆信息
            if(res === null) {
                console.error("没有盒子登陆态，手动清除中心登陆信息");
                this.global.deviceSelected = null;
                this.global.centerUserInfo = {};
                return null;
            } else {
                var url = this.global.getBoxApi("getDiskStatus");
                return this.http.post(url, {})
                .then((data) => {
                    if (data.err_no === 0) {
                        this.global.diskInfo = data.box;
                        if(!(this.global.diskInfo.disks && this.global.diskInfo.disks.length)){
                            this.global.diskInfoStatus = false;
                        }else{
                            this.global.diskInfoStatus = true;
                        }
                    }
                    return res;
                })
                .catch(()=>{
                    return res;
                })
            }
           // return res;
        })
        .catch(res => {
            GlobalService.consoleLog(res);
            $scope.global.closeGlobalLoading($scope);
            this.global.deviceSelected = null;
            //没有盒子或者其他错误，只需登录中心即可
            // errorCallback && errorCallback();
            return Promise.reject("Login error...");
        })               
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
            console.log(e.stack);
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
                    this.http.initWebrtc();
                    this.http.globalCallbackList.push(() => {
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
                    this.global.deviceSelected = box;
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
                    $scope.global.deviceSelected = null;

                    if($scope.global.useWebrtc) {
                        //关闭webrtc连接
                        $scope.http.clearWebrtc();
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
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                       
                    }
                },
                {
                    text: Lang.L('WORDd0ce8c46'),
                    handler: data => {
                        if($scope.global.centerUserInfo.earn !== undefined) {
                            //已登录中心，直接修改
                            self.removeBox($scope, boxId, callback);
                        } else {
                            Util.loginCenter($scope, ()=>{
                                self.removeBox($scope, boxId, callback);
                            });
                        } 
                    }
                }
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
                $scope.global.createGlobalAlert($scope, {
                    title: Lang.L('WORDab667a91'),
                    message: Lang.L('WORDe6e1739b'),
                    buttons: [
                        {
                            text: Lang.L('WORD0cde60d1'),
                            handler: data => {
                                $scope.global.centerUserInfo = {};
                                $scope.global.boxUserInfo = {};
                                callback && callback();
                            }
                        }
                    ]
                })                    
            }
        })
        .catch (res => {
            GlobalService.consoleLog(res);
        })
    }

    public static loginCenter($scope, callback, silence: any = true, errorCallback = null) {
        var userInfoUrl = GlobalService.centerApi["login"].url;
        $scope.http.post(userInfoUrl, {
            uname: $scope.username,
            password: Md5.hashStr($scope.password).toString(),
            // password: $scope.password,
        }, silence)
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("登录中心成功，获取个人信息");
                return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {}, false);
            } else {
                throw new Error('登录中心失败');
            }
        })
        .then((res) => {
            if (res.err_no === 0) {
                $scope.global.centerUserInfo = res.user_info;
                var boxUsername = $scope.global.boxUserInfo.username;
                GlobalService.consoleLog("中心登录成功：" + boxUsername + "," + res.user_info.uname);
                callback && callback(res);              
            } 
        })
        .catch(res => {
            GlobalService.consoleLog(res);
            $scope.global.closeGlobalLoading($scope);
            errorCallback && errorCallback();
        })
    }

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
                    path = 'file://' + path.replace(/^file:\/\//, '');
                    console.log("正在打开文件..." + path + "," + mime);
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

    searchUbbey() {  
        return new Promise((resolve, reject) => {
            var self = this;
            var flag = false;
            var serviceType = "upnp:ubbeybox";
            var deviceList = [];

            var setSearchFinish = (devices) => {
                clearTimeout(timeout);
                if (devices.length) {
                    // GlobalService.consoleLog("解析并获取设备列表" + JSON.stringify(devices));
                    self.parseDeviceList(devices, deviceList => {
                        // GlobalService.consoleLog("解析完毕" + JSON.stringify(deviceList));
                        self.global.foundDeviceList = deviceList;
                        resolve(deviceList);
                    });
                }
            };
            let SEARCH_TIMEOUT = 10000;
            let processRes = (devices) => {
                GlobalService.consoleLog("发现接口成功回调");      
                //ios需要手动下载xml
                if(devices.length) {
                    for(var i = 0, len = devices.length; i < len; i++) {
                        var myLocation = devices[i].LOCATION.replace(/\/\/([^\/]+)$/g, "/$1");
                        self.http.get(myLocation, {}, false)
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
            let timeout = setTimeout(()=>{
                setSearchFinish(deviceList);
            }, SEARCH_TIMEOUT);
            serviceDiscovery.getNetworkServices(serviceType, processRes, failure);           
        }) 

    }

    getBoxVersion(boxId:string = "") {
        let url = this.global.getBoxApi('keepAlive');
        let count = 3;

        let updateDeviceSelected = () => {
            this.global.deviceSelected = this.global.foundDeviceList.filter(item => {
                return item.boxId === boxId; 
            })[0] || null;          
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
                    this.searchUbbey()
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
                }
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
            return Md5.hashStr(desturi + sourceurl + action + this.global.deviceSelected.boxId + this.global.deviceSelected.bindUserHash, false) + "";
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

    getWalletList(){
        this.storage.get('walletList')
        .then(res => {
            // GlobalService.consoleLog("缓存钱包状态：" + JSON.stringify(res));
            if(res) {
                this.global.walletList = JSON.parse(res);
                let uname = this.global.centerUserInfo.uname;
                let hash = Md5.hashStr(uname.toLowerCase()).toString();
                let boxId = 'CENTERUSER',
                    walletItem = null;
                if(this.global.deviceSelected) {
                    let boxId = this.global.deviceSelected.boxId || '';
                    walletItem = this.global.walletList.find(item => {
                        return hash == item.bindUserHash && item.boxId == boxId;
                    })                    
                } else {
                    walletItem = this.global.walletList.find(item => {
                        return hash == item.bindUserHash && item.boxId == 'CENTERUSER';
                    })  
                }

                if(!walletItem) {
                    this.global.nowUserWallet = {};
                } else {
                    this.global.nowUserWallet = walletItem.walletList;
                }
            }
        })
        .catch(e => {
            this.global.nowUserWallet = {};
        })
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
        })        

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
                // GlobalService.consoleLog("缓存UserList状态：" + JSON.stringify(res));
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
        const browser = this.browser.create(url, "_blank", "location=no&hardwareback=yes&hidespinner=yes&closebuttoncaption=close&clearcache=yes&clearsessioncache=yes");
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

    public static loginBox($scope, callback, centerLogin:Boolean = true, errorCallback = null) {
        var boxInfo = $scope.global.deviceSelected;
        // var url = "http://" + boxInfo.URLBase + GlobalService.boxApi["login"].url;
        var url = $scope.global.getBoxApi('login');
        // var userInfoUrl = "http://" + boxInfo.URLBase + GlobalService.boxApi["getUserInfo"].url;
        var userInfoUrl = $scope.global.getBoxApi('getUserInfo');
        var loginCallback = (res)=>{
            GlobalService.consoleLog("进入登录回调！！" + centerUsername);
            var centerUsername = $scope.global.centerUserInfo.uname && $scope.global.centerUserInfo.uname.toLowerCase() || undefined;
            var boxUsername = $scope.global.boxUserInfo.username && $scope.global.boxUserInfo.username.toLowerCase() || undefined;
            if(centerUsername !== undefined && centerUsername === boxUsername) {
                GlobalService.consoleLog("登录态一致，可进入首页" + !!callback);
                if(callback) {
                    callback(res);
                } 
            } else if(centerUsername !== undefined && boxUsername !== undefined && centerUsername != boxUsername) {
                GlobalService.consoleLog("登录态不一致：" + centerUsername + "," + boxUsername);
                $scope.util.logoutCenter(()=>{
                    if(callback) {
                        callback(res);
                    }                   
                })
            }  else {
                if(callback) {
                   callback(res);
                }  
            }
        };
        $scope.http.post(url, {
            username: $scope.username,
            password: Md5.hashStr($scope.password).toString(),
            // password: $scope.password,
        })
        .then((res) => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("登录盒子成功，获取盒子用户信息");

                if(centerLogin) {
                    GlobalService.consoleLog("自动登录中心");
                    Util.loginCenter($scope, null, true);                    
                }

                return $scope.http.post(userInfoUrl, {})
            } else {
                callback && callback(res);
                throw new Error('登录盒子失败');
            }
        })
        .then((res) => {
            if (res.err_no === 0) {
                $scope.global.boxUserInfo = res.userinfo;
                GlobalService.consoleLog("盒子cookie：" + $scope.http.getCookieString(url));
                loginCallback(res);
            }
        })
        .catch(res => {
            errorCallback&&errorCallback();
            GlobalService.consoleLog(res);
        })
    }
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
        if(this.global.useWebrtc) {
            this.http.clearWebrtc();
        } else {
            this.http.post(this.global.getBoxApi("logout"), {}, false)
        }
        this.http.post(GlobalService.centerApi["logout"].url, {}, false)
        this.global.deviceSelected = null;
        this.global.foundDeviceList = [];
        this.global.albumBackupSwitch = undefined;
    }

    public static bindBox($scope) {
        var boxInfo = $scope.global.deviceSelected;
        GlobalService.consoleLog(boxInfo.URLBase)
        GlobalService.consoleLog(JSON.stringify(GlobalService.boxApi["bindBox"]))
        // var url = "http://" + boxInfo.URLBase + GlobalService.boxApi["bindBox"].url;
        var url = $scope.global.getBoxApi('bindBox');

        GlobalService.consoleLog("弱中心预绑定，先登录");
        GlobalService.consoleLog("用户名是:" + $scope.username + ",密码是:" + $scope.password);
        return $scope.http.post(GlobalService.centerApi["login"].url, {
                uname: $scope.username,
                password: Md5.hashStr($scope.password).toString(),
            })
        .then(res => {
            if(res.err_no === 0) {
                return $scope.http.post(GlobalService.centerApi["getUserInfo"].url, {})
            }
        })
            .then((res) => {
                if (res.err_no === 0) {
                    GlobalService.consoleLog("登录成功，开始预绑定");
                    $scope.global.centerUserInfo = res.user_info;
                    return $scope.http.post(GlobalService.centerApi["bindBox"].url, {
                        boxid: boxInfo.boxId
                    })
                } else {
                    throw new Error('预绑定失败');
                }
            })
            .then((res) => {
                if (res.err_no === 0) {
                    GlobalService.consoleLog("预绑定成功，开始绑定盒子");
                    return $scope.http.post(url, {
                        username: $scope.username,
                        password: Md5.hashStr($scope.password).toString(),
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
                    return $scope.http.post(GlobalService.centerApi["bindBoxConfirm"].url, {
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
                    $scope.global.centerUserInfo.bind_box_count = 1;
                    //更新盒子用户数据
                    boxInfo.bindUser = $scope.username;
                    boxInfo.bindUserHash = Md5.hashStr($scope.username.toLowerCase()).toString();
                    return $scope.util.loginBox($scope.username, $scope.password);
                } else {
                    GlobalService.consoleLog("盒子确认失败，需解除绑定");
                    return $scope.http.post(url, {
                        boxid: boxInfo.boxId,
                        signature: res.credential,
                    })
                    .then((res) => {
                        GlobalService.consoleLog("解除绑定成功");
                        return {
                            err_no: 12345
                        }
                    })
                }
            })
            .catch((res) => {
                GlobalService.consoleLog(res);
                return {
                    err_no: 11111
                };
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

    public static getTime(ts, split = "-") {
        var date = new Date(ts);
        var y = date.getFullYear();
        var m = ('00' + (date.getMonth() + 1)).slice(-2);
        var d = ('00' + date.getDate()).slice(-2);
        return [y, m, d].join(split) + " 00:00:00";
    }

    public static askForLogin($scope, needBack, callback) {
        GlobalService.consoleLog("用户未登录中心，提示用户登录");
        var username = $scope.global.boxUserInfo.username || $scope.global.centerUserInfo.uname;
        $scope.username = username;
        $scope.global.createGlobalAlert($scope, {
            title: Lang.L('NeedPassword'),
            message: Lang.Lf('PlsInputCurrentPassword', username),
            inputs: [{
                name: 'password',
                type: 'password',
                placeholder: Lang.L('PasswordPlaceholder')
            }, ],
            buttons: [{
                    text: needBack ? Lang.L('Back') : Lang.L('Cancel'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked enhhhhhh');
                        // $scope.app.getRootNav().pop();
                        if (needBack) {
                            try {
                                var index = $scope.navCtrl.parent.previousTab();
                                $scope.navCtrl.parent.select(index);
                            } catch (error) {
                                $scope.navCtrl.pop();
                            }
                        } else {

                        }
                    }
                },
                {
                    text: Lang.L('ReLogin'),
                    handler: data => {
                        if (!data.password) {
                            GlobalService.consoleLog("密码为空，不处理");
                            return false;
                        }
                        //开始登录
                        $scope.password = data.password;
                        Util.loginCenter($scope, (res) => {
                            GlobalService.consoleLog("成功登录中心，获取盒子列表");
                            callback && callback(res);
                        },true);
                        return true;
                    }
                }
            ]
        })
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
            if (/^(doc|docx|txt)$/.test(suffix)) {
                return "doc";
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
            fullpath: JSON.stringify(path)
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
            dst_path: newPath + newName
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

    getThumbnail(list, isHasPath, currPath = '') {
        //获取最新拉取的一页的缩略图
        let noThumbnailList = list.filter(item => {
            let type = this.computeFileType(item.name);
            return !item.thumbnail && (type === 'image');
        });
        for(let i = 0, len = noThumbnailList.length; i < len; i++) {
            setTimeout(()=>{
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
                // GlobalService.consoleLog("缩略图名字的远程路径：" + this.currPath + "---" + noThumbnailList[i].name);
                GlobalService.consoleLog("本地路径尝试：" + localThumbnailPath + thumbnailName);
                this.http.getFileLocalOrRemote(this.global.ThumbnailRemotePath + "/", localThumbnailPath, thumbnailName, this.global.ThumbnailSubPath)
                .then(res => {
                    if(res) {
                        GlobalService.consoleLog("数据获取完毕：" + JSON.stringify(res));
                        noThumbnailList[i].thumbnail = res;
                        this.global.thumbnailMap[md5] = res;                        
                    } else {
                        //缩略图不存在，获取原图
                        this.http.getFileLocalOrRemote(noThumbnailList[i].path, this.global.fileSavePath + this.global.PhotoSubPath + "/", noThumbnailList[i].name, this.global.PhotoSubPath)
                        .then(res => {
                            GlobalService.consoleLog("数据原图获取完毕：" + JSON.stringify(res));
                            noThumbnailList[i].thumbnail = res;
                            this.global.thumbnailMap[md5] = res;                               
                        })
                    }
                })
                .catch(e => {
                    GlobalService.consoleLog("下载异常....");
                })                
            }, i * 100);
        }
    }
}
