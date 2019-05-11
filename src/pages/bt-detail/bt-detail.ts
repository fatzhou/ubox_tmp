import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";
import { Clipboard } from '@ionic-native/clipboard';
import { SearchPage } from '../search/search';
import { BtTaskPage } from '../bt-task/bt-task';


/**
 * Generated class for the BtDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-bt-detail',
	templateUrl: 'bt-detail.html',
})
export class BtDetailPage {
	type: string = 'feed';
	detailId: string = '';
	title: string = '';
	size: string = '';
	createdTime: string = '';
	fileType: any;
	language: string = '';
	file_number: any;
	btNum: any;
	hash: string = '';
	heat: string = '';
	link: string = '';
	detailDesc: any = null;
	isShowDesc: boolean = false;
	fileList = [];
	titleImgList: any = [];
	desImgList: any = [];
	status: any = 0;
	isShowMoreBtn: boolean = false;
	payUbbey: any = 0;
	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public global: GlobalService,
		public util: Util,
		public http: HttpService,
		private events: Events,
		private clipboard: Clipboard, ) {
	}

	ionViewDidLoad() {
		// GlobalService.consoleLog('ionViewDidLoad BtDetailPage');
		this.type = this.navParams.get("type");
		this.detailId = this.navParams.get("id");
		this.status = this.navParams.get('status');
		this.getDetail();
	}

	getDetail() {
		var url = '', param = {};
		if (this.type == 'feed') {
			url = GlobalService.centerApi["getFeedDetail"].url;
			param = {
				feedid: this.detailId
			}
		} else {
			url = GlobalService.centerApi["getSearchDetail"].url;
			param = {
				feedid: this.detailId
			}
		}
		this.http.post(url, param)
			.then((res) => {
				if (res.err_no === 0) {
					this.title = res.title;
					this.size = res.size;
					this.createdTime = res.mgdate;
					this.fileType = res.format;
					this.language = res.feedid;
					this.file_number = res.file_number;
					this.btNum = res.seed;
					this.hash = res.hash;
					this.heat = res.heat;
					this.link = res.mgurl;
					if(res.title_images) {
						this.titleImgList = [res.title_images[0]];
					} else {
						this.titleImgList = [];
					}
					this.desImgList = res.des_images || [];
					let language = 'en';
					if (GlobalService.applang == 'cn') {
						language = 'zh';
					} else {
						language = GlobalService.applang;
					}
					let testFeedId = /[c]$/;
					if (this.type == 'feed' || testFeedId.test(this.detailId)) {
						this.detailDesc = JSON.parse(res.describe)[language].describe;
					} else {
						this.detailDesc = res.describe;
					}
					this.isShowMoreBtn = this.detailDesc.length < 240 ? false : true; 
					if(this.type == 'feed') {
						this.setFileList(JSON.parse(res.file_list));
					} else {
						this.setFileList(res.file_list);
					}
				}
			})
	}

	setFileList(list:any) {
		if(!list || !list.length) {
			GlobalService.consoleLog("没有找到文件....");
			return false;
		}
		//解析pid
		let idIndex = 1;
		let filesObj = {};
		GlobalService.consoleLog(list)
		if(this.type == 'feed') {
			list.forEach(item => {
				let path = (typeof item == 'string') ? item : item.path;
				// GlobalService.consoleLog("sss" + path)
				let pathArray = path.split('/');
				item.id = idIndex++;
				if (pathArray.length == 1) {
					//根目录下的文件
					item.pid = 0;
					filesObj[path] = item;
					item.children = null;
				} else {
					//目录分级
					let parent = pathArray.slice(0, pathArray.length - 1);
					// GlobalService.consoleLog("父节点长度：" + parent)
					//增加顶层目录
					for (let i = 0; i < parent.length; i++) {
						let currentName = parent.slice(0, i + 1).join('/');
						// GlobalService.consoleLog("父节点：" + currentName);
						if (!filesObj[currentName]) {
							let pid = i == 0 ? 0 : filesObj[parent.slice(0, i)].id;
							filesObj[currentName] = {
								id: idIndex++,
								pid: pid,
								name: parent[parent.length - 1],
							};
						}
					}
					//当前元素
					item.pid = filesObj[parent.join('/')].id;
					// GlobalService.consoleLog("另一个叶节点：" + item.name);
					filesObj[path] = item;
				}
			});
		}
		

		let self = this;

		function findCurrPid(id) {
			var _arr = [];
		
			for(let i in filesObj) {
				if(filesObj[i].pid == id) {
				
					filesObj[i].children = findCurrPid(filesObj[i].id);
					if(filesObj[i].children) {
						filesObj[i].style = 'folder';
					} else {
						filesObj[i].style = self.util.computeFileType(filesObj[i].name);
					}
					_arr.push(filesObj[i]);
				}
			}
			return _arr.length ? _arr : null;
		}
		if(this.type == 'feed') {
			this.fileList = findCurrPid(0);
		} else {
			this.fileList = list;
		}
		GlobalService.consoleLog("bt种子的文件列表:" + JSON.stringify(this.fileList))
	}

	downloadBt() {
		// GlobalService.consoleLog("download" + this.link)
		if(this.status == 1) {
            return false;
        }
		this.status = 1;
		let url = this.link + '&dn=' + this.title;
		this.util.downloadBt(url, this.detailId)
		.then(res => {
			GlobalService.consoleLog("正在下载bt")
			this.events.publish('btdownloading', this.detailId);
		})
	}

	toggleShowDesc() {
		this.isShowDesc = !this.isShowDesc;
	}

	copyLink() {
		this.clipboard.copy(this.link)
			.then(res => {
				this.global.createGlobalToast(this, {
					message: Lang.L('CopySucceed')
				})
			})
			.catch(e => {
				GlobalService.consoleLog(e);
			})
	}

	goSearchPage() {
		this.navCtrl.push(SearchPage);
	}

	goBtTaskPage() {
        GlobalService.consoleLog("go BtTaskPage");
        this.navCtrl.push(BtTaskPage);
    }

	goBack() {
        this.navCtrl.pop();
    }
}
