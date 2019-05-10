import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DeviceSearchPage} from '../device-search/device-search'
import { GlobalService } from '../../providers/GlobalService';
import {LoginPage} from '../login/login'
import { HttpService } from '../../providers/HttpService';

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
                private http: HttpService,
				public navParams: NavParams) {
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad DeviceGuidancePage');
    }
    goDeviceSearchPage() {
        this.navCtrl.push(DeviceSearchPage);
    }
    goLoginPage() {
        this.global.boxUserInfo = {};
        this.global.centerUserInfo = {};
        this.global.diskInfo = {};
        this.http.post(GlobalService.centerApi["logout"].url, {}, false)
        this.navCtrl.setRoot(LoginPage);
    }
}
