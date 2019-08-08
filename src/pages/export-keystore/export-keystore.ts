import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from "../../providers/Language";
import { Util } from '../../providers/Util';

/**
 * Generated class for the ExportKeystorePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-export-keystore',
	templateUrl: 'export-keystore.html',
})
export class ExportKeystorePage {
	keystore: any = "";
	constructor(public navCtrl: NavController,
		private clipboard: Clipboard,
		private global: GlobalService,
		public navParams: NavParams) {

	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad ExportKeystorePage');
		this.keystore = this.navParams.get('keystore') || "";
		if (!this.keystore) {
			this.global.createGlobalToast(this, {
				message: Lang.L('WORDde2e6b57')
			})
			setTimeout(() => {
				this.navCtrl.pop();
			}, 300)
		}
	}

	doCopy() {
		GlobalService.consoleLog("您点击了复制按钮");
		this.clipboard.copy(this.keystore)
			.then(res => {
				this.global.createGlobalToast(this, {
					message: Lang.L('WORDfe5ae1b8')
				})
			})
	}
}
