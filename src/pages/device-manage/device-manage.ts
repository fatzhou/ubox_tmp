import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DeviceDetailPage} from '../device-detail/device-detail'
/**
 * Generated class for the DeviceManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-device-manage',
  templateUrl: 'device-manage.html',
})
export class DeviceManagePage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceManagePage');
    }

    goDeviceDetailPage() {
        this.navCtrl.push(DeviceDetailPage);
    }

}
