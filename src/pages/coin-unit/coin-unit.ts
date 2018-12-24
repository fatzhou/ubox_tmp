import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { ToastController } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { Storage } from '@ionic/storage';
import { Util } from '../../providers/Util';
import { HttpService } from '../../providers/HttpService';


/**
 * Generated class for the LanguagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-coin-unit',
  templateUrl: 'coin-unit.html',
})
export class CoinUnitPage {
  // language:any = 0;
  constructor(public navCtrl: NavController, 
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private storage: Storage,
  		  public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad LanguagePage');
    this.util.getDisplayRate();
  }

  selectCoinUnit(unit) {
  	GlobalService.consoleLog("您选择了货币单位:" + unit);
  	this.global.coinUnit = unit;
    this.storage.set('Unit', unit);
    this.changeUnit(unit);
  }

  changeUnit(unit) {
    // this.global.createGlobalToast(this, {
    //     message: "货币单位已重新设置为" + unit
    // }); 
    setTimeout(()=>{
      this.navCtrl.pop();
    }, 1000);	
  }
  
}
