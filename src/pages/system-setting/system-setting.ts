import { Component } from '@angular/core';
import { NavController, NavParams, Nav } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";

import { LanguageSelectPage } from '../language-select/language-select';
import { CoinUnitPage } from '../coin-unit/coin-unit';
import { CopyPhotoPage } from '../copy-photo/copy-photo';
import { UpdateAssitantPage } from "../update-assitant/update-assitant";
import { AdviceSubmitPage } from '../advice-submit/advice-submit';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import { LoginPage } from '../login/login';
import { ChangePasswdPage } from '../change-passwd/change-passwd';
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
        public navParams: NavParams,
        private util: Util,
        private nav: Nav) {
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


    goAdvicePage() {
        this.navCtrl.push(AdviceSubmitPage);
    }

    goUpdatePage() {
        this.navCtrl.push(UpdateAssitantPage);
    }

    logoutSystem() {
        var self = this;
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD79e4bc03'),
            message: Lang.L('WORDf6cdb0fc'),
            buttons: [
                {
                    text: Lang.L('WORD79e4bc03'),
                    handler: data => {
                        self.util.logout(()=>{
                            this.nav.setRoot(LoginPage);
                        });
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                    }
                },
            ]
        })
    }


    goChangePasswdPage() {
        if(!!this.global.deviceSelected || this.global.centerUserInfo.bind_box_count === 0) {
            this.navCtrl.push(ChangePasswdPage);
        } else {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDb38ae5d2')
            });
            return false;
        }
    }
}
