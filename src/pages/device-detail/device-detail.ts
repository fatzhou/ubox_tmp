import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';

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
    disk: any = {};
    diskName: any = '';
    diskStatus: any = '';
    diskNo: any = '';
    diskModel: any = '';
    diskVersion: any = '';
    diskNewVersion: any = '';
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceDetailPage');
        this.disk = this.global.diskInfo;
        this.diskName = this.disk.name;
        this.diskStatus = this.global.useWebrtc ? '远场连接' : '内场连接';
        this.diskNo = this.disk.mac;
        this.diskModel = this.disk.hardware;
        this.diskVersion = this.disk.firmware;
        this.diskNewVersion = this.disk.firmware;
    }

}
