import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Tabs, Nav } from 'ionic-angular';
import { FindPage } from '../find/find';
import { ListPage } from '../list/list';
import { MiningPage } from '../mining/mining';
import { UserPage } from '../user/user';
import { Util } from '../../providers/Util';
import { Platform } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { CheckUpdate } from '../../providers/CheckUpdate';
import { AboutDevicePage } from '../about-device/about-device';
import { LoginPage } from '../login/login';
import { NoticeListPage } from '../notice-list/notice-list';
import { NoticeDetailPage } from '../notice-detail/notice-detail';
import { Storage } from '@ionic/storage';
import { Md5 } from 'ts-md5/dist/md5';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { AppsInstalled } from '../../providers/AppsInstalled';
import { FileOpener } from '@ionic-native/file-opener';
import { SuperTabsController } from 'ionic2-super-tabs/dist/providers/super-tabs-controller';
declare var window;

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {
    // @ViewChild('boxtabs') tabRef: Tabs;
    @ViewChild(Nav) nav: Nav;
    // selectedIndex:any = 0;
    search: any = FindPage;
    home: any = ListPage;
    user: any = UserPage;
    mining: any = MiningPage;
    version: any = "";
    // searchIcon: string = 'custom-home-active';
    // fileIcon: string = 'custom-file-active';
    // miningIcon: string = 'custom-mining';
    // userIcon: string = 'custom-user';

    // HomeTitle:string;
    // DiscoverTitle:string;
    // MiningTitle:string;
    // UserTitle:string;

    info: any = [];
    head: any = [];
    btnText: string = "";
    action: any = "";
    toVersion: '';
    versionControl: any = {};
    appVersionDescription: any = null;
    boxVersionDescription: any = null;
    isClose: boolean = false;
    closeBtn: boolean = false;
    isShowAction: boolean = false;
    isVersion: boolean = true;
    boxUpdateInfo: any = {};
    isShowShareBox: boolean = false;
    isEnough: boolean = true;
    sharePercentum: any = 0;
    shareStorage: any = 0;
    allShareStorage: any = 0;
    oneShareStorage: any = 4;
    spanWidth: any = 0;
    // selectIndex: any = 0;
    popupShown:boolean = false;
    connectionStatus = "remote";
    isCloseBindBox: boolean = false;
    constructor(public navCtrl: NavController,
        private http: HttpService,
        private global: GlobalService,
        private checkUpdate: CheckUpdate,
        private events: Events,
        public storage: Storage,
        private util: Util,
        private platform: Platform,
		private appInstalled: AppsInstalled,
		private tabsCtrl: SuperTabsController,
        private fileOpener: FileOpener,
        public navParams: NavParams,) {
        GlobalService.consoleLog("tabs页面构造函数");

        this.versionControl = GlobalService.VersionControl;
        this.appVersionDescription = GlobalService.AppVersionDescription;
        this.boxVersionDescription = GlobalService.BoxVersionDescription;

        // this.HomeTitle = this.global.L('Home')
        // this.DiscoverTitle = this.global.L('Discover');
        // this.MiningTitle = this.global.L('Mining');
        // this.UserTitle = this.global.L('User');

        // window.handleOpenURL = (url) => {
        //     GlobalService.consoleLog("Url已打开...." + url);
        //     let reg = /^ubbeybox:\/\/(\w+)?(\?.+)?$/g;
        //     let matches = url.match(reg);
        //     if(matches) {
        //         let method = matches[1],
        //             params = matches[2];
        //         if(method == 'pay') {

        //         }
        //     }
        // }

        this.events.subscribe('update-box', () => {
            GlobalService.consoleLog('提示用户升级box');
            return this.checkUpdate.updateRom({
                dialog: false
            })
            .then((res: any) => {
                if (res.type === 'optional') {
                    GlobalService.consoleLog("即将升级到版本:" + res.data.dstVer);
                    let version = res.data.dstVer;
                    if (!this.boxVersionDescription[version]) {
                        console.error("盒子版本" + version + "未配置");
                        this.isClose = false;
                        throw new Error("Version not configed");
                    }
                    this.boxUpdateInfo = res.data;
                    this.toVersion = version;
                    this.info = this.boxVersionDescription[version][GlobalService.applang];
                    this.head = this.global.NewVersionHead[GlobalService.applang];
                    this.btnText = Lang.L('Update');
                    this.action = this.updateBoxIndeed.bind(this);
                    this.isClose = true;
                    this.isShowAction = true;
                } else if(res.type == 'force') {
					this.checkUpdate._checkUpdateStatus(()=> {
						this.global.closeGlobalLoading(this);
						//升级成功
						this.global.createGlobalToast(this, {
							message: Lang.L('uploadFinished')
						})
						this.checkVersion();
					}, () => {
						this.global.closeGlobalLoading(this);
						//升级失败
						this.global.createGlobalToast(this, {
							message: Lang.L('updateRomError')
						})
					})
				}
            })
            .catch(e => {
                GlobalService.consoleLog(e.stack);
            })
        })

        //外部要求升级app
        this.events.subscribe('update-app', () => {
            GlobalService.consoleLog('提示用户升级app');
            this.version = this.appVersionDescription.version;
            this.toVersion = this.appVersionDescription.version;
            this.info = this.appVersionDescription.content[GlobalService.applang];
            this.head = this.global.NewVersionHead[GlobalService.applang];
            this.btnText = Lang.L('Update');
            this.action = ()=>{this.util.updateAppIndeed(this)};
            this.isClose = true; //提示用户升级box
            this.isShowAction = true;

            GlobalService.DownloadPath['android'] = this.appVersionDescription.downloadUrl;
        })
        //外部通知获取钱包列表 
        this.events.subscribe('get-wallet', () => {
            this.util.getWalletList()
            .catch(e => {
                GlobalService.consoleLog(e);
            })
        })
        
        //触发检查更新
        
        this.events.subscribe('check-box-app', () => {
            GlobalService.consoleLog('准备检查固件升级');
            this.getVersionControl()
            .then((res) => {
                console.log('准备执行checkVersion');
                this.checkVersion();
            })
            .catch(e => {
                console.log('未执行checkVersion');
                GlobalService.consoleLog(e.stack);
                this.global.closeGlobalLoading(this);
                this.initNoticeList();
            })
        })
        //接收home传过来的关闭设备网络状态的事件
        this.events.subscribe('open-popup', ()=>{
            this.showPopup(true);
        })
        this.events.subscribe('open-bind-box', (res) => {
            this.isCloseBindBox = res;
        })
        //外部要求切换页面
        this.events.subscribe('page:changed', (pageId) => {
            GlobalService.consoleLog("接收到page页面更改事件......   id" + pageId);
            try {
                // this.rootPage = page;
                this.navCtrl.push(NoticeDetailPage, {
                    id: pageId
                });
            } catch(e) {
                GlobalService.consoleLog("异常！！！");
                this.navCtrl.push(NoticeListPage);
            }
        })

        this.events.subscribe('goPage:changed', (page) => {
            GlobalService.consoleLog("接收到page页面更改事件......")
            try {
                // this.rootPage = page;
                GlobalService.consoleLog(page)
                this.navCtrl.push(NoticeListPage);
            } catch(e) {
                GlobalService.consoleLog("异常！！！");
                this.navCtrl.push(NoticeListPage);
            }
        })

        this.events.subscribe('open-page', (page) => {
            GlobalService.consoleLog("打开外部链接......")
            try {
                // this.rootPage = page;
                this.util.openUrl(page);
            } catch(e) {
                GlobalService.consoleLog("异常！！！");
                window.open(page);
            }
        })

        this.events.subscribe('show-data', () => {
            try {
                this.isShowShareBox = true;
                this.getShareStorage();
            } catch(e) {
                GlobalService.consoleLog("打开浮层失败......")
            }
        })

        this.events.subscribe('token:expired', (res) => {
            GlobalService.consoleLog("登录态失效!!!");
            res.that.global.centerUserInfo = {};
            res.that.global.boxUserInfo = {};
            if(res.action == 'cancel') {
                let view = this.navCtrl.getActive();
                if(view.component == TabsPage) {
                    this.tabsCtrl.slideTo(0);
                } else {
                    this.tabsCtrl.slideTo(0);
                    this.navCtrl.setRoot(TabsPage);
                }
            } else {
                GlobalService.consoleLog('登录态失效去login')
                this.navCtrl.setRoot(LoginPage);
            }
        });
    }
    ngOnDestory() {
        this.events.unsubscribe('get-wallet');
        this.events.unsubscribe('check-box-app');
    }
    updateBoxIndeed() {
        GlobalService.consoleLog("开始升级盒子....");
        this.isClose = false;

        return new Promise((resolve, reject) => {
            GlobalService.consoleLog("升级信息:" + GlobalService.consoleLog(JSON.stringify(this.boxUpdateInfo)));
            this.checkUpdate.updateRomIndeed(this.boxUpdateInfo.dstVer, this.boxUpdateInfo.signature, resolve, reject);
        })
        .then(ver => {
			GlobalService.consoleLog("升级成功：" + ver);
			//升级成功需要刷新列表
			this.events.publish('list:refresh');
			//缩略图.........
            this.version = this.global.deviceSelected.version;
            this.checkVersion();
        })
        .catch(e => {
            GlobalService.consoleLog("首页升级出现异常：" + e.stack);
        })
    }

    loginFirst(index) {
        // this.selectedIndex = 0;
        if(!this.global.centerUserInfo.uname) {
            setTimeout(() => {
                GlobalService.consoleLog("跳转发现页");
                this.tabsCtrl.slideTo(0);
            }, 1000);
            this.navCtrl.push(LoginPage, {
                tabIndex: index
            })
        }
    }

    showPopup(b) {
        this.popupShown = b;
    }

    //远程获取配置
    getVersionControl() {
        var that = this;
        var url = GlobalService.versionConfig[GlobalService.ENV];
        console.log('this.global.firstLoadVersion ' + this.global.firstLoadVersion)
        if(this.global.firstLoadVersion == 0){
            return this.http.get(url, {}, false, {}, {}, true)
            .then((res:any) => {
                if(typeof res === 'string') {
                    res = JSON.parse(res);
				}
                if (res.appControls && res.boxVersionDescription && res.appVersionDescription) {
                    this.versionControl = res.appControls;
                    GlobalService.VersionControl = res.appControls;
                    this.boxVersionDescription = res.boxVersionDescription;
                    GlobalService.BoxVersionDescription = res.boxVersionDescription;
                    this.appVersionDescription = res.appVersionDescription;
                    GlobalService.AppVersionDescription = res.appVersionDescription;
                }
                this.global.firstLoadVersion = 1;
                return res;
            })
            .catch(e => {
                GlobalService.consoleLog('版本配置赋值出错:' + e.stack);
            })
        } else {
            return Promise.resolve(this.versionControl);
        }
    }

    checkVersion() {
        let index = this.checkUpdate.checkVersionMatch(this.versionControl);
        console.log('checkVersionMatch  ' + index);
        if (index < 0) {
            GlobalService.consoleLog("Not match rules! Check version ignore update.");
        } else {
            let action = this.versionControl[GlobalService.AppVersion].versionList[index].action;
            if (action) {
                try {
                    eval('(' + action + ')');
                } catch (e) {
                    GlobalService.consoleLog("执行action出错:" + e.message);
                }
            }
        }
    }
    
    ionViewDidLoad() {
        GlobalService.consoleLog('x...');
        if(this.global.deviceSelected) {
            this.util.getWalletList()
            .catch(e => {
                GlobalService.consoleLog(e);
            })
        }
		//获取汇率
		this.util.getDisplayRate();
        //初始化connection组件
        // this.connection.status = this.global.useWebrtc ? this.global.L('RemoteNetwork')
	}

	ionViewCanEnter() {
		//解决tabspage进入两次的问题
		if(!this.navCtrl) {
			GlobalService.consoleLog("没有navctrl......")
			return true;
		} else {
			GlobalService.consoleLog("进入tabs......")
			let view = this.navCtrl.getActive();
			if(!view || view.component != TabsPage) {
				return true;
			} else {
				return false;
			}
        }

		// return true;
	}

    ionViewDidEnter() {
        // if(this.global.centerUserInfo.bind_box_count > 0) {
        //     if(this.global.useWebrtc) {
		// 		let dataChannel = this.http.channels["request"];
		// 		if(dataChannel) {
		// 			let status = dataChannel.status;
		// 			//远场模式
		// 			if(status === 'opened') {
		// 				this.connectionStatus = 'remote';
		// 			} else if(status === 'opening') {
		// 				//盒子在线，尚未连接
		// 				this.connectionStatus = 'connecting';
		// 			} else {
		// 				this.connectionStatus = 'error';
		// 			}
		// 		} else {
		// 			//没有盒子在线
		// 			this.connectionStatus = 'error';
		// 		}
        //     } else {
        //         //近场模式
        //         this.connectionStatus = this.global.deviceSelected ? 'local' : 'error';
        //     }
        // } else {
        //     this.connectionStatus = 'local';
        // }

        let events = this.events;
        GlobalService.consoleLog('ionViewDidEnter TabsPage');
        // if(this.tabRef.getSelected() !== null){
        //     if((this.selectedIndex == 1 || this.selectedIndex == 2) && !this.global.centerUserInfo.uname){
        //         this.selectedIndex = 0;
        //         this.navCtrl.push(LoginPage)
        //     } else {
        //         this.events.publish('tab:enter', {
        //             pageId: this.tabRef.getSelected().index
        //         });
        //     }
        // }
        // GlobalService.consoleLog('this.global.mainSelectDiskUuid' + this.global.mainSelectDiskUuid);
        this.global.currDiskUuid = this.global.mainSelectDiskUuid;
        this.global.currSelectDiskUuid = this.global.mainSelectDiskUuid;
        GlobalService.consoleLog('this.global.currDiskUuid' + this.global.currDiskUuid + 'this.global.mainSelectDiskUuid' + this.global.mainSelectDiskUuid);
        this.global.currPath = '/';
        this.isClose = false;
        if (this.global.deviceSelected) {
            this.version = this.global.deviceSelected.version;

            this.isClose = false;
            // this.util.getDiskStatus()
            // .then(() => {
            if(this.global.currDiskUuid != '') {
                GlobalService.consoleLog('回到首页，刷新列表');
                this.events.publish('list:refresh');
                this.events.publish('check-box-app');
            }
            // })
            // .catch(e=> {
            //     GlobalService.consoleLog(e.stack);
            // })

        } else {
            // this.getVersionControl()
            // .then(res => {
            //     this.global.createGlobalAlert(this, {
            //         title: Lang.L('WarmRemind'),
            //         message: Lang.L('WORD2a0b753a'),
            //         buttons: [{
            //             "text": Lang.L('Close'),
            //             handler: () => {
            //                 this.tabsCtrl.slideTo(1);
            //             }
            //         }]
            //     });
            // })
            // .catch(e => {
                // this.global.createGlobalAlert(this, {
                //     title: Lang.L('WarmRemind'),
                //     message: Lang.L('WORD2a0b753a'),
                //     buttons: [{
                //         "text": Lang.L('Close'),
                //         handler: () => {
                //             this.tabsCtrl.slideTo(1);
                //         }
                //     }]
                // });
            // })
        }
       
    }

    setIcons(e) {
        // this.selectIndex = e.index;
        // this.selectIndex = e.index;
        // GlobalService.consoleLog("this.selectIndex" + this.selectIndex);
        // if(!this.global.centerUserInfo.uname && (this.selectIndex == 1 || this.selectIndex == 2)){
        //     this.selectedIndex = 0;
        //     this.navCtrl.push(LoginPage, {
        //         refresh: true
        //     })
        // } else {
        //     this.events.publish('tab:enter', {
        //         pageId: this.tabRef.getSelected().index
        //     });
        // }
        // let index = e.index;
        // if (index === 0) {
        //     this.searchIcon = 'custom-home';
        //     this.fileIcon = 'custom-file-active';
        //     this.miningIcon = 'custom-mining';
        //     this.userIcon = 'custom-user';
        // } else if (index === 1) {
        //     this.searchIcon = 'custom-home-active';
        //     this.fileIcon = 'custom-file';
        //     this.miningIcon = 'custom-mining';
        //     this.userIcon = 'custom-user';
        // } else if (index === 2) {
        //     this.searchIcon = 'custom-home';
        //     this.fileIcon = 'custom-file';
        //     this.miningIcon = 'custom-mining-active';
        //     this.userIcon = 'custom-user';
        // } else if (index === 3) {
        //     this.searchIcon = 'custom-home';
        //     this.fileIcon = 'custom-file';
        //     this.miningIcon = 'custom-mining';
        //     this.userIcon = 'custom-user-active';
        // }
    }

    goUpdatePage() {
        this.navCtrl.push(AboutDevicePage);
    }

    initNoticeList() {
        if(this.global.nowNoticeList.length > 0){
            let noticeId = this.global.nowNoticeList[0].id;
            GlobalService.consoleLog("nowNoticeList   id："+noticeId);
            let nowNoticeList = this.global.noticeBrowseList.filter(item => {
                return noticeId == item.id
            })[0];
            GlobalService.consoleLog("nowNoticeList"+nowNoticeList);
            if(!nowNoticeList){
                GlobalService.consoleLog("有可展示的营销消息");
                let formData = JSON.parse(this.global.nowNoticeList[0].msg);
                this.info = formData[GlobalService.applang].desc.split(/<br\s*(\/)?>/);
                this.head = formData[GlobalService.applang].name.split(/<br\s*(\/)?>/);
                if(formData[GlobalService.applang].input.length > 0){
                    this.btnText = formData[GlobalService.applang].input[0].key;
                    if(formData[GlobalService.applang].input[0].action == 'link'){
                        this.action = () => { this.events.publish("open-page", formData[GlobalService.applang].input[0].url) };
                    }else if(formData[GlobalService.applang].input[0].action == 'click' && formData[GlobalService.applang].input[0].url != ''){
                        this.action = () => { this.events.publish("goPage:changed", formData[GlobalService.applang].input[0].url ) };
                    }else{
                        GlobalService.consoleLog("noticeId   " +noticeId);
                        this.action = () => { this.events.publish("page:changed", noticeId) };
                    }
                }
                if(this.btnText.replace(/\s+/g, "") == ''){
                    this.isShowAction = false;
                }
                this.isClose = true;
                this.closeBtn = true;
                this.isVersion = false;
                this.global.noticeBrowseList.push(this.global.nowNoticeList[0]);
                this.storage.set('noticeBrowseList', JSON.stringify(this.global.noticeBrowseList));
            }
        }
    }

    closeNotice() {
        GlobalService.consoleLog("关闭浮层");
        this.isClose = false;
    }

    closeShareBox(){
        this.isShowShareBox = false;
    }

    getShareStorage(){
        this.http.post(this.global.getBoxApi('getMineProgress'), {})
        .then(res => {
            if(res.err_no === 0) {
                GlobalService.consoleLog("获取实时数据");
                this.allShareStorage = (res.sharesize / GlobalService.DISK_G_BITS).toFixed(0);
                this.shareStorage = (res.produce_filesize / GlobalService.DISK_G_BITS).toFixed(0);
                this.sharePercentum = ((this.shareStorage / this.allShareStorage) * 100).toFixed(2);
                this.spanWidth = document.body.clientWidth * 0.8 * (this.sharePercentum / 100);
                this.global.shareFileProduced = res.produce_filesize;
                if(res.status == 3){
                    this.isEnough = false;
                }else{
                    this.isEnough = true;
                }
            } else {
                throw new Error("Get mine progress error");
            }
        })
    }

    openAppUrl() {
        if(this.global.platformName == 'android') {
            this.fileOpener.appIsInstalled('com.android.vending')
            .then((res) => {
                GlobalService.consoleLog('openApp ' + JSON.stringify(res))
                if (res.status === 0) {
                    GlobalService.consoleLog('App is not installed.');
                } else {
                    window.open('market://details?id=com.ulabs.ubbeybox', '_system');
                }
            })
            .catch(e => {
                GlobalService.consoleLog('调用失败')
            })
        }

    }

    closeBindBox() {
        this.isCloseBindBox = false;
    }
    // ngAfterViewInit() {
    //     // must wait for AfterViewInit if you want to modify the tabs instantly
    //     this.superTabsCtrl.setBadge('homeTab', 5);
    // }

    // hideToolbar() {
    //     this.superTabsCtrl.showToolbar(false);
    // }

    // showToolbar() {
    //     this.superTabsCtrl.showToolbar(true);
    // }

    // onTabSelect(ev: any) {
    //     GlobalService.consoleLog('Tab selected', 'Index: ' + ev.index, 'Unique ID: ' + ev.id);
    // }
}
