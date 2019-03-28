import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPathPage } from '../bt-set-path/bt-set-path';

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

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtSetDiskPage');
	}
	
	goNext() {
		let path = this.navParams.get('currPath');
		this.navCtrl.push(BtSetPathPage);
	}

}
