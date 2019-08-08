import { Component } from '@angular/core';
import { NavController, NavParams, Item } from 'ionic-angular';
import { SearchBtPage } from '../search-bt/search-bt';
import { BtDetailPage } from '../bt-detail/bt-detail';
import { BtTaskPage } from '../bt-task/bt-task';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

import { AboutDevicePage } from '../about-device/about-device';
import { AppDetailPage } from '../app-detail/app-detail';
import { LoginPage } from '../login/login';
import { AppsInstalled } from '../../providers/AppsInstalled';
import { UappPlatform } from "../../providers/UappPlatform";
import { AppsInterface } from "../../providers/AppsInterface";
import { Lang } from '../../providers/Language';
import { MenuController } from 'ionic-angular';
import { ChangeDetectorRef } from '@angular/core';

import { InternalFormsSharedModule } from '@angular/forms/src/directives';
/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
	selector: 'page-bt',
	templateUrl: 'bt.html',
})
export class BtPage {
	feedList: any = [];
	feedListAll: any = {};
	feedListCached: any = [];
	loading: boolean = false;
	initcount: any = 0;
	isShowTitle: boolean = true;
	isShowWarningBar: boolean = false;
	isPullListType: string = 'pull';
	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		private events: Events,
		private global: GlobalService,
		private util: Util,
		private http: HttpService,
		private cd: ChangeDetectorRef,
		private uappPlatform: UappPlatform,
		private appsInterface: AppsInterface,
		private appsInstalled: AppsInstalled,
		private menuCtrl: MenuController,
		private app: App) {

		this.events.subscribe('btdownloading', (resid) => {
			let item = this.feedList.find(item => item.resid == resid);
			if (item) {
				item.status = 1;
			}
		});

	}

	ionViewDidEnter() {
		this.global.tabIndex = 1;
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad BtPage');
		this.getFeedTop();
		this.initFirstPage();
	}

	ionViewWillLeave() {
		GlobalService.consoleLog("leave")
		this.initcount = 0;
	}

	goSearchBtPage() {
		GlobalService.consoleLog("gosearchbt");
		this.app.getRootNav().push(SearchBtPage);
	}

	goBtDetailPage(item: any) {
		GlobalService.consoleLog("go BtDetailPage");
		this.app.getRootNav().push(BtDetailPage, {
			type: 'feed',
			id: item.resid,
			status: item.status
		});
	}

	initFirstPage() {
		if (this.initcount > 10) {
			console.error("获取首页数据尝试超过10次，还未获取到足够数据，不再尝试获取。");
			return;
		}
		this.initcount++;
		this._getFeedList().then((list) => {
			list.forEach(item => {
				if (item.images && item.images.length > 0) {
					item.style = {
						'background-image': 'url(' + item.images[0] + ')'
					}
				}
			})
			this.feedList = this.feedList.concat(list);
			if (this.feedList.length < 8) {
				setTimeout(() => { this.initFirstPage(); }, 100)
			}
		}, () => { })
	}

	refreshFeedList(infiniteScroll) {
		// Step 0. 加锁，避免多次重复请求
		if (this.loading == true) {
			infiniteScroll.complete();
			GlobalService.consoleLog("已在加载数据，直接退出")
			return false;
		} else {
			this.loading = true;
		}

		// Step 1. 更新数据
		this.getFeedToShow()
			.then((list: any) => {
				GlobalService.consoleLog("500ms后解锁");
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						this.loading = false;
					}, 500);
					infiniteScroll.complete();
					resolve(list);
				})
			})
			// 添加获取到到数据到页面
			.then((list: any) => {
				if (list.length > 0) {
					list = list.filter(item => {
						if (item.images) {
							if (item.images.length == 2) {
								item.images.pop();
							}
						}
						return item
					})
					list.forEach(item => {
						if (item.images && item.images.length > 0) {
							item.style = {
								'background-image': 'url(' + item.images[0] + ')'
							}
						}
					})
					switch (this.isPullListType) {
						case "scroll":
							this.feedList = this.feedList.concat(list);
							break;
						case "pull":
							this.feedList = list.concat(this.feedList);
							break;
						default:
							GlobalService.consoleLog("添加显示数据出错，不支持的位置：" + this.isPullListType);
					}
				}
			})
	}

	onDragUp(event) {
		GlobalService.consoleLog("onDragUp event:" + JSON.stringify(event))
	}

	getFeedToShow() {
		// Step 1. 获取两到三条数据
		return new Promise((resove, reject) => {
			let retlist = [];
			// Case 1. 从缓存取数据
			if (this.feedListCached.length >= 2) {
				retlist = [this.feedListCached.pop(), this.feedListCached.pop()];
				resove(retlist);
				return;
			}
			// Case 2. 从网络取数据
			this._getFeedList().then((list) => {
				if (list.length >= 2) {
					retlist = [list.pop(), list.pop()];
					this.feedListCached = this.feedListCached.concat(list);
					resove(retlist);
				} else {
					resove(list);
				}
			}).catch(() => {
				resove([]);
			})
		})
	}

	getFeedTop() {
		var url = GlobalService.centerApi["getFeedTop"].url;
		this.http.post(url, {})
			.then((res: any) => {
				if (res.err_no === 0) {
					var list = [];
					var index = 0;
					if (res.list && res.list.length > 0) {
						GlobalService.consoleLog(JSON.stringify(res.list));
						this.feedList.unshift(res.list[0]);
					}

				}
			})
	}

	_getFeedList() {
		var url = GlobalService.centerApi["getFeedList"].url;
		return this.http.post(
			url, { id: 0 }, false
		).then((res: any): any => {
			if (res.err_no === 0 && res.list) {
				let list = [];
				res.list.forEach((item, index, array) => {
					if (!this.feedListAll[item.resid]) {
						list.push(item);
						this.feedListAll[item.resid] = 1;
					}
				});
				GlobalService.consoleLog('获取数据成功，条数：' + list.length);
				return list
			}
			return Promise.reject("获取feedlist失败, res:" + JSON.stringify(res));
		})
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
					GlobalService.consoleLog('获取应用列表失败:' + e.stack);
				})
		} else {
			return Promise.resolve(this.global.SearchData);
		}
	}

	goBtTaskPage() {
		GlobalService.consoleLog("go BtTaskPage");
		if (!this.global.deviceSelected) {
			//未选择设备则不可用
			this.global.createGlobalToast(this, {
				message: this.global.L('YouNotConnectedDev')
			});
			return false
		}
		this.app.getRootNav().push(BtTaskPage);
	}

	displayDownloadAnimaton(item) {
		if (!item.images || !item.images.length) {
			return;
		}
		if (item.animating) {
			return;
		}
		item.animating = true;
		//获取当前节点
		let node = document.getElementById(item.resid);
		let target = document.getElementById('download-list');
		let nodeRect = node.getBoundingClientRect(),
			targetRect = target.getBoundingClientRect();
		let xGap = (targetRect.left - nodeRect.left),
			yGap = (targetRect.top - nodeRect.top);
		item.style.transform = `translate3d(${xGap}px, ${yGap}px, 0)`;
		console.log(item.style.transform)
		node.classList.add('fix-size');
		let animationTime = 2000;
		//TODO: 动画复原
		setTimeout(() => {
			//恢复图片的位置
			item.style = {
				'background-image': 'url(' + item.images[0] + ')'
			}
			setTimeout(() => {
				//恢复图片显示
				item.animating = false;
				node.classList.remove('fix-size');
			}, animationTime * 2);
		}, animationTime * 1.5)

		// this.startAnimation(item);
	}

	downloadBt(item) {
		GlobalService.consoleLog("download" + item.mgurl);
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
						if (!item.status) {
							let url = item.mgurl + '&dn=' + item.title;
							this.util.downloadBt(url, item.resid)
								.then((res: any) => {
									GlobalService.consoleLog("正在下载bt")
									item.status = 1;
									this.displayDownloadAnimaton(item);
								})
								.catch(e => {
									console.log('下载失败');
									item.status = 0;
								})
						}
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

	onPageScroll(e) {
		//GlobalService.consoleLog("onPageScroll event:" + JSON.stringify(e))

		if (e.scrollTop > 60 && this.isShowTitle == true) {
			this.isShowTitle = false;
		}
		if (e.scrollTop < 60 && this.isShowTitle == false) {
			this.isShowTitle = true;
		}
		this.cd.detectChanges();
	}

	displayMenu($event) {
		GlobalService.consoleLog("即将显示左侧........");
		this.menuCtrl.open();
		if ($event.stopPropagation) {
			$event.stopPropagation();
		}
	}

}
