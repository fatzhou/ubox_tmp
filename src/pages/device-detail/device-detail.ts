import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DeviceDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-device-detail',
    templateUrl: 'device-detail.html',
})
export class DeviceDetailPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceDetailPage');
    }

}
