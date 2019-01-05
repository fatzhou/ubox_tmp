import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
<<<<<<< HEAD
import { GlobalService } from '../../providers/GlobalService';
=======
>>>>>>> a2fb8de549ed2962a8ef43856158e31fd3f1264b
import { Util } from '../../providers/Util';

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
<<<<<<< HEAD
    info: any = {};
    labelList: any = [];
    size: any;
    time: any;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private util: Util,
        private global: GlobalService) {
    }
=======

	constructor(public navCtrl: NavController, 
				private util: Util,
				public navParams: NavParams) {
	}
>>>>>>> a2fb8de549ed2962a8ef43856158e31fd3f1264b

    ionViewDidLoad() {
        console.log('ionViewDidLoad AppDetailPage');
        this.info = this.navParams.get("info");
        this.labelList = this.global.SearchData.labelList;
    }

    openApp() {
    	this.util.openUrl('https://ubbeyscan.io/');
    }

}
