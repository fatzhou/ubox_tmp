import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from "../../providers/Util";
import { Lang } from '../../providers/Language';
import { Events } from 'ionic-angular';

/**
 * Generated class for the PermissionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-permission',
  templateUrl: 'permission.html',
})
export class PermissionPage {
    isShowBox: boolean = true;
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private events: Events,) {
        events.subscribe('close:box', (res) => {
            this.isShowBox = res;
        })
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad PermissionPage');
    }


}
