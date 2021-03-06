import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { GlobalService } from '../../providers/GlobalService';
import { TabsPage } from '../tabs/tabs';
import { HttpService } from '../../providers/HttpService';
import { JSONPBackend } from '@angular/http';
import { Events } from 'ionic-angular';
import { DeviceGuidancePage } from '../device-guidance/device-guidance';

/**
 * Generated class for the DeviceSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-device-search',
	templateUrl: 'device-search.html',
})
export class DeviceSearchPage {
	searchResult: any = null;
	bindStatus = 0;

	constructor(public navCtrl: NavController,
		public util: Util,
		private http: HttpService,
		private events: Events,
		private global: GlobalService,
		public navParams: NavParams) {
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad DeviceSearchPage');
		this.searchUbbey();
	}

	searchUbbey() {
		return this.util.searchUbbey()
			.then((res: any) => {
				GlobalService.consoleLog("已搜索到以下盒子：" + JSON.stringify(res));
				this.searchResult = res.sort((a, b) => {
					return (+!!a.bindUser) - (+!!b.bindUser);
				});
				return res;
			})
	}

	bindBox(box) {
		GlobalService.consoleLog("已选定盒子：" + JSON.stringify(box));
		this.http.stopWebrtcEngine();
		this.global.setSelectedBox(box);
		this.global.createGlobalLoading(this, {
			message: this.global.L("Binding")
		})
		this.util.bindBox(this)
			.then(res => {
				this.global.closeGlobalLoading(this);
				if (res) {
					// this.util.checkoutBox(this);
					// this.events.publish('check-box-app');
					//this.global.setSelectedBox(box);
					this.bindStatus = 1;
				} else {
					this.global.setSelectedBox(null);
					this.bindStatus = 2;
				}
			})
			.catch(e => {
				this.global.closeGlobalLoading(this);
				this.global.setSelectedBox(null);
				this.bindStatus = 2;
			})
	}

	goNext() {
		if (this.bindStatus == 1) {
			this.navCtrl.setRoot(TabsPage)
				.then(res => {
					this.events.publish('check-box-app');
				})
		} else {
			this.navCtrl.setRoot(DeviceGuidancePage);
		}
	}

	doRefresh(event) {
		GlobalService.consoleLog('Begin async operation');
		//状态复原
		this.searchResult = null;
		this.searchUbbey()
			.then(res => {
				event.complete();
			})
	}
}
