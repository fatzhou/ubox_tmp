import { Component, ViewChild } from '@angular/core';

import { Events, Nav, Platform, Tabs } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { StatusBar } from '@ionic-native/status-bar';

import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

import { DeviceListPage } from '../pages/device-list/device-list';
import { TabsPage } from '../pages/tabs/tabs';
// import { RegisterPage } from '../pages/register/register';
// import { ResetPasswdPage } from '../pages/reset-passwd/reset-passwd';
// import { UserPage } from '../pages/user/user';
// import { HomePage } from '../pages/home/home';
// import { MiningPage } from '../pages/mining/mining';
import { WalletSelectPage } from '../pages/wallet-select/wallet-select';
import { SearchPage } from '../pages/search/search';

import { LoginPage } from '../pages/login/login';
// import { ResultPage } from '../pages/result/result';
// import { ListPage } from '../pages/list/list';

import { GlobalService } from '../providers/GlobalService';
import { HttpService } from '../providers/HttpService';
import { Lang } from '../providers/Language';
import { Util } from '../providers/Util';

import { TaskListPage } from '../pages/task-list/task-list';
import { GuidancePage } from '../pages/guidance/guidance';
import { PermissionPage } from '../pages/permission/permission';

// import { AgreementPage } from '../pages/agreement/agreement'
// import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy'
// import { NoticeListPage } from '../pages/notice-list/notice-list'
// import { NoticeDetailPage } from '../pages/notice-detail/notice-detail'

import { Network } from '@ionic-native/network';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

import { WalletDetailPage } from '../pages/wallet-detail/wallet-detail';
import { CoinSendPage } from '../pages/coin-send/coin-send';
import { CoinTransactionPage } from '../pages/coin-transaction/coin-transaction';

import { ExportKeystorePage } from '../pages/export-keystore/export-keystore';
import { VerifyEmailPage } from '../pages/verify-email/verify-email';
import { Web3Service } from '../providers/Web3Service';
import { Md5 } from 'ts-md5/dist/md5';
import { AppsInstalled } from '../providers/AppsInstalled';
import { File } from '@ionic-native/file';
import { MenuController } from 'ionic-angular';
import { FileManager } from '../providers/FileManager';
import { FindPage } from '../pages/find/find';
import { SuperTabsController } from 'ionic2-super-tabs/dist/providers/super-tabs-controller';
import { NoticeListPage } from '../pages/notice-list/notice-list';
import { DeviceGuidancePage } from '../pages/device-guidance/device-guidance';
import { ResultPage } from '../pages/result/result';

declare var chcp: any;
declare var WifiWizard: any;
declare var cordova: any;
declare var window: any;

@Component({
    templateUrl: 'app.html'
})
export class UboxApp {
    // the root nav is a child of the root app component
    // @ViewChild(Nav) gets a reference to the app's root nav
    @ViewChild(Nav) nav: Nav;

    rootPage:any;
    needTips: Boolean = false;
    fileListString: any;

    constructor(
        public events: Events,
        public platform: Platform,
        private network: Network,
        public storage: Storage,
        private appInstalled: AppsInstalled,
        private fileManager: FileManager,
        private global: GlobalService,
		private http: HttpService,
		private file: File,
		private menuCtrl: MenuController,
        private alertCtrl: AlertController,
        // private statusBar: StatusBar,
        public splashScreen: SplashScreen,
		private util: Util,
		private tabsController: SuperTabsController,
        private web3: Web3Service
    ) {
        GlobalService.consoleLog("开始全局构造。。。");

        this.events.subscribe('root:changed', (page) => {
            GlobalService.consoleLog("接收到root页面更改事件......")
            try {
                // this.rootPage = page;
                this.nav.setRoot(page);
                // this.rootPage = page;
            } catch(e) {
                GlobalService.consoleLog("异常！！！");
                // this.rootPage = page;
            }
        })

        this.platformReady();
    }

    platformReady() {
        this.platform.ready().then(() => {
            GlobalService.consoleLog("平台加载完毕@@@@@@");
            this.util.getDeviceID();
            this.global.platformName = this.platform.is('android') ? 'android' : 'ios';
            if (this.platform.is('cordova')) {
                // GlobalService.consoleLog(JSON.stringify(this.statusBar))
                // this.statusBar.styleDefault();
                // this.statusBar.overlaysWebView(true);
                // this.statusBar.backgroundColorByHexString('#000000');
                this.splashScreen.hide();

                //检查更新
                // this.checkHotUpdate();

                //检查网络
                this.checkNetwork();

                //设置文件存储路径
                if(this.platform.is('android')) {
                    GlobalService.consoleLog('------android-------');
                    this.global.fileSavePath = cordova.file.externalDataDirectory;
                } else if(this.platform.is('ios')){
                    GlobalService.consoleLog('-------ios---------');
                    this.global.fileSavePath = cordova.file.dataDirectory;
                } else {
                    GlobalService.consoleLog('-------others---------');
                    this.global.fileSavePath = "/tmp/";
                }
                this.global.fileRootPath = cordova.file.externalRootDirectory;

                //获取已安装应用列表
				this.appInstalled.getInstalledApps();
				
				this.createSubFolders();
            } else {
                GlobalService.consoleLog("我不是cordova");
				this.nav.setRoot(LoginPage);
				// this.rootPage = TestPage;
            }

            this.getUserInfo();
            this.initReadPermitted();
            //恢复下载列表
            this.initFileTaskList();

            //初始化营销消息和查看过的消息
            this.initNotice();
            this.initNoticeBrowseList();

            //设置语言
            this.initLanguage();

            //注册返回按钮事件
            this.removeBackButtonAction();
            // this.util.getDeviceID();
        });
	}
	
	createSubFolders() {
		[this.global.ThumbnailSubPath, this.global.PhotoSubPath, this.global.VideoSubPath, this.global.MusicSubPath, this.global.DocSubPath].forEach(item => {
			this._checkAndCreateFolder(item);
		})
	}

	_checkAndCreateFolder(name) {
		this.file.checkDir(this.global.fileSavePath, name)
		.then(res => {
			GlobalService.consoleLog("目录" + name + "已存在");
		}, res => {
			GlobalService.consoleLog("即将新建目录" + name);
			this.file.createDir(this.global.fileSavePath, name, false)
			.then(res => {
				console.log("目录创建成功：" + name + JSON.stringify(res))
			})
			.catch(e => {
				console.log("目录创建失败：" + name + JSON.stringify(e))			
			})
		});
	}

    getUserInfo() {
		if(!this.platform.is('cordova')) {
			console.log("设置首页........");
			this.nav.setRoot(LoginPage);
			return false;			
		}

        if(!this.global.networking) {
            GlobalService.consoleLog("网络异常，请先打开网络.....");
            return false;
		}
		let flag:Boolean = false;
        let timeout = setTimeout(() => {
            if(!flag) {
                this.nav.setRoot(LoginPage);
            }
        }, 5000);
        let url = GlobalService.centerApi['getUserInfo'].url;
        this.http.post(url, {}, false)
        .then(res => {
			clearTimeout(timeout);
            if(res.err_no === 0) {
				flag = true;
                this.global.centerUserInfo = res.user_info;
                //获取版本号
                this.util.loginAndCheckBox(this)
                .then(res => {
					console.log("loginAndCheckBox成功进入resolve....");
                    if(this.global.centerUserInfo.uname) {
                        this.nav.setRoot(TabsPage);
                    } else {
                        this.nav.setRoot(LoginPage);
                    }
                })
				.catch(e => {   
					flag = true;                 //没有盒子
                    this.nav.setRoot(TabsPage);
                })
            } else {
				flag = true;
                this.nav.setRoot(LoginPage);
            }
        })
        .catch(res => {
			clearTimeout(timeout);
			flag = true;
            this.nav.setRoot(LoginPage);
        })
    }

    getWifiName() {
        //获取wifi名称
        WifiWizard.getCurrentSSID((info) => {
            GlobalService.consoleLog("成功获取到wifi信息：" + info);
            this.global.wifiName = info;
        }, () => {
            GlobalService.consoleLog("获取当前连接的wifi失败！！！！！");
        });
    }

    onDeviceReady(){
        GlobalService.consoleLog("statusbar 的颜色")
        //this.statusBar.backgroundColorByHexString("#007c36");
    }

    initReadPermitted() {
        this.storage.get('ReadPermitted')
        .then(res => {
            if(res) {
                this.fileManager.readPermitted = true;
            }
        })
        .catch(e => {
        })
    }
    initGuidance() {
        this.storage.get('Guidance')
        .then(res => {
            GlobalService.consoleLog("缓存引导状态：" + res);
            if(res) {
                // this.rootPage =  SelectfolderPage;
                if(this.global.networking && this.network.type != "wifi") {
                    this.global.useWebrtc = true;
                    this.nav.setRoot(LoginPage);//LoginPage;
                }else{
                    this.nav.setRoot(DeviceListPage);//DeviceListPage;
                }
            } else {
                this.nav.setRoot(PermissionPage);//PermissionPage;
                // this.rootPage =  SelectfolderPage;
            }
        })
        .catch(e => {
            this.nav.setRoot(DeviceListPage);
        })
    }

    initLanguage() {
        this.storage.get('Lang')
        .then(res => {
            GlobalService.consoleLog("缓存读取语言：" + res);
            if(res) {
                GlobalService.applang = res;
            } else {
                var language = window.navigator.language;
                if(language.indexOf('ko') > -1) {
                    GlobalService.applang = 'kr';
                }
            }
        })
        .catch(e => {
            GlobalService.consoleLog("解析语言出错:" + JSON.stringify(e));
            GlobalService.applang = 'en';
        })

        this.storage.get('selectedRate')
        .then(res => {
            GlobalService.consoleLog("缓存读取汇率：" + res);
            if(res) {
                this.global.coinUnit = res;
            } else {
                this.global.coinUnit = "USD";
            }
        })
        .catch(e => {
            GlobalService.consoleLog("解析语言出错:" + JSON.stringify(e));
            GlobalService.applang = 'en';
        })
    }

    initFileTaskList() {
        this.storage.get('fileTaskList')
        .then(res => {
            if (res) {
                GlobalService.consoleLog("缓存载入任务列表:" + JSON.stringify(res));
                this.global.fileTaskList = JSON.parse(res);
                if (res.length) {
                    this.global.fileTaskList.forEach(item => {
                        //所有下载任务设置为暂停状态
                        if (item.finished === false) {
                            item.pausing = 'paused';
                        }
                    })
                }
            }
        })
        .catch(e => {
            GlobalService.consoleLog('读缓存错误:' + JSON.stringify(e));
        })

        //每隔5秒钟，保存文件下载/上传任务到缓存中
        setInterval(() => {
            this.saveFileTask();
        }, 10000);

        this.events.subscribe('task:created', ()=>{
            GlobalService.consoleLog("收到新建任务事件，立即写入缓存");
            this.saveFileTask();
        });

        this.events.subscribe('file:updated', ()=>{
            GlobalService.consoleLog("收到完成任务事件，立即写入缓存");
            this.saveFileTask();
		});
		
		this.events.subscribe('file:savetask', ()=>{
            GlobalService.consoleLog("收到完成任务事件，立即写入缓存");
            this.saveFileTask();
        });
    }

    initNotice(){
        var url =GlobalService.centerApi["noticeMarketList"].url;
        this.http.post(url, {
            timeStamp: 0,
        }, false).then(res => {
            if(res.err_no == 0){
                if(res.list){
                    if(res.list.length > 0){
                        this.global.nowNoticeList = res.list;
                    }
                }
            }
        }).catch(e => {
            GlobalService.consoleLog("获取营销消息失败");
        })
    }

    initNoticeBrowseList() {
        this.storage.get('noticeBrowseList')
        .then(res => {
            if (res) {
                this.global.noticeBrowseList = JSON.parse(res);
            }
        })
        .catch(e => {
            GlobalService.consoleLog('读缓存错误:' + JSON.stringify(e));
        })
        this.storage.get('allNoticeList')
        .then(res => {
            if (res) {
                this.global.allNoticeList = JSON.parse(res);
            }
        })
        .catch(e => {
            GlobalService.consoleLog('读缓存错误:' + JSON.stringify(e));
        })

    }

    saveFileTask() {
        var fileListString = Md5.hashStr(JSON.stringify(this.global.fileTaskList)).toString();
        if (this.global.fileTaskList.length > 0 && fileListString != this.fileListString) {
            GlobalService.consoleLog("保存文件任务列表:" + fileListString);
            this.storage.set('fileTaskList', JSON.stringify(this.global.fileTaskList));
            this.fileListString = fileListString;
        }
    }

    checkNetwork() {
        let platform = this.platform,
            network = this.network,
            global = this.global;

        global.networking = !!navigator.onLine;
        GlobalService.consoleLog("您的网络状态为:" + global.networking);
        GlobalService.consoleLog("您的网络类型为:" + global.networkType);
        if(global.networking && this.network.type == "wifi") {
            this.getWifiName();
            global.networkType = this.network.type;
        }
        if(global.networking && this.network.type != 'wifi'){
            GlobalService.consoleLog("除了wifi类型的网络赋值");
            global.networkType = this.network.type;
        }

        if(!global.networking) {
            this.createNetworkingAlert();
        }
        // this.initGuidance();

        network.onDisconnect().subscribe(() => {
            global.networking = false;
            GlobalService.consoleLog("网络已断开");
            GlobalService.consoleLog("网络端开后的networkType   :" + this.network.type);
            this.global.wifiName = "";
            this.global.networkType = "";
            this.global.closeGlobalAlert(this);
            this.global.closeGlobalLoading(this);
            this.createNetworkingAlert();
            this.global.fileTaskList.filter(item => {
                return item.finished === false;
            }).map(item => {
                item.pausing = 'waiting';
                if(this.global.fileHandler[item.taskId]) {
                    this.global.fileHandler[item.taskId].pause();
                }
            });
        });

        network.onConnect().subscribe(() => {
            //网络连接后的相关设置
            this.networkOnConnect();
        });

        //ios需手动监测网络变化
        if(this.platform.is('ios')) {
            let storedNetwork = this.network.type;
            setInterval(()=>{
                let type = this.network.type;
                if(type !== storedNetwork) {
                    GlobalService.consoleLog(`网络从${storedNetwork}变成了${type}`);
                    if(storedNetwork === 'wifi' && this.check4G(type) || type === 'wifi' && this.check4G(storedNetwork)) {
                        GlobalService.consoleLog("------------wifi和4g切换--------");
                        this.networkOnConnect();
                    }
                    storedNetwork = type;
                }
            }, 2000);
        }
    }

    check4G(net) {
        return (net === '4g' || net === '3g' || net === '2g');
    }

    networkOnConnect() {
        let global = this.global;
        global.networking = true;
        GlobalService.consoleLog("网络已连接");
        global.closeGlobalAlert(this);
        global.closeGlobalLoading(this);
        global.networkType = this.network.type;
        GlobalService.consoleLog("网络连接后的networkType   :" + this.network.type);
        //网络连接恢复，webrtc模式重置datachannel
        if(global.useWebrtc) {
			this.http.channelLabels.forEach(label => {
				this.http.channels[label].status = 'closed';
			})
        }
        // if(global.networkType === 'wifi') {
        //     this.getWifiName();
        //     //继续使用打洞模式
        // } else if(this.check4G(global.networkType)) {
        //     if(!this.global.useWebrtc && this.global.centerUserInfo.uname) {
        //         this.http.initWebrtc();
        //     }
        // }
        this.getUserInfo();
    }

    createNetworkingAlert() {
        // if (this.platform.is('android')) {
            // GlobalService.consoleLog("Android设备！");
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD94864389'),
                message: Lang.L('PlsCheckNetwork'),
                buttons: [{
                    "text": Lang.L('WORDce5f6618'),
                    handler: () => {
                        GlobalService.consoleLog('即将设置网络');
                        OpenNativeSettings.prototype.open('wifi')
                            // openNativeSettings.open('wifi')
                            .then(() => {
                                GlobalService.consoleLog("打开wifi设置成功");
                                this.global.closeGlobalAlert(this);
                                this.global.closeGlobalLoading(this);
                            }, () => {
                                GlobalService.consoleLog("打开wifi设置失败");
                            })
                            // return false;
                    }
                }]
            });
        // } else {
        //     GlobalService.consoleLog("IOS设备");
        //     this.global.createGlobalAlert(this, {
        //         title: Lang.L('WORD94864389'),
        //         message: Lang.L('PlsCheckNetwork'),
        //         buttons: [{
        //             "text": Lang.L('WORDd0ce8c46'),
        //             handler: ()=>{
        //                 return true;
        //             }
        //         }]
        //     });
        // }

    }

    checkHotUpdate() {
        GlobalService.consoleLog("请求更新资源:" + GlobalService.hotPath[GlobalService.ENV]);
        const options = {
            'config-file': GlobalService.hotPath[GlobalService.ENV] + "/chcp.json"
        };
        GlobalService.consoleLog("fetch update now!");
        chcp.fetchUpdate(this.updateCallback.bind(this), options);
    }

    updateCallback(error) {
        GlobalService.consoleLog("fetch successful...");
        if (error) {
            GlobalService.consoleLog('您无需更新: ' + error.code);
            GlobalService.consoleLog(error.description);
        } else {
            GlobalService.consoleLog('更新已加载');
            let alert = this.alertCtrl.create({
                title: Lang.L('WORD997457d4'),
                message: Lang.L('WORDebb0158d'),
                enableBackdropDismiss: false,
                buttons: [{
                    "text": Lang.L('WORD85ceea04')
                }, {
                    "text": Lang.L('WORDd0ce8c46'),
                    "handler": () => {
                        chcp.installUpdate(error => {
                            if (error) {
                                GlobalService.consoleLog('Failed to install the update with error code: ' + error.code);
                                GlobalService.consoleLog(error.description);
                            } else {
                                GlobalService.consoleLog('Update installed!');
                            }
                        });
                    }
                }]
            });
            alert.present();
        }
	}
	
	stopAllTask() {
		this.global.fileTaskList.filter(item => {
			return item.finished == false && item.pausing == 'doing';
		}).forEach(item => {
			let taskId = item.taskId;
			let handler = this.global.fileHandler[taskId];
			if(handler) {
				handler.pause();
			}
		})
	}

    removeBackButtonAction() {
        var start = Date.now();
        this.platform.registerBackButtonAction(() => {
          // get current active page
          let view = this.nav.getActive();
          this.global.closeGlobalLoading(this);
          if(view.component == TabsPage) {
            var end = Date.now();
            if(end - start < 1500) {
				this.stopAllTask();
				setTimeout(() => {
					this.platform.exitApp();
				}, 300);
            } else {
                start = end;
            }
          } else {
            this.nav.pop({});
          }
        });
	}
	
	goPage(name) {
		this.menuCtrl.close();
		switch(name) {
			case 'file':
				this.nav.setRoot(TabsPage)
				.then(res => {
					console.log(res)
					this.tabsController.slideTo(0);
				});
				break;
			case 'discover':
				this.nav.setRoot(TabsPage)
				.then(res => {
					console.log(res)
					this.tabsController.slideTo(1);
				});
				break;
			case 'mining':
				this.nav.setRoot(TabsPage)
				.then(res => {
					this.tabsController.slideTo(2);
				})
				break;
			case 'wallet':
				this.nav.push(WalletSelectPage);
				break;
			case 'dapp':
				this.nav.push(SearchPage);
				break;
			case 'notice':
				this.nav.push(NoticeListPage);
				break;
			case 'setting':
				this.nav.setRoot(TabsPage)
				.then(res => {
					console.log(res)
					this.tabsController.slideTo(3);
				});
				break;	
			case 'deviceguidance':
				this.nav.push(DeviceGuidancePage);
				break;		
		}
	}
}
