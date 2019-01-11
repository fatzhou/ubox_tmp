import {Component, Input, ViewChild} from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { AlertController, ToastController } from 'ionic-angular';
import { DeviceListPage } from '../device-list/device-list';
import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';
import { Md5 } from "ts-md5/dist/md5";
import { Util } from '../../providers/Util';
import { ResultPage } from "../result/result";
import { Lang } from '../../providers/Language';
import { Events } from 'ionic-angular';
// import { Keyboard } from '@ionic-native';
/**
 * Generated class for the VerifyemailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-verify-email',
    templateUrl: 'verify-email.html',
})
export class VerifyEmailPage {
    @ViewChild('input0') myInput0;
    @ViewChild('input1') myInput1;
    @ViewChild('input2') myInput2;
    @ViewChild('input3') myInput3;
    @ViewChild('input4') myInput4;
    @ViewChild('input5') myInput5;

    username: String = "";
    password: any = "";
    bindbox:any = true;
    verifyCode: Array < String > = Array(6).fill('');
    tickCount: number = 60;
    tickTips: String = Lang.L('WORD6631dd91');

    constructor(public navCtrl: NavController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        private http: HttpService,
        private global: GlobalService,
        private util: Util,
        private events: Events,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad VerifyemailPage');
        this.username = this.navParams.get('username');
        this.password = this.navParams.get('password');
        this.bindbox = this.navParams.get('bindbox');
        this.tickCount = 60;
        this.setTickCountInterval();
        // setTimeout(() => {
        //   Keyboard.show() // for android
        //   this.input0.setFocus();
        // },150); //a least 150ms.
    }

    findNextInput(index) {
        for(var i = 1; i < 6; i++) {
            let n = (index+i) % 6;
            if(!this.verifyCode[n]) {
                GlobalService.consoleLog(this.myInput1)
                this['myInput' + n].nativeElement.focus();
                break;
            }
        }
    }

    changeInput(index) {
        GlobalService.consoleLog("输入发生了变化");
        var verifyCode = this.verifyCode.join("");
        if (verifyCode.length === 6) {
            if(this.global.passwdType === "register") {
                this.http.post(GlobalService.centerApi["register"].url, {
                    uname: this.username,
                    password: Md5.hashStr(this.password).toString(),
                    verifyCode: verifyCode,
                })
                .then((res) => {
                    GlobalService.consoleLog(JSON.stringify(res));
                    if (res.err_no === 0) {
                        GlobalService.consoleLog("注册成功，检测是否已经绑定；如果已经绑定，则提示用户登录；否则，自动绑定");
                        var boxSelected = this.global.deviceSelected;
                        GlobalService.consoleLog(JSON.stringify(boxSelected))
                        if (!boxSelected) {
                            //未选择盒子，直接登录
                            this.askUserLogin();
                        } else if (boxSelected.bindUser) {
                            //已绑定，提示用户更换账户
                            this.askUserChangeAccount();
                        } else {
                            //未绑定，自动绑定
                            this.bindBox();
                        }                        
                    }
                })
            } else {
                GlobalService.consoleLog("忘记密码，调用中心忘记密码接口");
                this.resetPasswd();
            }
        } else {
            this.findNextInput(index);
        }
    }

    resetPasswd() {
        var passwordMd5 = Md5.hashStr(this.password).toString();
        var verifyCode = this.verifyCode.join("");
        this.http.post(GlobalService.centerApi["resetPasswd"].url, {
            uname: this.username,
            password: passwordMd5,
            verifyCode: verifyCode
        })
        .then((res)=>{
            if(res.err_no === 0) {
                GlobalService.consoleLog("重设密码成功，调用盒子重新设置密码");

                var boxInfo = this.global.foundDeviceList[this.global.userBoxIndex];
                if(!boxInfo && this.bindbox) {
                    throw new Error(Lang.L('WORD612ce400'));
                } else {
                    // var url = "http://" + boxInfo.URLBase + GlobalService.boxApi["resetPasswd"].url;
                    if(this.bindbox) {
                        if(!this.global.deviceSelected) {
                            this.global.createGlobalToast(this, {
                                message : Lang.L('WORDea9cca85')
                            })
                            return false;
                        }
                        GlobalService.consoleLog("已绑定盒子，需向盒子发起请求");
                        var url = this.global.getBoxApi("resetPasswd");
                        return this.http.post(url, {
                            username: this.username,
                            newpassword: passwordMd5,
                            captcha: verifyCode,
                            // signature: encodeURIComponent(res.credential),
                            signature: res.credential,
                        })                        
                    } else {
                        GlobalService.consoleLog("盒子未绑定账户，可以直接重设");
                        return new Promise((resolve, reject) => {
                           resolve({
                              err_no: 0
                           });
                        })                        
                    }
                }                  
            } else {
                throw new Error(Lang.L('WORDe7824893'));
            }
        })
        .then((res) => {
            if(res.err_no === 0) {
                GlobalService.consoleLog("盒子返回正确，即将调用中心确认");
                return this.http.post(GlobalService.centerApi["resetPasswdConfirm"].url, {
                    uname: this.username,
                })                
            } else {
                throw new Error(Lang.L('WORDe672dfc3'));
            }
        })
        .then((res) => {
            if(res.err_no === 0) {
                GlobalService.consoleLog("密码修改成功");
                this.navCtrl.push(ResultPage, {
                    type: "resetPasswd"
                });
            }
        })
        .catch((res) => {

        })   
    }

    askUserLogin() {
        //重写登录态
        if(!!this.global.deviceSelected) {
            Util.loginBox(this, null);
        }

        Util.loginCenter(this, null);

        this.navCtrl.push(ResultPage, {
            type: 'register'
        })
        // this.global.createGlobalAlert(this, {
        //     title: Lang.L('WORD8cb9d4ce'),
        //     subTitle: Lang.L('WORD081c3435') + this.username + Lang.L('WORD7d79a22f'),
        //     enableBackdropDismiss: false,
        //     buttons: [{
        //         text: Lang.L('WORD20eddadd'),
        //         handler: () => {
        //             this.navCtrl.push(LoginPage);
        //         }
        //     }]
        // })        
    }

    askUserChangeAccount() {
        // this.navCtrl.push(ResultPage, {
        //     type: 'register'
        // })
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD6cccaf8c'),
            subTitle: Lang.L('WORD8abef29c'),
            enableBackdropDismiss: false,
            buttons: [/*{
                text: Lang.L('WORDa54ee54e'),
                handler: () => {
                    this.navCtrl.push(LoginPage);
                }
            }, */{
                text: Lang.L('WORD4a8bf19f'),
                handler: () => {
                    this.navCtrl.push(DeviceListPage, {
                        refresh: false
                    })
                    .then(() => {
                      const startIndex = this.navCtrl.getActive().index;
                      GlobalService.consoleLog("去列表" + startIndex);
                      this.navCtrl.remove(0, startIndex);
                    }); 
                }
            }]
        })
    }

    loginCenter() {
        Util.loginCenter(this, ()=>{
            this.navCtrl.push(TabsPage)
            .then(() => {
              const startIndex = this.navCtrl.getActive().index;
              GlobalService.consoleLog("即将删除历史记录：" + startIndex);
              this.navCtrl.remove(0, startIndex);
            }); 
        });
    }

    loginBox() {
        Util.loginBox(this, ()=>{
            this.navCtrl.push(TabsPage)
            .then(() => {
              const startIndex = this.navCtrl.getActive().index;
              GlobalService.consoleLog("即将删除历史记录：" + startIndex);
              this.navCtrl.remove(0, startIndex);
            });
        });
    }

    bindBox() {
        this.util.bindBox(this)
        .then((res)=>{
            if(res) {
                this.navCtrl.push(TabsPage)             
            } 
        });
    }    

    getVerifyCode() {
        GlobalService.consoleLog("获取验证码!");
        this.http.post(GlobalService.centerApi["getVerifyCode"].url, {
            uname: this.username,
            type: this.global.passwdType === "register" ? 0 : 1,
            lang: this.global.getAppLang()
        })
        .then((res) => {
            GlobalService.consoleLog(res);
            var tips = "";
            if (res.err_no === 0) {
                tips = Lang.L('WORD92f2a1ae');
                this.tickCount = 60;
                this.setTickCountInterval();
                let toast = this.toastCtrl.create({
                    message: tips,
                    duration: GlobalService.ToastTime,
                    position: 'middle',
                    cssClass: 'toast-error'
                });
                toast.present();                    
            } 
        })
    }

    setTickCountInterval() {
        let interval = setInterval(() => {
            if (this.tickCount === 0) {
                clearInterval(interval);
                interval = null;
                return false;
            }
            this.tickCount--;
        }, 1000);
    }

}
