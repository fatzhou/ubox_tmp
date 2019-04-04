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

import { InternalFormsSharedModule } from '@angular/forms/src/directives';
/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-find',
    templateUrl: 'find.html',
})
export class FindPage {

    feedList: any = [];
    loading: boolean = false;
    isShowTitle: boolean = true;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private events: Events,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private uappPlatform: UappPlatform,
        private appsInterface: AppsInterface,
        private appsInstalled: AppsInstalled,
        private menuCtrl: MenuController,
        private app: App) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FindPage');
        this.getFeedTop();
        this.getFeedList();
    }
    ionViewWillLeave() {
        console.log("leave")
        // this.feedList = [];
    }
    goSearchBtPage() {
        console.log("gosearchbt");
        this.navCtrl.push(SearchBtPage);
    }

    goBtDetailPage(id) {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage, {
            type: 'feed',
            id: id
        });
    }
    //远程获取配置
    getSearchData() {
        var that = this;
        var url = GlobalService.searchDataConfig[GlobalService.ENV];
        if(!this.global.SearchData){
            return this.http.get(url, {}, false, {}, {}, true)
            .then((res:any) => {
                if(typeof res === 'string') {
                    res = JSON.parse(res);
                }
                if(res) {
                    // console.log("search拿到了")
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
        console.log("go BtTaskPage");
        this.navCtrl.push(BtTaskPage);
    }

    getFeedTop() {
        var url = GlobalService.centerApi["getFeedTop"].url;
        this.http.post(url, {})
        .then((res) => {
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                if (res.list && res.list.length > 0) {
                    
                    console.log(JSON.stringify(res.list));
                    
                    this.feedList.unshift(res.list[0]);
                    
                }
                
            }
        })
    }
    getFeedList() {
        if(this.loading == true) {
            return false;
        }
        this.loading = true;
        var url = GlobalService.centerApi["getFeedList"].url;
        this.http.post(url, {
            id:0
        })
        .then((res) => {
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                if (res.list && res.list.length > 0) {
                    let hash = {}; 
                    this.feedList = this.feedList.concat(res.list);
                    this.feedList = this.feedList.reduce((preVal, curVal) => {
                        hash[curVal.resid] ? '' : hash[curVal.resid] = true && preVal.push(curVal); 
                        return preVal 
                    }, [])
                }
                setTimeout(()=>{
                    this.loading = false;
                },500);
            }
        })
    }

    refreshFeedList(infiniteScroll) {
        GlobalService.consoleLog("上滑加载")
        this.getFeedList();
        infiniteScroll.complete();     
    }

    downloadBt(item) {
        console.log("download" + item.mgurl)
        if(item.status && item.status == 1) {
            return false;
        }
        item.status = 1;
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
                            console.log("正在下载bt")
                        })
                        return true;
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.handleBack();
                    }
                },
            ]
        })
    }

    onPageScroll(e) {
        console.log(e.scrollTop)
        if(e.scrollTop > 60 && this.isShowTitle == true) {
            this.isShowTitle = false;
            console.log(this.isShowTitle)
        }
        if(e.scrollTop < 60 && this.isShowTitle == false) {
            this.isShowTitle = true;
            console.log(this.isShowTitle)
        }
    }
    
    displayMenu($event) {
		console.log("即将显示左侧........");
		this.menuCtrl.open();
		if($event.stopPropagation) {
			$event.stopPropagation();
		}
    }

}
