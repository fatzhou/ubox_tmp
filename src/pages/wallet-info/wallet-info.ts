import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { File } from '@ionic-native/file/ngx';
import { Events } from 'ionic-angular';
import { WalletNameModifyPage } from '../wallet-name-modify/wallet-name-modify';
import { ExportKeystorePage } from '../export-keystore/export-keystore';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';

/**
 * Generated class for the WalletInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-wallet-info',
	templateUrl: 'wallet-info.html',
})
export class WalletInfoPage {
	walletName: any = "";
	walletAddr: any = 0;
	walletEarnThisMonth: any = "";
	walletEarnBefore: any = "";
	keystore: any = "";

	constructor(public navCtrl: NavController,
		public toastCtrl: ToastController,
		private global: GlobalService,
		private http: HttpService,
		private file: File,
		private events: Events,
		public navParams: NavParams) {
		var self = this;
		this.events.subscribe('walletNameModified', function (wallet) {
			if (wallet.addr === this.walletAddr) {
				this.walletName = wallet.name;
			}
		})
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad WalletInfoPage');
		this.walletName = this.navParams.get('name');
		this.walletAddr = this.navParams.get('addr');
		this.walletEarnThisMonth = this.navParams.get('earn_this_month');
		this.walletEarnBefore = this.navParams.get('earn_before');
		this.keystore = this.navParams.get('keystore');
	}

	goWalletNameModifyPage() {
		GlobalService.consoleLog("修改钱包" + this.walletName + "的名字");
		this.navCtrl.push(WalletNameModifyPage, {
			name: this.walletName,
			addr: this.walletAddr
		});
	}

	exportKeystore() {
		this.navCtrl.push(ExportKeystorePage, {
			keystore: this.keystore
		})
		// this.file.writeFile(this.file.dataDirectory, this.walletName + '.keystore', this.keystore)
		//     .then(res => {
		//         GlobalService.consoleLog(JSON.stringify(res));
		//         this.global.createGlobalToast(this, {
		//             message: Lang.L('WORDad57fb8a'),
		//             duration: GlobalService.ToastTime,
		//             position: 'middle',
		//             cssClass: 'toast-error'
		//         });
		//     })
	}

	doRemove() {
		if (this.global.boxUserInfo.share_switch && this.global.boxUserInfo.coinbase == this.walletAddr) {
			this.global.createGlobalAlert(this, {
				title: Lang.L('WORD18fc4843'),
				message: Lang.L('WORD256b8339'),
				buttons: [{
					text: Lang.L('WORDd0ce8c46'),
					handler: data => { }
				},
				]
			})
			return false;
		} else {
			this.global.createGlobalAlert(this, {
				title: Lang.L('WORDed3a93fd'),
				message: Lang.L('WORD702c7fa6'),
				buttons: [
					{
						text: Lang.L('WORDd0ce8c46'),
						handler: data => {
							var url = this.global.getBoxApi("deleteWallet");
							this.http.post(url, {
								addr: this.walletAddr,
								type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
							})
								.then(res => {
									if (res.err_no === 0) {
										let toast = this.toastCtrl.create({
											message: Lang.L('WORD5f9bdeda'),
											duration: GlobalService.ToastTime,
											position: 'middle',
											cssClass: 'toast-error'
										});
										toast.present();
										if (this.global.boxUserInfo.coinbase == this.walletAddr) {
											GlobalService.consoleLog("钱包已经设置为挖矿地址，此时需要清楚设置");
											let url = this.global.getBoxApi("setCoinbase");
											this.http.post(url, {
												coinbase: ""
											})
												.then(res => {
													if (res.err_no === 0) {
														GlobalService.consoleLog("已成功删除coinbase");
														this.global.boxUserInfo && (this.global.boxUserInfo.coinbase = "");
													}
												})
										}
										setTimeout(() => {
											this.navCtrl.pop();
										}, 300)
									}
								})
						}
					},
					{
						text: Lang.L('WORD85ceea04'),
						handler: data => { }
					},
				]
			})
		}
	}

}
