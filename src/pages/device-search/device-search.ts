import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DeviceSearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-device-search',
  templateUrl: 'device-search.html',
})
export class DeviceSearchPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceSearchPage');
    }

    doRefresh(event) {
        console.log('Begin async operation');
        setTimeout(() => {
          console.log('Async operation has ended');
        }, 2000);
    }
}
