import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { AlertController, ToastController } from 'ionic-angular';
import { ChangeDetectorRef } from '@angular/core';
import { WalletImportPage } from '../wallet-import/wallet-import';
import { WalletInfoPage } from '../wallet-info/wallet-info';
import { WalletDetailPage } from '../wallet-detail/wallet-detail';
import { WalletGeneratorPage } from '../wallet-generator/wallet-generator';
import { Lang } from '../../providers/Language';
import { Web3Service } from '../../providers/Web3Service'
/**
 * Generated class for the WalletSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-select',
    templateUrl: 'wallet-select.html',
})
export class WalletSelectPage {
    walletList: any = [];
    loading:any = true;
    chainType = "ERC20";
    
    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private util: Util,
        public navParams: NavParams,
        private cd: ChangeDetectorRef,
        private web3service:Web3Service
    ) {
    }

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidLoad WalletSelectPage');
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];

        this.initWallet();
        if(this.global.centerUserInfo.earn != undefined){
            this.getWalletList();
        } else {
            // this.askForLogin();
            var self = this;
            Util.askForLogin(this, true, ()=>{
                self.getWalletList();
            })
        }
       
    }

    ionViewWillEnter() {
        this.loading = true;
    }

    ionViewWillLeave(){
        this.updateWallet();
    }

    goWalletInfoPage(wallet) {
        this.navCtrl.push(WalletDetailPage, {
            name: wallet.name,
            earn_before: wallet.earn_before,
            earn_this_month: wallet.earn_this_month,
            addr: wallet.addr,
            keystore: wallet.keystore,
            allearn: wallet.allearn
        });
    }

    getWalletData() {
        let url = "";
        if(!!this.global.deviceSelected) {
            //已连接盒子，直接
            url = this.global.getBoxApi("getWalletList"); 
        } else if(this.global.centerUserInfo && this.global.centerUserInfo.bind_box_count === 0) {
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
        if(this.walletList.length == 0){
            this.global.createGlobalLoading(this, {
                message: Lang.L("Loading")
            })
        }

        this.getWalletData()
        .then(res => {
            GlobalService.consoleLog("获取钱包列表成功+++++++++");
            this.loading = false;
            this.global.closeGlobalLoading(this);
            if (res.err_no === 0) {
                if (this.global.centerUserInfo.earn !== undefined && res.wallets && res.wallets.length) {
                    if(this.walletList.length === 0) {
                        this.walletList = res.wallets;
                        this.cd.detectChanges();
                    }

                    GlobalService.consoleLog("-------UI更新-------");
                    this.getWalletAmount(res.wallets, (wallets) => {
                        if(this.walletList.length > 0) {
                            this.walletList = res.wallets;
                        }
                    });
                } else {
                    for (var i = 0, len = res.wallets && res.wallets.length; i < len; i++) {
                        res.wallets[i].earn_before = Lang.L('WORDdd409967');
                        res.wallets[i].earn_this_month = Lang.L('WORDdd409967');
                    }
                    this.walletList = res.wallets || [];
                }
            }  
        })
        .catch(e => {
            console.error(e.stack);
            this.global.closeGlobalLoading(this);
            this.loading = false;
        })
    }

    getWalletAmount(wallets, callback) {
        GlobalService.consoleLog("获取钱包余额...");
        if (!wallets.length) {
            wallets = [wallets];
        }
        var wallet = wallets.map(wallet =>  wallet.addr);
        var requestBack = 0;
        GlobalService.consoleLog(JSON.stringify(wallet));

        if(this.chainType === 'ERC20') {
            this.http.post(GlobalService.centerApi["getWalletBalance"].url, {
                wallet: wallet.join(',')
            })
            .then((res) => {
                if (res.err_no === 0) {
                    for (var i = 0, len = res.wallet.length; i < len; i++) {
                        wallets[i].earn_this_month = this.util.cutFloat(res.wallet[i].earn_this_month / GlobalService.CoinDecimal, 2);
                        // wallets[i].allearn = 0 + parseFloat(wallets[i].earn_this_month);
                        //wallets[i].earn_before = (res.wallet[i].earn_before / GlobalService.CoinDecimal).toFixed(2);
                    }
                }
                // requestBack++;
                // GlobalService.consoleLog(requestBack + "=============")
                // if(requestBack == 2) {
                    GlobalService.consoleLog("中心接口完成，执行callback");
                    this.global.closeGlobalLoading(this);
                    callback && callback(wallets);
                // }
            })    
            .catch(e => {
                GlobalService.consoleLog("中心接口完成，执行callback");
                this.global.closeGlobalLoading(this);
                callback && callback(wallets);                
            })        
        }


        setTimeout(() => {
            GlobalService.consoleLog("合约初始化成功");
            let st = Date.now();
            this.web3service.getBatchAmount(wallet, GlobalService.getUbbeyContract())
            .then(money => {
                if(money){
                    for(let i = 0; i < money.length; i++) {
                        wallets[i].earn_before = money[i] || 0.00;
                        // GlobalService.consoleLog(" wallets[i].allearn " + JSON.stringify(wallets[i].allearn));
                        // wallets[i].allearn = wallets[i].allearn + parseFloat(wallets[i].earn_before);
                    }  
                }
                   
                // requestBack++;
                // GlobalService.consoleLog(requestBack + "*************")
                // if(requestBack == 2) {
                if(this.chainType !== 'ERC20') {
                    GlobalService.consoleLog("Web3完成，执行callback");
                    this.global.closeGlobalLoading(this);
                    callback && callback(wallets);                    
                }

                // }                     
            })
            .catch(e => {
                GlobalService.consoleLog("Web3完成，执行callback");
                this.global.closeGlobalLoading(this);
                callback && callback(wallets);                  
            })
            // setTimeout(()=>{
            //     if(requestBack < 2) {
            //         GlobalService.consoleLog("超时，直接结束");
            //         this.global.closeGlobalLoading(this);
            //         callback && callback(wallets);
            //     }
            // }, 3000)
        }, 0);
    }

    doCreate() {
        GlobalService.consoleLog("创建钱包");
        this.navCtrl.push(WalletGeneratorPage);
    }

    doImport() {
        GlobalService.consoleLog("导入钱包");
        this.navCtrl.push(WalletImportPage);
    }
    doClick(){
        GlobalService.consoleLog("点击你的上一级了");
    }
    getSum(value1,value2){
        if(!value1){
            value1 = 0;
        }
        if(!value2){
            value2 = 0;
        }
        return this.util.cutFloat(parseFloat(value1) + parseFloat(value2), 2);
    }

    initWallet(){
        let chainType = this.chainType;
        if(this.global.nowUserWallet[chainType]){
            this.walletList = this.global.nowUserWallet[chainType];
            this.loading = false;
            this.cd.detectChanges();
        } 
    }
    updateWallet(){
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        this.global.nowUserWallet[chainType] = this.walletList;
        this.util.setWalletList();
    }
}
