import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { VerifyEmailPage } from '../verify-email/verify-email';
import { AlertController, ToastController } from 'ionic-angular';
import { Md5 } from "ts-md5/dist/md5";
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from "../../providers/Language";
import { AgreementPage } from '../agreement/agreement'
import { PrivacyPolicyPage } from '../privacy-policy/privacy-policy'

/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-register',
    templateUrl: 'register.html',
})
export class RegisterPage {
    username: any = "";
    passwd: any = "";
    passwd2: any = "";
    uError: Boolean = false;
    uErrorText: String = "";
    pError: Boolean = false;
    pErrorText: String = "";
    pError2: Boolean = false;
    pErrorText2: String = "";
    privacyCheck: Boolean = false;

    constructor(public navCtrl: NavController,
        public toastCtrl: ToastController,
        private global: GlobalService,
        private http: HttpService,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad RegisterPage');
    }

    doRegister() {
        this.username = this.username.replace(/^\s+|\s+$/g, '');
        GlobalService.consoleLog("用户确认注册," + this.username + "," + this.passwd + "," + this.passwd2);
        GlobalService.consoleLog("密码md5:" + Md5.hashStr(this.passwd).toString());
        this.uError = this.pError = this.pError2 = false;
        this.uErrorText = this.pErrorText = this.pErrorText2 = "";
        var uCheck = Util.validator.email(this.username);

        if (uCheck) {
            this.uError = true;
            this.uErrorText = ["", Lang.L('WORDa33756a9'), Lang.L('WORD7b2271a4')][uCheck];
			GlobalService.consoleLog(this.uErrorText);
			this.global.createGlobalToast(this, this.uErrorText);
            return false;
        }
        var pError = Util.validator.passwd(this.passwd);
        if (pError) {
            this.pError = true;
			this.pErrorText = ["", Lang.L('WORD758b56bc'), Lang.L('PasswordRuleDesc')][pError];
			this.global.createGlobalToast(this, this.pErrorText);
            return false;
        }
        if (this.passwd2 !== this.passwd) {
            this.pError2 = true;
			this.pErrorText2 = Lang.L('WORDaa3d0f8d');
			this.global.createGlobalToast(this, this.pErrorText2);
            return false;
        }
        // if (this.global.passwdType === 'register') {
        //     if (!this.privacyCheck) {
        //         this.global.createGlobalToast(this, Lang.L('WORDd2f6ca9b'));
        //         return false;
        //     }
        // }
        this.getVerifyCode();
    }

    getVerifyCode() {
        GlobalService.consoleLog("参数校验通过，获取验证码");
        this.http.post(GlobalService.centerApi["getVerifyCode"].url, {
            uname: this.username,
            type: this.global.passwdType === 'register' ? 0 : 1,
            lang: this.global.getAppLang()
        })
        .then((res) => {
            if (res.err_no === 0) {
                var userFlag = false;
                if (this.global.passwdType !== 'register') {
                    GlobalService.consoleLog("用户提交的是重置密码请求");
                    GlobalService.consoleLog("如果用户名绑定的盒子不在线，此时无法忘记密码");
                    if(res.bind_box === 0) {
                      userFlag = true;
                    } else {
                      this.global.userBoxIndex = -1;
                      GlobalService.consoleLog("当前共发现" + this.global.foundDeviceList.length + "个盒子!");
                      for (let i = 0, deviceList = this.global.foundDeviceList, len = deviceList.length; i < len; i++) {
                          GlobalService.consoleLog("当前用户名的hash：" + Md5.hashStr(this.username).toString());
                          GlobalService.consoleLog("盒子hash:" + deviceList[i].bindUserHash);
                          if (deviceList[i].bindUserHash === Md5.hashStr(this.username.toLowerCase()).toString()) {
                              this.global.userBoxIndex = i;
                              userFlag = true;
                              break;
                          }
                      }
                    }
                } else {
                    userFlag = true;
                }
                if (userFlag) {
                    GlobalService.consoleLog("盒子在线，直接获取验证码");
                    this.navCtrl.push(VerifyEmailPage, {
                        username: this.username,
                        password: this.passwd,
                        bindbox: res.bind_box === 0 ? false : true
                    });
                } else {
                    let toast = this.toastCtrl.create({
                        message: Lang.L('WORDa25b8545'),
                        duration: GlobalService.ToastTime,
                        position: 'middle',
                        cssClass: 'toast-error'
                    });
                    toast.present();
                }
            }
        })
    }
    goAgreement(){
        this.navCtrl.push(AgreementPage);
    }
    goPrivacyPolicy(){
        this.navCtrl.push(PrivacyPolicyPage);
    }
    

}
