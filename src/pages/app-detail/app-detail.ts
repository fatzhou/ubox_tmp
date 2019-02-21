import { Component } from '@angular/core';
import { NavController, NavParams, ItemReorder } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { HttpService } from '../../providers/HttpService';
import { AppsInstalled } from '../../providers/AppsInstalled';
import { UappPlatform } from "../../providers/UappPlatform";
import { InternalFormsSharedModule } from '@angular/forms/src/directives';

/**
 * Generated class for the AppDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-app-detail',
    templateUrl: 'app-detail.html',
})
export class AppDetailPage {
    info: any = {};
    labelList: any = [];
    size: any;
    time: any;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private http: HttpService,
        private util: Util,
        private appsInstalled: AppsInstalled,
        private uappPlatform: UappPlatform,
        private global: GlobalService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AppDetailPage');
        this.info = this.navParams.get("info");
        this.labelList = this.global.SearchData.labelList;
    }

    deleteUapp(item) {
        //删除uapp
        this.appsInstalled.uninstallUapp(this.info);
    }

    goProgress(item, p) {
        if(item.progress < p) {
            //清除上一次未完成的定时器
            if(item.interval) {
                clearInterval(item.interval);
                item.interval = null;
            }
            item.interval = setInterval(() => {
                item.progress++;
                if(item.progress >= p) {
                    clearInterval(item.interval);
                    item.interval = null;
                }
            }, 300);
        }
    }

    openApp() {
        console.log("开始打开uapp......")
    	// this.util.openUrl('https://ubbeyscan.io/');
        this.util.openUapp(this.info, (pro) => {
            this.goProgress(this.info, pro);
        });
    }

}
