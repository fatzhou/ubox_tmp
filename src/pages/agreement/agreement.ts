import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from '../../providers/Util';

/**
 * Generated class for the AgreementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-agreement',
  templateUrl: 'agreement.html',
})
export class AgreementPage {

  constructor(public navCtrl: NavController, 
  			  private global: GlobalService,
  			  public navParams: NavParams) {
  	
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad AgreementPage');
  }

}
