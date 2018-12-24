import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the ResetpasswdPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-reset-passwd',
  templateUrl: 'reset-passwd.html',
})
export class ResetPasswdPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad ResetpasswdPage');
  }

}
