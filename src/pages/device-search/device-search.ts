import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { GlobalService } from '../../providers/GlobalService';
import { TabsPage } from '../tabs/tabs';
import { HttpService } from '../../providers/HttpService';
import { JSONPBackend } from '@angular/http';
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
	searchResult:any = null;
	bindStatus = 0;

	constructor(public navCtrl: NavController,
				public util: Util,
				private http: HttpService,
				private global: GlobalService,
				public navParams: NavParams) {
    }

    ionViewDidLoad() {
		console.log('ionViewDidLoad DeviceSearchPage');
		this.searchUbbey();
	}

	searchUbbey() {
		return this.util.searchUbbey()
		.then(res => {
			console.log("已搜索到以下盒子：" + JSON.stringify(res));
			this.searchResult = res;
			return res;
		})
	}

	bindBox(box) {
		this.global.setSelectedBox(box);
		console.log("已选定盒子：" + JSON.stringify(box));
		this.util.bindBox(this)
		.then(res => {
			if(res) {
				this.bindStatus = 1;
			} else {
				this.bindStatus = 2;
			}
		})
	}

	goNext() {
		this.navCtrl.setRoot(TabsPage);
	}

    doRefresh(event) {
		console.log('Begin async operation');
		//状态复原
		this.searchResult = null;
		this.searchUbbey()
		.then(res => {
			event.complete();
		})
    }
}
