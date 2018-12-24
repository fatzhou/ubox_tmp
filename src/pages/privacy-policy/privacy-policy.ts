import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from '../../providers/Util';

/**
 * Generated class for the PrivacyPolicyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-privacy-policy',
  templateUrl: 'privacy-policy.html',
})
export class PrivacyPolicyPage {

  constructor(public navCtrl: NavController,private global: GlobalService, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad PrivacyPolicyPage');
  }

}
