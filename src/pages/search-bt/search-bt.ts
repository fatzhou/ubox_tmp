import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtDetailPage } from '../bt-detail/bt-detail';

/**
 * Generated class for the SearchBtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-search-bt',
  templateUrl: 'search-bt.html',
})
export class SearchBtPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchBtPage');
    }

    goBtDetailPage() {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage);
    }

}
