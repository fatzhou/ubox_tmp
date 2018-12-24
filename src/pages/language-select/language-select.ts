import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { ToastController } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { Storage } from '@ionic/storage';
import { Util } from '../../providers/Util';


/**
 * Generated class for the LanguagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-language-select',
  templateUrl: 'language-select.html',
})
export class LanguageSelectPage {
  // language:any = 0;
  constructor(public navCtrl: NavController, 
        private global: GlobalService,
            private http: HttpService,
             private toastCtrl: ToastController,
             private storage: Storage,
  		     public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad LanguagePage');
  }

  selectLanguage(lang) {
  	GlobalService.consoleLog("您选择了语言:" + lang);
  	GlobalService.applang = lang;
    this.storage.set('Lang', lang);
    this.changeLanguage();
  }

  changeLanguage() {
    // let toast = this.toastCtrl.create({
    //     message: Lang.L('WORDbae90e96'),
    //     duration: GlobalService.ToastTime,
    //     position: 'middle',
    //     cssClass: 'toast-error',
    // });
    // toast.present();  
    setTimeout(()=>{
      this.navCtrl.pop();
    }, 200);	
  }
}
