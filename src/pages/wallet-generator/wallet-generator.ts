import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { AlertController, ToastController } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { WalletImportPage } from '../wallet-import/wallet-import';
import { Lang } from '../../providers/Language';
/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-generator',
    templateUrl: 'wallet-generator.html',
})
export class WalletGeneratorPage {
    walletname: any = "";
    passwd: any = "";
    passwd2: any = "";
    uError: Boolean = false;
    uErrorText: String = "";
    pError: Boolean = false;
    pErrorText: String = "";
    pError2: Boolean = false;
    pErrorText2: String = "";
    privacyCheck: Boolean = false;
    isCreating: boolean = false;

    constructor(public navCtrl: NavController,
        public toastCtrl: ToastController,
        private global: GlobalService,
        private http: HttpService,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad RegisterPage');
    }

    doCreate() {
        if(this.isCreating == true){
            return false;
        }
        this.isCreating = true;
        this.uError = this.pError = this.pError2 = false;
        this.uErrorText = this.pErrorText = this.pErrorText2 = "";

        this.walletname = this.walletname.replace(/(^\s+|\s+$)/g,'');

        var uCheck = Util.validator.wallet(this.walletname);

        if (uCheck) {
            this.uError = true;
            this.uErrorText = ["", Lang.L('WalletNameMustNotBeEmpty')][uCheck];
            GlobalService.consoleLog(this.uErrorText);
            this.isCreating = false;
            return false;
        }
        var pError = Util.validator.passwd(this.passwd);
        if (pError) {
            this.pError = true;
            this.pErrorText = ["", Lang.L('PayPasswordCannotEmpty'), Lang.L('PasswordRuleDesc')][pError];
            this.isCreating = false;
            return false;
        }
        if (this.passwd2 !== this.passwd) {
            this.pError2 = true;
            this.pErrorText2 = Lang.L('WORDaa3d0f8d');
            this.isCreating = false;
            return false;
        }

        if (!this.privacyCheck) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDd2f6ca9b'),
            });
            this.isCreating = false;
            return false;
        }
  
        this.createWallet();
    }

    createWallet() {
        Util.createWallet(this.passwd, (keystore, filename, address)=>{
            var url = '';
            if(this.global.deviceSelected) {
                url = this.global.getBoxApi("createWallet");
            } else if(this.global.centerUserInfo && this.global.centerUserInfo.bind_box_count === 0) {
                url = GlobalService.centerApi['addKeystore'].url;
            } else {
                throw new Error('Box offline.....');
            }
            this.http.post(url, {
                name: this.walletname,
                addr: address,
                keystore: JSON.stringify(keystore),
                type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
            })     
            .then((res) => {
                if(res.err_no === 0) {
                    this.global.createGlobalToast(this, {
                        message: Lang.L('WORD97e2a1c5'),
					});
					this.global.walletList.unshift({
						name: this.walletname,
						addr: address,
						keystore: JSON.stringify(keystore),
					});
                    setTimeout(()=>{
                        this.navCtrl.pop()
                        .then(()=>{
                            this.isCreating = false;
                        });
                    }, 300);                     
                } else {
                    this.isCreating = false;
                }
            })        
        })
    }

    goImportPage() {
        this.navCtrl.push(WalletImportPage);
    }

}
