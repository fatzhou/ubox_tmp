import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

import { AppDetailPage } from '../app-detail/app-detail';

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
    windowWidth: number;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private events: Events,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private app: App) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchPage');
        this.windowWidth = document.documentElement.offsetWidth - 18;
    }

    goAppDetail() {
        this.app.getRootNav().push(AppDetailPage);
    }

    //远程获取配置
    getVersionControl() {
        var that = this;
        var url = GlobalService.searchDataConfig[GlobalService.ENV];
        if(this.global.firstLoadVersion == 0){
            return this.http.get(url, {}, false)
            .then((res:any) => {
                if(typeof res === 'string') {
                    res = JSON.parse(res);
                }
                return res;
            })
            .catch(e => {
                GlobalService.consoleLog('版本配置赋值出错:' + e.stack);
            })
        } else {
            return new Promise(()=>{
                
            })
        }
    }

}
