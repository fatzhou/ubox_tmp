import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { TabsPage } from '../tabs/tabs';
import { DeviceSearchPage } from '../device-search/device-search';
import { Md5 } from "ts-md5/dist/md5";
import { Util } from '../../providers/Util';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { analyzeAndValidateNgModules, flatten } from '@angular/compiler';
import { Events, Platform, App } from 'ionic-angular';
// import { WebrtcService } from "../../providers/WebrtcService";
import { AlertController, ToastController, LoadingController } from 'ionic-angular';
import { DeviceGuidancePage } from '../device-guidance/device-guidance';

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
	eyeshow: Boolean = false;
	showDes: Boolean = true;
	isLoading: boolean = false;
	popBack: boolean = false;
	constructor(public navCtrl: NavController,
		private global: GlobalService,
		private http: HttpService,
		private events: Events,
		private alertCtrl: AlertController,
		private util: Util,
		private platform: Platform,
		private app: App,
		public navParams: NavParams) {
		GlobalService.consoleLog("进入登录页...");

	}

	ionViewWillEnter() {
		this.util.setStatusBar('dark');
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad LoginPage');
		this.popBack = this.navParams.get('popBack');
		this.isLoading = false;
		document.body.addEventListener('touchmove', function (event) {
			event.preventDefault();
		}, false);
		if (!this.platform.is('cordova')) {
			// this.username = "aop800@163.com"
			// this.password = "dh5819413"
			// this.username = '1@qq.com';
			// this.password = 'A123456789';
			this.username = 'testv314@online.com';
			this.password = 'a1234567';
		} else {
			this.username = 'testv314@online.com';
			this.password = 'a1234567';
			// this.util.getUserList().then(res => {
			// 	if (this.global.userLoginInfo) {
			// 		this.username = this.global.userLoginInfo.username;
			// 		this.password = this.global.userLoginInfo.password;
			// 	} else {
			// 		this.username = '';
			// 		this.password = '';
			// 	}
			// })
		}
	}

	ionViewDidLeave() {
		if (this.username) {
			this.global.userLoginInfo = {
				username: this.username,
				password: this.password,
				timestamp: Date.now()
			};
			this.util.setUserList();
		}
	}

	doLogin() {
		if (this.isLoading == true) {
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
			this.global.createGlobalToast(this, this.uErrorText);
			return false;
		}
		if (!this.password) {
			GlobalService.consoleLog("密码为空，验证不通过");
			this.pError = true;
			this.pErrorText = Lang.L('WORD758b56bc');
			this.isLoading = false;
			this.global.createGlobalToast(this, this.pErrorText);
			return false;
		}
		GlobalService.consoleLog("参数校验通过，开始登录盒子");
		this.global.diskInfo = {};
		this.loginCenter();
		// var boxSelected = this.global.deviceSelected;
		// // debugger
		// if(boxSelected && !this.global.useWebrtc) {
		//     GlobalService.consoleLog("已选择盒子，查看绑定情况");
		//     if(boxSelected.bindUser) {
		//         GlobalService.consoleLog("盒子已绑定用户，此时直接登录盒子:" + boxSelected.bindUser);
		//         this.loginBox();
		//     } else {
		//         GlobalService.consoleLog("盒子未绑定用户，需执行绑定逻辑");
		//         this.bindBox();
		//     }
		// } else {
		//     //远程登录
		//     this.loginCenter();
		// }
	}

	loginCenter() {
		GlobalService.consoleLog("开始登录中心！！！");
		this.global.centerUserInfo = {};
		this.global.createGlobalLoading(this, {
			message: Lang.L('SearchingBox')
		});

		let index = this.navParams.get('tabIndex');
		this.util.loginAndCheckBox(this, true)
			.then(res => {
				GlobalService.consoleLog("登录成功完成......");
				this.isLoading = false;
				this.global.closeGlobalLoading(this);
				this.navCtrl.setRoot(TabsPage);
			})
			.catch(e => {
				GlobalService.consoleLog("登录进入catch......");
				this.isLoading = false;
				GlobalService.consoleLog(this.global.centerUserInfo.uname + "," + this.global.centerUserInfo.bind_box_count)
				if (this.global.centerUserInfo.uname && this.global.centerUserInfo.bind_box_count == 0) {
					this.navCtrl.push(DeviceGuidancePage);
				} else {
					//其他问题导致登录失败，不处理...
				}
			})
	}

	// loginBox() {
	//     let res:any = {};
	//     Util.loginBox(this, (res)=>{
	//         if(res.err_no === 0) {
	//             GlobalService.consoleLog("盒子登录成功！！！")
	//             this.navCtrl.push(TabsPage)
	//             .then(() => {
	//                 this.isLoading = false;
	//             })
	//         } else if(res.err_no === 1101) {
	//             //登录失败，可能是因为盒子重置了或者其他APP解除绑定了
	//             // let view = this.navCtrl.getActive().name;
	//             // let root = this.app.getRootNav().root.name;
	//             // GlobalService.consoleLog("名字:" + view + "," + root);
	//             // GlobalService.consoleLog(this.navCtrl.length)
	//             if(this.navCtrl.length() === 1) {
	//                 setTimeout(()=>{
	//                     //此时应当提示用户重新扫描
	//                     this.global.createGlobalAlert(this, {
	//                         title: Lang.L("AccountError"),
	//                         message: Lang.L("AccountErrorReason"),
	//                         buttons: [
	//                             {
	//                                 text: Lang.L("ReScan"),
	//                                 handler: data => {
	//                                     this.util.logout(()=>{
	//                                         // this.events.publish('root:changed', DeviceSearchPage);
	//                                         // this.navCtrl.push(TestPage, {
	//                                         this.navCtrl.push(DeviceSearchPage, {
	//                                             refresh: true
	//                                         })
	//                                         .then(() => {
	//                                             this.isLoading = false;
	//                                         })
	//                                     })
	//                                 }
	//                             },
	//                             {
	//                                 text: Lang.L("ReInput"),
	//                                 handler: data => {
	//                                     // this.handleBack();
	//                                     this.isLoading = false;
	//                                 }
	//                             },
	//                         ]
	//                     });
	//                 }, GlobalService.ToastTime)
	//             } else {
	//                 this.isLoading = false;
	//             }
	//         } else {
	//             this.isLoading = false;
	//         }
	//     }, true, () => {
	//         this.isLoading = false;
	//     });
	// }

	bindBox() {
		this.global.createGlobalLoading(this, {
			message: this.global.L('Loading')
		})
		let errorCallback = () => {
			this.isLoading = false;
			this.global.closeGlobalLoading(this);
		};
		this.util.bindBox(this)
			.then(res => {
				if (res) {
					this.global.closeGlobalLoading(this);
					this.navCtrl.push(TabsPage)
						.then(() => {
							errorCallback();
						})
				} else {
					//绑定失败，停留在绑定页，用户可以重试
				}
			});
	}

	goRegisterPage() {
		this.global.passwdType = "register";
		this.navCtrl.push(RegisterPage);
	}

	goForgetPasswdPage() {
		this.global.passwdType = "resetpasswd";
		this.navCtrl.push(RegisterPage);
	}
	showIcon() {
		this.eyeshow = !this.eyeshow;
	}
}
