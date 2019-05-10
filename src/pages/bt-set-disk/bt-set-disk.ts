import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPathPage } from '../bt-set-path/bt-set-path';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
/**
 * Generated class for the BtSetDiskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-bt-set-disk',
  templateUrl: 'bt-set-disk.html',
})
export class BtSetDiskPage {
    disks: any = [];
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public global: GlobalService,) {
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad BtSetDiskPage');
        this.disks = this.global.diskInfo.disks;
	}
	
	goNext(disk) {
        this.global.currSelectDiskUuid = disk.uuid;
		this.navCtrl.push(BtSetPathPage, {
            currPath: '/'
        });
	}

}
