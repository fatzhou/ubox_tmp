import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
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

    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private events: Events,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private uappPlatform: UappPlatform,
        private appsInterface: AppsInterface,
        private appsInstalled: AppsInstalled,
        private app: App) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchPage');
    }

    goSearchBtPage() {
        console.log("gosearchbt");
        this.navCtrl.push(SearchBtPage);
    }

    goBtDetailPage() {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage);
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
}
