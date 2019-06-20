import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtDetailPage } from '../bt-detail/bt-detail';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

/**
 * Generated class for the SearchBtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-search-bt',
	templateUrl: 'search-bt.html',
})
export class SearchBtPage {
	@ViewChild('input0') myInput0;
	searchFeedList: any = [];
	searchKeyList: any = [];
	inputValue: string = '';
	loading: boolean = false;
	session: string = '';
	isFocus: boolean = false;
	isShowLoad: boolean = false;
	searched: boolean = false;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private global: GlobalService,
		private util: Util,
		private http: HttpService,
		public storage: Storage) {
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad SearchBtPage');
		this.getSearchKey();
		setTimeout(() => {
			this.myInput0.nativeElement.focus();
		}, 2000)
	}

	ionViewWillLeave() {
		GlobalService.consoleLog("leave")
		this.setSearchKey();
	}

	goBtDetailPage(id) {
		GlobalService.consoleLog("go BtDetailPage");
		this.navCtrl.push(BtDetailPage, {
			type: 'search',
			id: id
		});
	}

	goBack() {
		this.navCtrl.pop();
	}

	setSearchKey() {
		this.storage.set("searchKeyList", JSON.stringify(this.searchKeyList));
	}

	getSearchKey() {
		this.storage.get("searchKeyList")
			.then(res => {
				if (res) {
					GlobalService.consoleLog("res" + res)
					this.searchKeyList = JSON.parse(res);
					if (this.searchKeyList.length > 10) {
						this.searchKeyList = this.searchKeyList.slice(0, 10);
					}
				}
			});
	}

	searchList(key = null, refresh = false) {
		if (this.loading == true) {
			return false;
		}
		if (this.isShowLoad == true) {
			this.global.createGlobalLoading(this, {
				message: Lang.L('Loading')
			});

		}
		this.loading = true;
		var url = GlobalService.centerApi["getSearchList"].url;
		let keyword = key || this.inputValue;
		this.inputValue = keyword.replace(/^\s+|\s+$/g, "");
		if (this.inputValue == '') {
			return false;
		}
		if (this.searchKeyList.indexOf(this.inputValue) > -1) {
			this.searchKeyList.splice(this.searchKeyList.indexOf(this.inputValue), 1);
		}
		this.searchKeyList.unshift(this.inputValue);
		if (this.searchKeyList.length > 10) {
			this.searchKeyList = this.searchKeyList.slice(0, 10);
		}
		let obj: any = {
			keyword: this.inputValue
		};
		if (key && !refresh) {
			obj.session = this.session;
			obj.action = "donext";
		}
		this.http.post(url, obj)
			.then((res: any) => {
				if (res.err_no === 0) {
					this.session = res.session;
					let hash = {};
					let list = res.list || [];
					list = list.filter(item => {
						if (item.images) {
							if (item.images.length == 2) {
								item.images.pop();
							}
						}
						return item
					})
					if (key && !refresh) {
						this.searchFeedList = this.searchFeedList.concat(list);
					} else {
						this.searchFeedList = list;
					}
					this.searchFeedList = this.searchFeedList.reduce((preVal, curVal) => {
						hash[curVal.resid] ? '' : hash[curVal.resid] = true && preVal.push(curVal);
						return preVal
					}, []);
					this.searched = true;

					if (this.isShowLoad == true) {
						this.global.closeGlobalLoading(this);
						this.isShowLoad = false;
					}
					setTimeout(() => {
						this.loading = false;
					}, 100);
				} else {
					this.searched = true;
				}
			})
	}

	clearSearchKeys() {
		this.searchKeyList = [];
		this.storage.remove('searchKeyList');
	}

	clearKey() {
		console.log('clearKey')
		this.inputValue = '';
	}

	refreshFeedList(infiniteScroll) {
		GlobalService.consoleLog("search-bt 上滑加载")
		this.searchList(this.inputValue);
		infiniteScroll.complete();
	}

	downloadBt(item) {
		GlobalService.consoleLog("download" + item.mgurl)
		if (item.status && item.status == 1) {
			return false;
		}
		if (!this.http.isNetworkReady(true)) {
			return false;
		}
		this.global.createGlobalAlert(this, {
			title: Lang.L('DownloadFile'),
			message: item.title,
			// enableBackdropDismiss: false,
			buttons: [
				{
					text: Lang.L('Download'),
					handler: data => {
						let url = item.mgurl + '&dn=' + item.title;
						this.util.downloadBt(url, item.resid)
							.then(res => {
								GlobalService.consoleLog("正在下载bt")
								item.status = 1;
							})
							.catch(e => {
								console.log('下载失败')
								item.status = 0;
							})
						return true;
					}
				},
				{
					text: Lang.L('WORD85ceea04'),
					handler: data => {
						GlobalService.consoleLog('Cancel clicked');
						// this.handleBack();
						item.status = 0;
					}
				},
			]
		})
	}
}
