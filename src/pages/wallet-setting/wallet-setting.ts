import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { HttpService } from "../../providers/HttpService";
import { WalletNameModifyPage } from "../wallet-name-modify/wallet-name-modify";
import { ChangePayPasswordPage } from "../change-pay-password/change-pay-password";
import { ExportKeystorePage } from "../export-keystore/export-keystore";
import { WalletSelectPage } from '../wallet-select/wallet-select';
import { Events } from 'ionic-angular';
import { Lang } from "../../providers/Language";
import { Util } from '../../providers/Util';

/**
 * Generated class for the WalletSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-setting',
    templateUrl: 'wallet-setting.html',
})
export class WalletSettingPage {
    name = "";
    keystore = "";
    addr = "";

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private events: Events,
        public navParams: NavParams) {
        this.events.subscribe('change-wallet', (wallet) => {
            if (wallet.addr === this.addr) {
                GlobalService.consoleLog("更新钱包:" + JSON.stringify(wallet));
                if(wallet.name) {
                    this.name = wallet.name;                    
                }
                if(wallet.keystore) {
                    GlobalService.consoleLog(wallet.keystore)
                    GlobalService.consoleLog(typeof wallet.keystore)
                    this.keystore = wallet.keystore;
                }
            }
        })
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad WalletSettingPage');
        this.name = this.name || this.navParams.get("name");
        this.addr = this.navParams.get("addr");
        this.keystore = this.keystore || this.navParams.get("keystore");
    }

    goModifyNamePage() {
        this.navCtrl.push(WalletNameModifyPage, {
            name: this.name,
            addr: this.addr
        });
    }

    doRemove() {
        if (this.global.boxUserInfo.share_switch && this.global.boxUserInfo.coinbase == this.addr) {
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD18fc4843'),
                message: Lang.L('WORD256b8339'),
                buttons: [{
                    text: Lang.L('WORDd0ce8c46'),
                    handler: data => {}
                }, ]
            })
            return false;
        } else {
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORDed3a93fd'),
                message: Lang.L('WORD702c7fa6'),
                buttons: [{
                        text: Lang.L('WORD85ceea04'),
                        handler: data => {}
                    },
                    {
                        text: Lang.L('WORDd0ce8c46'),
                        handler: data => {
                            var url = '';
                            if(this.global.deviceSelected) {
                                url = this.global.getBoxApi("deleteWallet");
                            } else {
                                url = GlobalService.centerApi['delKeystore'].url; 
                            }
                            this.http.post(url, {
                                    addr: this.addr,
                                    type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
                                })
                                .then(res => {
                                    if (res.err_no === 0) {
                                        this.global.createGlobalToast(this, {
                                            message: Lang.L('WORD5f9bdeda'),
                                        });

                                        if (this.global.boxUserInfo.coinbase == this.addr) {
                                            GlobalService.consoleLog("钱包已经设置为挖矿地址，此时需要清楚设置");
                                            let url = this.global.getBoxApi("setCoinbase");
                                            this.http.post(url, {
                                                coinbase: ""
                                            })
                                            .then(res => {
                                                if (res.err_no === 0) {
                                                    GlobalService.consoleLog("已成功删除coinbase");
                                                    this.global.boxUserInfo && (this.global.boxUserInfo.coinbase = "");
                                                }
                                            })
                                        }
                                        setTimeout(() => {
                                            this.navCtrl.push(WalletSelectPage);
                                        }, 300)
                                    }
                                })
                        }
                    },
                ]
            })
        }
    }

    goChangePayPasswordPage() {
        GlobalService.consoleLog("开始修改支付密码");
        this.navCtrl.push(ChangePayPasswordPage, {
           keystore: this.keystore,
           addr: this.addr
        });
    }

    goExportKeystorePage() {
        this.navCtrl.push(ExportKeystorePage, {
            keystore: this.keystore
        });
    }
}
