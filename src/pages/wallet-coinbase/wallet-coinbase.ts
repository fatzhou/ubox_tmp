import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { AlertController, ToastController } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { WalletImportPage } from '../wallet-import/wallet-import';
import { WalletGeneratorPage } from '../wallet-generator/wallet-generator';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { ChangeDetectorRef } from '@angular/core';
import { Web3Service } from '../../providers/Web3Service'

/**
 * Generated class for the WalletSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-coinbase',
    templateUrl: 'wallet-coinbase.html',
})
export class WalletCoinbasePage {
    walletList: any = [];
    coinbase: "";
    loading: any = true;
    oldCoinbase: "";
    oldShareSize: any = 0;
    chainType: string = 'ERC20'
    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private toastCtrl: ToastController,
        private http: HttpService,
        private events: Events,
        private util: Util,
        public navParams: NavParams,
        private cd: ChangeDetectorRef,
        private web3service: Web3Service
    ) {
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
    }

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidLoad WalletSelectPage');
        this.initWallet();
        this.getWalletList();
        this.coinbase = this.navParams.get('coinbase');
        this.util.getCoinbase()
            .then(res => {
                this.oldCoinbase = res.coinbase;
            })
    }

    ionViewWillEnter() {
        this.loading = true;
    }
    ionViewWillLeave() {
        this.updateWallet();
    }

    goCreateWallet() {
        this.navCtrl.push(WalletGeneratorPage);
    }

    slideCoinbase(addr) {
        this.coinbase = addr;
    }

    getWalletData() {
        let url = "";
        if (!!this.global.deviceSelected) {
            //已连接盒子，直接
            url = this.global.getBoxApi("getWalletList");
        } else if (this.global.centerUserInfo && this.global.centerUserInfo.bind_box_count === 0) {
            //未绑定盒子
            url = GlobalService.centerApi['getKeystore'].url;
        } else {
            throw new Error("Wrong case in getWalletData");
        }
        return this.http.post(url, {
            type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
        });
    }

    getWalletList() {
        if (this.walletList.length == 0) {
            this.global.createGlobalLoading(this, {
                message: Lang.L("Loading")
            });
        }

        this.oldShareSize = this.navParams.get('shareSize');
        this.getWalletData()
            .then(res => {
                this.loading = false;
                if (res.err_no === 0) {
                    if (!res.wallets || !res.wallets.length) {
                        this.global.closeGlobalLoading(this);
                        return false;
                    }
                    if (this.walletList.length === 0) {
                        this.walletList = res.wallets;
                        this.cd.detectChanges();
                    }
                    // this.coinbase = res.coinbase;
                    if (this.global.centerUserInfo.earn !== undefined) {
                        this.getWalletAmount(res.wallets, (wallets) => {
                            if (this.walletList.length > 0) {
                                this.walletList = res.wallets;
                            }
                        });
                    } else {
                        for (var i = 0, len = res.wallets.length; i < len; i++) {
                            res.wallets[i].earn_before = Lang.L('WORDdd409967');
                            res.wallets[i].earn_this_month = Lang.L('WORDdd409967');
                        }
                        this.walletList = res.wallets || [];
                        this.global.closeGlobalLoading(this);
                    }
                    return true;
                }
            })
            .catch(e => {
                console.error(e.stack);
                this.global.closeGlobalLoading(this);
                this.loading = false;
            })
    }

    getMyWalletAmount(wallet) {
        if (wallet.amount === undefined) {
            if (this.global.centerUserInfo.earn !== undefined) {
                //已登录，直接获取
                // this.setWalletBalance(wallet);
                this.getWalletAmount(this.walletList, (wallets) => {
                    this.walletList = wallets;
                });
            } else {
                var self = this;
                //未登录中心
                // this.setWalletBalance(wallet);
                Util.askForLogin(this, false, () => {
                    self.getWalletAmount(self.walletList, (wallets) => {
                        self.walletList = wallets;
                    })
                })
            }
        }
    }

    getWalletAmount(wallets, callback) {
        if (!wallets.length) {
            wallets = [wallets];
        }
        var wallet = wallets.map(wallet => wallet.addr);
        var requestBack = 0;
        GlobalService.consoleLog(JSON.stringify(wallet));

        // this.web3service.initContract(GlobalService.UBBEY_CONTRACT)
        // .then(()=>{
        {
            GlobalService.consoleLog("合约初始化成功");
            this.web3service.getBatchAmount(wallet, GlobalService.getUbbeyContract())
                .then(money => {
                    if (money) {
                        for (let i = 0; i < money.length; i++) {
                            wallets[i].earn_before = this.util.cutFloat(parseInt(money[i]), 2);
                        }
                    }
                    requestBack++;
                    GlobalService.consoleLog(requestBack + "*************")
                    // if(requestBack == 2) {
                    GlobalService.consoleLog("Web3完成，执行allback");
                    this.global.closeGlobalLoading(this);
                    callback && callback(wallets);
                    // }                 
                })
                .catch(e => {
                    GlobalService.consoleLog("Web3完成，执行allback");
                    this.global.closeGlobalLoading(this);
                    callback && callback(wallets);
                })
        }
        // })

        if (this.chainType === 'ERC20') {
            this.http.post(GlobalService.centerApi["getWalletBalance"].url, {
                wallet: wallet.join(',')
            })
                .then((res) => {
                    if (res.err_no === 0) {
                        for (var i = 0, len = res.wallet.length; i < len; i++) {
                            wallets[i].earn_this_month = this.util.cutFloat(res.wallet[i].earn_this_month / GlobalService.CoinDecimal, 2);
                            //wallets[i].earn_before = (res.wallet[i].earn_before / GlobalService.CoinDecimal).toFixed(2);
                        }
                    }
                    requestBack++;
                    GlobalService.consoleLog(requestBack + "=============")
                    // if(requestBack == 2) {
                    if (this.chainType != 'ERC20') {
                        GlobalService.consoleLog("中心接口完成，执行callback");
                        this.global.closeGlobalLoading(this);
                        callback && callback(wallets);
                    }

                    // }
                })
                .catch(e => {
                    if (this.chainType != 'ERC20') {
                        GlobalService.consoleLog("中心接口完成，执行callback");
                        this.global.closeGlobalLoading(this);
                        callback && callback(wallets);
                    }
                })
        }
    }

    saveCoinbase(isChange) {
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        var url = this.global.getBoxApi("setCoinbase");
        if (chainType !== 'ERC20') {
            url = this.global.getBoxApi("setChainCoinbase");
        }
        if (chainType !== 'ERC20') {
            if (isChange) {
                return this.http.post(url, {
                    coinbase: this.coinbase
                })
                    .then(res => {
                        if (res.err_no === 0) {
                            let url = this.global.getBoxApi('stopShare');
                            return this.http.post(url, {})
                        } else {
                            throw new Error('Stop Share error');
                        }
                    })
                    .then(res => {
                        if (res.err_no === 0) {
                            let url = this.global.getBoxApi('clearShareFile');
                            return this.http.post(url, {})
                        } else {
                            throw new Error('Clear Share error');
                        }
                    })
                    .then(res => {
                        if (res.err_no === 0) {
                            let setStoreUrl = this.global.getBoxApi('setChainStorage');
                            return this.http.post(setStoreUrl, {
                                sharesize: parseInt(this.oldShareSize) * GlobalService.DISK_G_BITS
                            })
                        }
                    })
            } else {
                return this.http.post(url, {
                    coinbase: this.coinbase
                });
            }
        } else {
            return this.http.post(url, {
                coinbase: this.coinbase
            });
        }

    }

    doSave() {
        if (!this.coinbase) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORD59abf580')
            });
            return false;
        }
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        let isChange = false;
        if (chainType !== 'ERC20' && this.coinbase != this.oldCoinbase) {
            this.global.createGlobalAlert(this, {
                title: Lang.L('changeWalletTitle'),
                message: Lang.L('changeWalletDetail'),
                buttons: [
                    {
                        text: Lang.L('Ok'),
                        handler: data => {
                            isChange = true;
                            this.global.createGlobalLoading(this, {
                                message: Lang.L('changeWallet')
                            });
                            this.saveCallback(isChange);
                        }
                    },
                    {
                        text: Lang.L('WORD85ceea04'),
                        handler: data => {

                        }
                    },
                ]
            })
        } else {
            this.saveCallback(isChange);
        }
    }

    saveCallback(isChange) {
        this.saveCoinbase(isChange)
            .then(res => {
                if (res.err_no === 0) {
                    this.global.closeGlobalLoading(this);
                    let toast = this.toastCtrl.create({
                        message: Lang.L('WORD6c50c226'),
                        duration: GlobalService.ToastTime,
                        position: 'middle',
                        cssClass: 'toast-error'
                    });
                    toast.present();
                    GlobalService.consoleLog('后面更改的地址 ' + this.coinbase);
                    this.events.publish('coinbase:change', {
                        coinbase: this.coinbase
                    });

                    this.http.post(this.global.getBoxApi('getUserInfo'), {}, false, {}, { needLogin: false })
                        .then((res) => {
                            this.global.boxUserInfo = res.userinfo;
                            setTimeout(() => {
                                this.navCtrl.pop();
                            }, 300);
                        })
                }
            })
            .catch(e => {
                GlobalService.consoleLog('change error');
            })
    }
    initWallet() {
        if (this.global.nowUserWallet[this.chainType]) {
            this.walletList = this.global.nowUserWallet[this.chainType];
            this.loading = false;
            this.cd.detectChanges();
        }
    }
    updateWallet() {
        this.global.nowUserWallet[this.chainType] = this.walletList;
        this.util.setWalletList();
    }
}

