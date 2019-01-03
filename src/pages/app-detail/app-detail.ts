import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the AppDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-app-detail',
    templateUrl: 'app-detail.html',
})
export class AppDetailPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AppDetailPage');
    }

}
