import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";

import { LanguageSelectPage } from '../language-select/language-select';
import { CoinUnitPage } from '../coin-unit/coin-unit';
import { Util } from '../../providers/Util';
import { CopyPhotoPage } from '../copy-photo/copy-photo';

/**
 * Generated class for the SystemSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-system-setting',
  templateUrl: 'system-setting.html',
})
export class SystemSettingPage {

  constructor(public navCtrl: NavController, 
  			  private global: GlobalService,
  			  public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad SystemSettingPage');
  }

  goLangSettingPage() {
  	this.navCtrl.push(LanguageSelectPage);
  }

  goCoinUintPage() {
  	this.navCtrl.push(CoinUnitPage);
  }
  goCopyPhotoPage() {
    if(!this.global.deviceSelected) {
       //未选择设备则不可用
        this.global.createGlobalToast(this, {
            message: this.global.L('YouNotConnectedDev')
        })
    } else {
        this.navCtrl.push(CopyPhotoPage);
    }
  }
}
