import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SearchBtPage } from '../search-bt/search-bt';
import { BtDetailPage } from '../bt-detail/bt-detail';
import { BtTaskPage } from '../bt-task/bt-task';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-search',
    templateUrl: 'search.html',
})
export class SearchPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchPage');
    }

    goSearchBtPage() {
        console.log("gosearchbt");
        this.navCtrl.push(SearchBtPage);
    }

    goBtDetailPage() {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage);
    }

    goBtTaskPage() {
        console.log("go BtTaskPage");
        this.navCtrl.push(BtTaskPage);
    }
}
