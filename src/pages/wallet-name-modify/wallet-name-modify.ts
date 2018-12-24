import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController, ToastController } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';

/**
 * Generated class for the WalletNameModifyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-name-modify',
    templateUrl: 'wallet-name-modify.html',
})
export class WalletNameModifyPage {
    walletName: String = "";
    walletAddr: string = "";
    uError: Boolean = false;
    uErrorText: String = "";
    constructor(public navCtrl: NavController, 
              public toastCtrl: ToastController,
              private global: GlobalService,
              private events: Events,
              private http: HttpService,
                public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad WalletNameModifyPage');
        this.walletName = this.navParams.get('name');
        this.walletAddr = this.navParams.get('addr');
        GlobalService.consoleLog(this.walletName)
    }

    eraseWalletName() {
        this.walletName = "";
    }

    doSave() {
        this.walletName = this.walletName.replace(/(^\s+|\s+)$/g, '');
        if(!this.walletName) {
            this.uError = true;
            this.uErrorText = Lang.L('WORD745522b1');
            return false;
        }

        var url = this.global.getBoxApi("modifyWallet");
        this.http.post(url, {
            name: this.walletName,
            addr: this.walletAddr,
            type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
        })
        .then(res => {
            if (res.err_no === 0) {
                let toast = this.toastCtrl.create({
                    message: Lang.L('WORDa638f828'),
                    duration: GlobalService.ToastTime,
                    position: 'middle',
                    cssClass: 'toast-error'
                });
                toast.present();
                //更新钱包名字
                this.events.publish('change-wallet', {
                    name: this.walletName,
                    addr: this.walletAddr
                })
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 300)
            }
        })
    }

}
