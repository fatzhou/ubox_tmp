import { Component } from '@angular/core';
import { NavController, NavParams, App, Events } from 'ionic-angular';
import {DeviceDetailPage} from '../device-detail/device-detail';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Lang } from '../../providers/Language';

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
    disks: any = [];
    isShowOptions: boolean = false;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public http: HttpService,
        private lang: Lang,
        private global: GlobalService,) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceManagePage');
        this.disks = this.global.diskInfo.disks;
    }

    goDeviceDetailPage() {
        this.navCtrl.push(DeviceDetailPage);
    }

}
