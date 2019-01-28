import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { WalletSelectPage } from '../wallet-select/wallet-select';
import { DeviceListPage } from '../device-list/device-list';
import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';
import { DeviceManagementPage } from '../device-management/device-management';
import { LanguageSelectPage } from '../language-select/language-select';
import { ChangePasswdPage } from '../change-passwd/change-passwd';
import { AboutUsPage } from '../about-us/about-us';
import { NoticeListPage } from '../notice-list/notice-list';
import { SystemSettingPage } from "../system-setting/system-setting";
import { UpdateAssitantPage } from "../update-assitant/update-assitant";
import { AdviceSubmitPage } from '../advice-submit/advice-submit';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';

/**
 * Generated class for the UserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var chcp: any;
@Component({
    selector: 'page-user',
    templateUrl: 'user.html',
})
export class UserPage {
    // username: String = "";
    updateTime: any = 0;
    isShowNotice: Boolean = false;

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private util: Util,
        private app: App,
        private events: Events,
        public navParams: NavParams) {
            this.events.subscribe('isShow:false', () => {
                GlobalService.consoleLog("成功接收到事件");
                this.isShowNotice = false;
            })
        }

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidLoad UserPage   进入user');
        // console.log("用户信息：" + JSON.stringify(this.global.centerUserInfo));
        // this.username = this.global.centerUserInfo.uname;
        this.isShowNoticeList();
    }

    goLoginPage(b) {
        if(this.global.centerUserInfo.uname) {
            return false
        }
        this.app.getRootNav().push(LoginPage)
    }

    goAdvicePage() {
        this.app.getRootNav().push(AdviceSubmitPage);
    }
 
    goUpdatePage() {
        this.app.getRootNav().push(UpdateAssitantPage);
    }

    goWalletSelectPage() {
        if(!!this.global.deviceSelected) {
            this.app.getRootNav().push(WalletSelectPage);
        } else {
            if(this.global.centerUserInfo.uname == undefined) {
                //尚未登录
                this.global.createGlobalToast(this, {
                    message: Lang.L('NeedLogin')
                })
            } else {
                if(this.global.centerUserInfo.bind_box_count > 0) {
                    //盒子不在线
                    this.global.createGlobalToast(this, {
                        message: Lang.L('WORD0e77bf3e')
                    });                    
                } else {
                    //未绑定盒子
                    this.app.getRootNav().push(WalletSelectPage);
                }
            }
        }
        return false;
    }

    goDeviceManagementPage() {
        if(!!this.global.deviceSelected) {
    	   this.app.getRootNav().push(DeviceManagementPage);
        } else {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDce7b4940')
            });
            return false;
        }
    }

    goDeviceListPage() {
       this.app.getRootNav().push(LoginPage);   
    }

    goChangePasswdPage() {
        if(!!this.global.deviceSelected || this.global.centerUserInfo.bind_box_count === 0) {
            this.app.getRootNav().push(ChangePasswdPage);
        } else {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDb38ae5d2')
            });
            return false;
        }
    }

    goSystemSettingPage() {
    	this.app.getRootNav().push(SystemSettingPage);
    }

    updateCallback(error) {
        setTimeout(()=>{
            this.global.loadingCtrl && this.global.loadingCtrl.dismiss();
            GlobalService.consoleLog("fetch successful...");
            if (error) {
                GlobalService.consoleLog("您无需更新: " + error.code);
                GlobalService.consoleLog(error.description);
                this.global.createGlobalToast(this, {
                    message: Lang.L('WORD73de1e81'),
                });
            } else {
                GlobalService.consoleLog("更新已加载");
                this.global.createGlobalAlert(this, {
                    title: Lang.L('WORD997457d4'),
                    message: Lang.L('WORDebb0158d'),
                    enableBackdropDismiss: false,
                    buttons: [{
                        "text": Lang.L('Cancel')
                    }, {
                        "text": Lang.L('Ok'),
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
            }
        }, 3000 - (Date.now() - this.updateTime))
    }

    checkUpdate() {
        GlobalService.consoleLog("请求更新资源:" + GlobalService.hotPath[GlobalService.ENV]);
        const options = {
            'config-file': GlobalService.hotPath[GlobalService.ENV] + "/chcp.json"
        };
        GlobalService.consoleLog("fetch update now!");
        this.global.createGlobalLoading(this, {
            message: Lang.L('WORD51452558')
        });
        this.updateTime = Date.now();
        chcp.fetchUpdate(this.updateCallback.bind(this), options);
    }

    goAboutUsPage() {
        this.app.getRootNav().push(AboutUsPage);
    }

    logoutSystem() {
        var self = this;
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD79e4bc03'),
            message: Lang.L('WORDf6cdb0fc'),
            buttons: [
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                    }
                },
                {
                    text: Lang.L('WORD79e4bc03'),
                    handler: data => {
                        self.util.logout(()=>{
                            self.goDeviceListPage();
                        });
                    }
                }
            ]
        })
    }

    goDevicePage() {
        this.global.centerUserInfo = {};
        this.global.boxUserInfo = {};
         this.global.createGlobalToast(this, {
            message: Lang.L('WORD64595209'),
        });
        setTimeout(()=>{
            this.app.getRootNav().push(DeviceListPage, {
                refresh: false
            });
        }, 200);    
    }

    goNoticePage(){
        this.app.getRootNav().push(NoticeListPage);
    }

    isShowNoticeList(){
        var url = GlobalService.centerApi["noticeList"].url;
        let timeStamp = 0;
        GlobalService.consoleLog("timeStamp  1  " + timeStamp);
        if(this.global.allNoticeList != undefined && this.global.allNoticeList.length > 0){
            timeStamp = this.global.allNoticeList[0].timeStamp;
        }
        
        this.http.post(url, {
            timeStamp: timeStamp,
            startPos: 0,
            endPos: 5,
        })
        .then((res) => {
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                if (res.list && res.list.length > 0) {    
                    this.isShowNotice = true;
                }
            }
        })
    }
}
