import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { TabsPage } from '../tabs/tabs';
import { DeviceListPage } from '../device-list/device-list';
import { Md5 } from "ts-md5/dist/md5";
import { Util } from '../../providers/Util';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { analyzeAndValidateNgModules, flatten } from '@angular/compiler';
import { Events, Platform, App } from 'ionic-angular';
// import { WebrtcService } from "../../providers/WebrtcService";

// import { ChangepasswdPage } from '../changepasswd/changepasswd';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    username: any = "";
    // username: any = "792375705@qq.com";
    password: any = "";
    uError: Boolean = false;
    uErrorText: String = "";
    pError: Boolean = false;
    pErrorText: String = "";
    eyeshow:Boolean = false;
    showDes:Boolean = true;
    isLoading: boolean = false;
    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private events: Events,
        private util: Util,
        private app: App,
        public navParams: NavParams) {
        GlobalService.consoleLog("进入登陆页...");

    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad LoginPage');
        if(this.global.deviceSelected == null){
            this.showDes = false;
        }

        if(GlobalService.ENV === 'dev') {
            this.username = '1@qq.com';
            this.password = 'A123456789';       
        } else {
            this.util.getUserList()
            .then(res => {
                if(this.global.userLoginInfo){
                    this.username = this.global.userLoginInfo.username;
                    this.password = this.global.userLoginInfo.password;
                } else {
                    this.username = '';
                    this.password = '';
                }
            })             
        }

    }

    ionViewDidLeave(){
        if(this.username) {
            this.global.userLoginInfo = {
                username: this.username,
                password: this.password,
                timestamp: Date.now()
            };
            this.util.setUserList();            
        }
    }

    doLogin() {
        if(this.isLoading == true){
            return false;
        }
        this.isLoading = true;
        GlobalService.consoleLog("用户确认注册," + this.username + "," + this.password);
        this.username = this.username.replace(/^\s+|\s+$/g, '');
        this.uError = this.pError = false;
        this.uErrorText = this.pErrorText = "";
        var uCheck = Util.validator.email(this.username);

        if (uCheck) {
            GlobalService.consoleLog("用户名验证不通过");
            this.uError = true;
            this.uErrorText = ["", Lang.L('WORDa33756a9'), Lang.L('WORD7b2271a4')][uCheck];
            this.isLoading = false;
            return false;
        }
        if (!this.password) {
            GlobalService.consoleLog("密码为空，验证不通过");
            this.pError = true;
            this.pErrorText = Lang.L('WORD758b56bc');
            this.isLoading = false;
            return false;
        }
        GlobalService.consoleLog("参数校验通过，开始登录盒子");
        var boxSelected = this.global.deviceSelected;
        // debugger
        if(boxSelected && !this.global.useWebrtc) {
            GlobalService.consoleLog("已选择盒子，查看绑定情况");
            if(boxSelected.bindUser) {
                GlobalService.consoleLog("盒子已绑定用户，此时直接登录盒子:" + boxSelected.bindUser);
                this.loginBox();
            } else {
                GlobalService.consoleLog("盒子未绑定用户，需执行绑定逻辑");
                this.bindBox();                
            }
        } else {
            this.loginCenter();
        }

    }

    loginCenter() {
        GlobalService.consoleLog("远程登录！！！");
        
        this.global.createGlobalLoading(this, {
            message: Lang.L('SearchingBox')
        });

        Util.loginCenter(this, ()=>{
            this.http.initWebrtc();
            GlobalService.consoleLog("webrtc模式--用户开始登录盒子");
            //如果已经建立连接，则需要关闭并重新建立连接
            if(this.http.dataChannelOpen !== 'closed') {
                this.http.clearWebrtc();
            }
            
            this.http.globalCallbackList.push(() => {
                GlobalService.consoleLog("开始执行建立连接回调");
                if(this.global.centerBoxSelected) {
                    GlobalService.consoleLog("有盒子，直接登录盒子");
                    //当前有盒子在线，调用盒子登录接口
                    Util.loginBox(this, (res)=>{
                        this.global.closeGlobalLoading(this);
                        if(res.err_no === 0) {
                            this.global.resetWebrtc('webrtc');
                            this.global.boxUserInfo = res.userinfo || {};
                            this.util.getBoxVersion()
                            .then(version => {
                                GlobalService.consoleLog("查询版本号:" + version);
                                this.global.deviceSelected.version = version;
                                let device = this.global.foundDeviceList.filter(item => item.boxId === this.global.deviceSelected.boxId);
                                device.version = version;
                                GlobalService.consoleLog('第一个push')
                                this.global.closeGlobalLoading(this);
                                this.navCtrl.push(TabsPage)
                                .then(() => {
                                    this.isLoading = false;
                                })
                            })
                        } else {
                            this.global.closeGlobalLoading(this);
                            this.isLoading = false;
                        }
                    }, false)                      
                } else {
                    GlobalService.consoleLog("没有可用盒子的情况下跳转首页");
                    //当前没有盒子在线
                    this.global.closeGlobalLoading(this);
                    GlobalService.consoleLog('第二个push')
                    this.navCtrl.push(TabsPage)
                    .then(() => {
                        this.isLoading = false;
                    })
                }
            }) 
            GlobalService.consoleLog(this.http.globalCallbackList.length + '=========')               
        }, true, () => {
            this.global.closeGlobalLoading(this);
            this.isLoading = false;
        });
    }

    loginBox() {
        let res:any = {};
        Util.loginBox(this, (res)=>{
            if(res.err_no === 0) {
                GlobalService.consoleLog("登录成功！")
                this.navCtrl.push(TabsPage)
                .then(() => {
                    this.isLoading = false;
                })               
            } else if(res.err_no === 1101) {
                //登陆失败，可能是因为盒子重置了或者其他APP解除绑定了
                // let view = this.navCtrl.getActive().name;
                // let root = this.app.getRootNav().root.name;
                // GlobalService.consoleLog("名字:" + view + "," + root);
                // GlobalService.consoleLog(this.navCtrl.length)
                if(this.navCtrl.length() === 1) {
                    setTimeout(()=>{
                        //此时应当提示用户重新扫描
                        this.global.createGlobalAlert(this, {
                            title: Lang.L("AccountError"),
                            message: Lang.L("AccountErrorReason"),
                            buttons: [
                                {
                                    text: Lang.L("ReInput"),
                                    handler: data => {
                                        // this.handleBack();
                                        this.isLoading = false;
                                    }
                                },
                                {
                                    text: Lang.L("ReScan"),
                                    handler: data => {
                                        this.util.logout(()=>{
                                            // this.events.publish('root:changed', DeviceListPage);
                                            this.navCtrl.push(DeviceListPage, {
                                                refresh: true
                                            })
                                            .then(() => {
                                                this.isLoading = false;
                                            })
                                        })
                                    }
                                }
                            ]
                        });                        
                    }, GlobalService.ToastTime)
                } else {
                    this.isLoading = false;
                }                 
            } else {
                this.isLoading = false;
            }               
        }, true, () => {
            this.isLoading = false;
        });
    }

    bindBox() {
        Util.bindBox(this, ()=>{
            GlobalService.consoleLog('第四个push')
            this.navCtrl.push(TabsPage)
            .then(() => {
                this.isLoading = false;
            })
        },() => {
            this.isLoading = false;
        })
    }

    goRegisterPage() {
        GlobalService.consoleLog("前往注册");
        this.global.passwdType = "register";
        this.navCtrl.push(RegisterPage);
    }

    goForgetPasswdPage() {
        this.global.passwdType = "resetpasswd";
        this.navCtrl.push(RegisterPage);
    }
    showIcon(){
        this.eyeshow = !this.eyeshow;
    }
}
