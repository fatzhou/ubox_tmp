import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Clipboard } from '@ionic-native/clipboard';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';

/**
 * Generated class for the WalletImportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-import',
    templateUrl: 'wallet-import.html',
})
export class WalletImportPage {
    privacyCheck: Boolean = false;
    keystore: any = "";

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private clipboard: Clipboard,
        private util: Util,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad WalletImportPage');
        this.clipboard.paste().then(
            (resolve: string) => {
                GlobalService.consoleLog(resolve);
                if(this.checkKeystore(resolve)) {
                    this.global.createGlobalToast(this, {
                        message: Lang.L('WORD3ac2fca4')
                    })
                    this.keystore = resolve;
                }
            },
            (reject: string) => {
                GlobalService.consoleLog('Error: ' + reject);
            }
        );
    }

    checkKeystore(str) {
        var address = "";
        try {
            var keystore = JSON.parse(str);
            address = keystore.address;
            if (!address) {
                throw new Error(Lang.L('WORD056ef792'));
            }
        } catch (e) {
            GlobalService.consoleLog(e);
        }
        return address;
    }

    doImport() {
        var errorTips = "";
        var address = "";
        if (!this.keystore) {
            errorTips = Lang.L('WORDafafb9f2');
            this.global.createGlobalToast(this, {
                message: errorTips,
            });
            return false;
        } else {
            address = this.checkKeystore(this.keystore);
            if(!address) {
                this.global.createGlobalToast(this, {
                    message: Lang.L('WORD1bf131ff'),
                });
                return false;                
            } 
        }
        if (!this.privacyCheck) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDd2f6ca9b'),
            });
            return false;
        }

        var url = '';
        if(this.global.deviceSelected) {
           url = this.global.getBoxApi("createWallet");
        } else {
           url = GlobalService.centerApi['addKeystore'].url;
        }
        this.http.post(url, {
            name: Lang.L('WORD388fa919') + address.slice(0, 8),
            addr: '0x' + address,
            keystore: this.keystore,
            type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
        }).then(
            (res) => {
            if (res.err_no === 0) {
                    this.global.createGlobalToast(this, {
                        message: Lang.L('WORDcd95217b'),
                    });
                    setTimeout(() => {
                        this.navCtrl.pop();
                    }, 300);
                }
            }
        )
    }

    scanKeystore(){
        GlobalService.consoleLog('准备扫描')
        this.util.scanQrcode()
        .then(res => {
            if(res){
                if(this.checkKeystore(res)) {
                    this.global.createGlobalToast(this, {
                        message: Lang.L('WORD3ac2fca4')
                    })
                    this.keystore = res;
                }
            }
        })
    }
}
