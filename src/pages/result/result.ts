import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { LoginPage } from "../login/login";
import { TabsPage } from "../tabs/tabs";
import { Lang } from "../../providers/Language";
import { Events } from 'ionic-angular';
import { Util } from '../../providers/Util';

/**
 * Generated class for the ResultPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-result',
  templateUrl: 'result.html',
})
export class ResultPage {
  businessType:any = "resetPasswd";
  businessWords:any = {
  	"resetPasswd": {
  		"text": Lang.L('WORD4f3797b0'),
  		"button": Lang.L('WORD31ef4b33')
  	},
    "register": {
      "text": Lang.L('WORD381beeb5'),
      "button": Lang.L('WORD2cb40779')
    },
    "bind": {
      "text": Lang.L('WORD9e182b17'),
      "button": Lang.L('WORD2cb40779')
    }
  };
  constructor(public navCtrl: NavController, 
  			  private global: GlobalService,
          private events: Events,
  			  public navParams: NavParams) {

  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad ResultPage');
    this.businessType = this.navParams.get("type") || "resetPasswd";
  }

  doBusiness() {
  	if(this.businessType === "resetPasswd") {
  		GlobalService.consoleLog("业务类型为重置密码，即将前往登录页");
      this.global.boxUserInfo = {};
      this.global.centerUserInfo = {};
      this.events.publish('root:changed', LoginPage);
      

  	} else if(this.businessType === 'register') {
      this.navCtrl.push(TabsPage)
      .then(() => {
        const startIndex = this.navCtrl.getActive().index;
        this.navCtrl.remove(0, startIndex);
      });
    } else if(this.businessType === 'bind') {
      this.navCtrl.push(TabsPage)
      .then(() => {
        const startIndex = this.navCtrl.getActive().index;
        this.navCtrl.remove(0, startIndex);
      });
    }
  }

}
