import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { HttpService } from "../../providers/HttpService";
import { Md5 } from "ts-md5/dist/md5";
import { Util } from '../../providers/Util';
import { AlertController, ToastController, LoadingController } from 'ionic-angular';
import { DeviceSearchPage } from '../device-search/device-search';
import { LoginPage } from '../login/login';
import { Lang } from "../../providers/Language";
import { Events } from 'ionic-angular';
/**
 * Generated class for the ChangepasswdPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-change-passwd',
    templateUrl: 'change-passwd.html',
})
export class ChangePasswdPage {
    pError1: Boolean = false;
    pError2: Boolean = false;
    pError3: Boolean = false;
    pErrorText1: String = "";
    pErrorText2: String = "";
    pErrorText3: String = "";
    password1:any = "";
    password2:any = "";
    password3:any = "";
    username:any = "";
    eyeshow:Boolean = false;
    eyeshow2:Boolean = false;
    eyeshow3:Boolean = false;

    constructor(public navCtrl: NavController,
        public http: HttpService,
        private global: GlobalService,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController,
        private events: Events,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad ChangepasswdPage');
        this.username = this.global.boxUserInfo.username || this.global.centerUserInfo.uname;
        document.body.addEventListener('touchmove', function (event) {
            event.preventDefault();
        }, false);
    }

    commitNewPassword() {
        this.pError1 = this.pError2 = this.pError3 = false;
        this.pErrorText1 = this.pErrorText2 = this.pErrorText3 = "";

        var pCheck1 = this.password1 == '';
        if (pCheck1) {
            this.pError1 = true;
            this.pErrorText1 = Lang.L('WORD6f82c27d');
            return false;
        }
        var pError = Util.validator.passwd(this.password2);
        if (pError) {
            this.pError2 = true;
            this.pErrorText2 = ["", Lang.L('WORD758b56bc'), Lang.L('PasswordRuleDesc')][pError];
            return false;
        }
        if (this.password3 !== this.password2) {
            this.pError3 = true;
            this.pErrorText3 = Lang.L('WORDaa3d0f8d');
            return false;
        }
        GlobalService.consoleLog("校验通过，开始修改密码");
        this.global.logoutInit();
        this.updatePassword();
    }

    modifyPassword() {
        var password1 = Md5.hashStr(this.password1).toString(),
            password2 = Md5.hashStr(this.password2).toString();
        //已登录中心，首先查询是否有盒子
        this.http.post(GlobalService.centerApi["getBoxList"].url, {
        })
        .then(res => {
            if (res.err_no === 0) {
                if(res.boxinfo && res.boxinfo.length && !this.global.deviceSelected) {
                    this.global.createGlobalAlert(this, {
                        title: Lang.L('WORD8b37527e'),
                        message: Lang.L('WORD49fd48a8'),
                        buttons: [
                            {
                                text: Lang.L('WORD0cde60d1'),
                                handler: data => {
                                    this.navCtrl.push(DeviceSearchPage, {
                                        refresh: false
                                    })
                                      .then(() => {
                                        const startIndex = this.navCtrl.getActive().index;
                                        this.navCtrl.remove(0, startIndex);
                                      });
                                }
                            },
                            {
                                text: Lang.L('WORD85ceea04'),
                                handler: data => {
                                    GlobalService.consoleLog('Cancel clicked enhhhhhh');
                                    this.navCtrl.pop();
                                }
                            }
                        ]
                    })
                    return new Promise((resolve, reject) => {
                       reject({
                          err_no: -1
                       });
                    })  
                } else {
                    return this.http.post(GlobalService.centerApi["changePassword"].url, {
                        uname: this.username,
                        oldpassword: password1,
                        newpassword: password2,
                    })                    
                }
            } else {
                throw new Error(Lang.L('WORD22138f20'));               
            }            
        })
    	.then(res => {
    		if(res.err_no === 0) {
                if(this.global.deviceSelected) {
                    var url = this.global.getBoxApi('changePassword');
                    return this.http.post(url, {
                        username: this.username,
                        oldpassword: password1,
                        newpassword: password2,
                        // signature: encodeURIComponent(res.credential)
                        signature: res.credential
                    })                      
                } else {
                    return new Promise((resolve, reject) => {
                       resolve({
                          err_no: 0
                       });
                    }) 
                }
    		} else {
    			throw new Error(Lang.L('WORD7b23f9a4'));
    		}
    	})
    	.then(res => {
    		if(res.err_no === 0) {
        		var url = GlobalService.centerApi["changePasswordConfirm"].url;
        		return this.http.post(url, {
	        		uname: this.username,
	        	})        			
    		} else {
    			throw new Error(Lang.L('WORD07c69da3'));
    		}        		
    	})
    	.then(res => {
            if(res.err_no === 0) {
                this.global.createGlobalAlert(this, {
                    title: Lang.L('WORD6eb2ef18'),
                    message: Lang.L('WORD206a718a'),
                    buttons: [
                        {
                            text: Lang.L('WORD31ef4b33'),
                            handler: data => {
                                this.global.boxUserInfo = {};
                                this.global.centerUserInfo = {};
                                this.events.publish('root:changed', LoginPage);
                                // this.navCtrl.push(LoginPage)
                                // .then(() => {
                                //     const startIndex = this.navCtrl.getActive().index;
                                //     this.navCtrl.remove(0, startIndex);
                                //   });
                            }
                        }
                    ]
                })                  
            }
    	})
    	.catch (res => {
    		GlobalService.consoleLog(JSON.stringify(res));
    	})
    }
    showIcon(index){
        if(index == 0) {
            this.eyeshow = !this.eyeshow;
        } else if(index == 2) {
            this.eyeshow2 = !this.eyeshow2;
        } else if(index == 3) {
            this.eyeshow3 = !this.eyeshow3;
        }
        
    }
    
    updatePassword() {
        if(this.global.centerUserInfo.earn !== undefined) {
            this.modifyPassword();
        }  else {
            Util.askForLogin(this, false, ()=>{
                this.modifyPassword();
            })
        }      
    }
}
