import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the BtPlayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-bt-play',
  templateUrl: 'bt-play.html',
})
export class BtPlayPage {
    path: any = "";
    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        // GlobalService.consoleLog('ionViewDidLoad BtPlayPage');
        this.path = this.navParams.get("path") || '';
        // GlobalService.consoleLog(this.path)
    }

}
