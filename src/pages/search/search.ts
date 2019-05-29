import { Component } from '@angular/core';
import { NavController, NavParams, ItemContent } from 'ionic-angular';
import { Events, App, Nav } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

import { AboutDevicePage } from '../about-device/about-device';
import { AppDetailPage } from '../app-detail/app-detail';
import { LoginPage } from '../login/login';
import { AppsInstalled } from '../../providers/AppsInstalled';
import { UappPlatform } from "../../providers/UappPlatform";
import { AppsInterface } from "../../providers/AppsInterface";

import { InternalFormsSharedModule } from '@angular/forms/src/directives';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-search',
	templateUrl: 'search.html',
})
export class SearchPage {
	labelList: any = {};
	bannerStyle: any = {};
	appList: any = {};//全部的应用列表
	showList: any = [];//需要展示的应用列表
	bannerList: any = [];//需要展示的banner列表
	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private events: Events,
		private global: GlobalService,
		private util: Util,
		private http: HttpService,
		private uappPlatform: UappPlatform,
		private appsInterface: AppsInterface,
		private appsInstalled: AppsInstalled,
		private app: App,
		public nav: Nav) {
		events.unsubscribe('language:change');
		events.subscribe('language:change', () => {
			if (!this.global.SearchData) {
				GlobalService.consoleLog("无应用信息");
				return false;
			}
			this.showList = this.global.SearchData.appList[GlobalService.applang];
			let bannerList = this.global.SearchData.bannerList;
			this.bannerList = [];
			if (this.showList.length != 0) {
				for (let i = 0; i < this.showList.length; i++) {
					for (let j = 0; j < bannerList.length; j++) {
						if (this.showList[i].id == bannerList[j]) {
							this.bannerList.push(this.showList[i]);
						}
					}
				}
			}
		})
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad SearchPage');
		if (!this.bannerList.length) {
			this.getSearchData()
				.then((res) => {
					if (!this.global.SearchData) {
						return false;
					}
					// GlobalService.consoleLog(JSON.stringify(res));
					this.showList = this.global.SearchData.appList[GlobalService.applang];
					this.labelList = this.global.SearchData.labelList;
					this.bannerStyle = this.global.SearchData.bannerStyle;
					let bannerList = this.global.SearchData.bannerList;
					if (this.showList.length != 0) {
						for (let i = 0; i < this.showList.length; i++) {
							for (let j = 0; j < bannerList.length; j++) {
								if (this.showList[i].id == bannerList[j]) {
									this.bannerList.push(this.showList[i]);
								}
							}
						}
					}
					// GlobalService.consoleLog('this.bannerList' + JSON.stringify(this.bannerList))
				})
		}
	}

	//打开或者下载uapp
	openApp(item) {
		this.util.openUapp(item, (pro) => {
			this.goProgress(item, pro);
		});
	}

	goProgress(item, p) {
		if (item.progress < p) {
			//清除上一次未完成的定时器
			if (item.interval) {
				clearInterval(item.interval);
				item.interval = null;
			}
			item.interval = setInterval(() => {
				item.progress++;
				if (item.progress >= p) {
					clearInterval(item.interval);
					item.interval = null;
				}
			}, 300);
		}
	}

	// goAppDetail(info) {
	//     GlobalService.consoleLog("查看应用详情:" + JSON.stringify(info));
	//     this.app.getRootNav().push(AppDetailPage, {
	//         "info": info
	//     });
	// }    

	goLoginPage() {
		this.nav.setRoot(LoginPage);
	}

	showNetworkPopup() {
		this.events.publish('open-popup');
	}

	//远程获取配置
	getSearchData() {
		var that = this;
		var url = GlobalService.searchDataConfig[GlobalService.ENV];
		if (!this.global.SearchData) {
			return this.http.get(url, {}, false, {}, {}, true)
				.then((res: any) => {
					if (typeof res === 'string') {
						res = JSON.parse(res);
					}
					if (res) {
						// GlobalService.consoleLog("search拿到了")
						this.global.SearchData = res;
					}
					return res;
				})
				.catch(e => {
					GlobalService.consoleLog('版本配置赋值出错:' + e.stack);
				})
		} else {
			return Promise.resolve(this.global.SearchData);
		}
	}

	goAboutDevice() {
		this.app.getRootNav().push(AboutDevicePage);
	}
}
