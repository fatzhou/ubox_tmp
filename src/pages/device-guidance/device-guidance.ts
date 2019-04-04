import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DeviceSearchPage} from '../device-search/device-search'
import { GlobalService } from '../../providers/GlobalService';
/**
 * Generated class for the DeviceGuidancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-device-guidance',
    templateUrl: 'device-guidance.html',
})
export class DeviceGuidancePage {

	constructor(public navCtrl: NavController, 
				private global: GlobalService,
				public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceGuidancePage');
    }
    goDeviceSearchPage() {
        this.navCtrl.push(DeviceSearchPage);
    }
}
