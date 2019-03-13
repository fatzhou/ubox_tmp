import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPathPage } from '../bt-set-path/bt-set-path';

/**
 * Generated class for the BtSetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-bt-set',
    templateUrl: 'bt-set.html',
})
export class BtSetPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtSetPage');
    }

    goBtSetPathPage() {
        console.log("go BtTaskPage");
        this.navCtrl.push(BtSetPathPage);
    }

}
