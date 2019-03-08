import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPage } from '../bt-set/bt-set';

/**
 * Generated class for the BtTaskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-bt-task',
    templateUrl: 'bt-task.html',
})
export class BtTaskPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtTaskPage');
    }
    goBtSetPage() {
        console.log("go BtTaskPage");
        this.navCtrl.push(BtSetPage);
    }

}
