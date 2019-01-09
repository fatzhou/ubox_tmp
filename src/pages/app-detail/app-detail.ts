import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { UappPlatform } from "../../providers/UappPlatform";

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
        private util: Util,
        private uappPlatform: UappPlatform,
        private global: GlobalService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AppDetailPage');
        this.info = this.navParams.get("info");
        this.labelList = this.global.SearchData.labelList;
    }

    openApp() {
    	// this.util.openUrl('https://ubbeyscan.io/');
        this.uappPlatform.openapp('pvr');
    }

}
