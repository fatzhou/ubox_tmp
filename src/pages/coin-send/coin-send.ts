import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { CoinTransactionPage } from '../coin-transaction/coin-transaction';
import { Web3Service } from '../../providers/Web3Service';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import { Clipboard } from '@ionic-native/clipboard';

/**
 * Generated class for the CoinSendPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: 'page-coin-send',
    templateUrl: 'coin-send.html',
})
export class CoinSendPage {
    progress: number = 20;
    total: any;
    keystore: string = "";
    toWallet: string = "";
    sendAmount: any;
    address: string = "";
    gasPrice: any;
    // minGasPrice = 1;
    // maxGasPrice = 100;
    gasTotal = 51639;
    gasUbbeyTotal = 21000;
    ERC20Rate = 1;
    ChainRate = 1e-4;  
    gasUsed;
    gasUbbeyUsed;
    private privateKey: string = "";
    private publicKey: string = "";
    chainType: string;
    isShowPayBox: boolean = false;
    payPassword: any = "";
    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        private web3: Web3Service,
        private global: GlobalService,
        private http: HttpService,
        private util: Util,
        private clipboard: Clipboard,
        public barcodeScanner: BarcodeScanner,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad CoinSendPage');
        this.total = this.navParams.get('total');
        this.address = this.navParams.get("address");
        this.keystore = this.navParams.get('keystore');
        this.progress = 20;
        this.util.getDisplayRate().then(res => {
            this.computeGasPrice();         
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
        this.clipboard.paste().then(
            (str: string) => {
                GlobalService.consoleLog(str);
                let test =/(0x)?[a-fA-F0-9]{40}/g;
                let result = str.match(test);
                if(result.length) {
                    this.global.createGlobalAlert(this, {
                        title: Lang.L("UBBEYTransfer"),
                        message: Lang.L("TransferInfo") +'【' + result[0] + '】',
                        buttons: [{
                                text: Lang.L("Cancel"),
                                handler: data => {
                                    
                                }
                            },
                            {
                                text: Lang.L("ToSend"),
                                handler: data => {
                                    this.toWallet = result[0];
                                }
                            }
                        ]
                    })
                }
            },
            (reject: string) => {
                GlobalService.consoleLog('Error: ' + reject);
            }
        );
        
    }
    scanWallet() {
        this.barcodeScanner.scan({
            showFlipCameraButton: true,
            showTorchButton: true
        }).then((barcodeData) => {
            GlobalService.consoleLog("Success to get code:" + barcodeData.text);
            if(!barcodeData.cancelled) {
                this.toWallet = barcodeData.text;                
            }
        }, (err) => {

        });
    }

    computeGasPrice() {
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        if(this.chainType === 'ERC20') {
            // this.gasPrice = Math.floor((this.progress * (this.maxGasPrice - this.minGasPrice) / 100 + this.minGasPrice));
            this.gasPrice = Math.max(1, this.progress) * this.ERC20Rate;
            let ethRate = this.global.globalRateInfo.filter(item => item.curreycy === 'ETH')[0].rate;
            let totalGas = this.gasPrice * this.gasTotal;
            this.gasUsed = this.util.cutFloat(totalGas / GlobalService.CoinDecimal, 6); //单位:ETH
            this.gasUbbeyUsed = this.util.cutFloat(totalGas / GlobalService.CoinDecimal / ethRate, 2); 
        } else {
            this.gasPrice = Math.max(1, this.progress) * this.ChainRate;
            let totalGas = this.gasPrice * this.gasUbbeyTotal;
            this.gasUbbeyUsed = this.util.cutFloat(totalGas, 2); 
        }   
    }

    transferAll() {
        this.sendAmount = this.total;
    }

    progressChanged() {
        GlobalService.consoleLog("当前进度:" + this.progress);
        this.computeGasPrice();
    }

    startPay() {
        return this.checkPay()
        .then(b => {
            if(b) {
                this.toggleShowPayBox(true);
                // this.getPayPassword();                
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
    }

    toggleShowPayBox(action) {
        this.isShowPayBox = action;
    }
    
    getPayPassword() {
        if (this.payPassword !== '') {
            GlobalService.consoleLog("开始解密-----");
            this.global.createGlobalLoading(this, {
                message: Lang.L("transerSending")
            });
            setTimeout(()=>{
                let result = this.web3.decryptPrivateKey(this.keystore, this.payPassword);
                if (!result.flag) {
                    GlobalService.consoleLog("解密失败");
                    this.global.closeGlobalLoading(this);
                    this.global.createGlobalToast(this, {
                        message: Lang.L('IncorrectPaymentPassword')
                    })
                    return false;
                } else {
                    GlobalService.consoleLog("解密成功")
                    this.privateKey = result.privKey;
                    this.publicKey = result.publicKey;
                    this.doPay();                                    

                }
            },100)
            return true;
        } else {
            this.global.createGlobalToast(this, {
                message: Lang.L('PayPasswordCannotEmpty')
            })                            
            return false;
        }
    }

    checkPay() {
        let message = '';
        if(!this.toWallet) {
            message = Lang.L('PayAddressRequired');
        } else if(!/^(0x)?[a-z0-9A-Z]{40}$/.test(this.toWallet)) {
            message = Lang.L('RightAddress');
        } else if(this.toWallet.toLowerCase().replace(/^0x/, '') == this.address.toLowerCase().replace(/^0x/, '')) {
            message = Lang.L("SelfTransferNotPermitted");
        } else if(this.sendAmount == '') {
            message = Lang.L('TransferAmountRequired');
        } else if(this.sendAmount == 0) {
            message = Lang.L('NoTransferAmountZero');
        } else if(!(parseFloat(this.sendAmount) > 0) && this.sendAmount.test(/^[1-9]/)) {
            message = Lang.L('RightTransferAmount');
        } else {
            let value;
            if(this.chainType === 'ERC20') {
                value = this.sendAmount;
            } else {
                value = this.util.preciseAdd(this.sendAmount, Number(this.gasUbbeyUsed), 4);
            }
            if(value > parseFloat(this.total)) {
                message = Lang.L('InsufficientAccountBalance');
            }        
        }
        if(message) {
            this.global.createGlobalToast(this, {
                message: message
            })
            return Promise.reject(message);
        } else {
            return this.web3.getBatchAmount([this.address], GlobalService.getUbbeyContract())
            .then(res => {
                let value;
                if(this.chainType === 'ERC20') {
                    value = this.sendAmount;
                } else {
                    value = this.util.preciseAdd(this.sendAmount, Number(this.gasUbbeyUsed), 4);
                }
                if(value > res[0]) {
                    message = Lang.L('InsufficientAccountBalance');
                    this.global.createGlobalToast(this, {
                        message: message
                    })
                    return false;
                } else {
                    return true;
                }
            })
        }
    }

    doPay() {
        GlobalService.consoleLog("密码校验成功，开始支付");
        if(!this.toWallet.startsWith('0x')) {
            this.toWallet = '0x' + this.toWallet;
        }
        let contract = GlobalService.getUbbeyContract();
        let base = this.chainType == 'ERC20' ? GlobalService.CoinDecimal : GlobalService.CoinDecimalBlockchain;
        let gas = this.gasPrice;
        let gasBlockchain = Math.ceil(gas * base);
        // let amount = Math.ceil(this.sendAmount * GlobalService.CoinDecimal);
        let amount = Math.ceil(this.web3.floatMultiple(this.sendAmount, GlobalService.CoinDecimal));
        // let amountBlockchain = Math.ceil(this.sendAmount * GlobalService.CoinDecimal * GlobalService.CoinDecimal);
        let amountBlockchain = Math.ceil(this.web3.floatMultiple(this.sendAmount, GlobalService.CoinDecimalBlockchain));
       
        let thisTx = '';

        GlobalService.consoleLog("GasPrice:" + gasBlockchain);

        return new Promise((resolve, reject) => {
            this.web3.transfer(contract, this.address, this.toWallet, amountBlockchain, gasBlockchain, this.privateKey, (err, tx) => {
                thisTx = tx;
                GlobalService.consoleLog("发起成功。。。。。" + err);
                if (err === null) {
                    resolve(tx);
                } else {
                    let message = Lang.L('TransactionFailure');
                    if(err.message.toLowerCase().indexOf('insufficient funds for gas') > -1) {
                        message = this.chainType == 'ERC20' ? Lang.L('EthBalanceInsufficient') : Lang.L('UbbeyBalanceInsufficient');
                    } else if(err.message.toLowerCase().indexOf('replacement transaction underpriced') > -1) {
                        message = Lang.L('transferErrUnderPriced');
                    } else {
                        message = Lang.L('TransactionFailure') + ': ' + err.message;
                    }
                    this.global.createGlobalToast(this, {
                        // message: "发起交易失败:" + err
                        message: message
                    })
                    reject(err);
                }
            });            
        })
        .then(tx => {
            let url, value, gas_price;
            let commitPriceName = 'gas_price';
            let txHAsh = 'txhash';
            GlobalService.consoleLog("计算tx成功：" + tx);
            // let gas = this.web3.convertFloat2Hex(this.gasPrice);
            GlobalService.consoleLog("使用gas:" + gas);
            //支付第一步：生成txhash，并提交后端
            if(this.chainType == 'ERC20'){
                url = GlobalService.centerApi["transferUbbey"].url;
                value = amount;
                gas_price = gas;
                return this.http.post(url, {
                    [txHAsh]: tx,
                    from: this.address,
                    to: this.toWallet,
                    value: value,
                    [commitPriceName]: gas_price
                })
            } else {
                return { err_no : 0 }
            }
            // else {
            //     url = GlobalService.centerApi["commitTransactionPending"].url;
            //     value = amountBlockchain;
            //     gas_price = this.gasUbbeyUsed * GlobalService.CoinDecimalBlockchain;
            //     commitPriceName = 'tx_fee';
            //     txHAsh = 'tx_hash';
            // }
            // return this.http.post(url, {
            //     [txHAsh]: tx,
            //     from: this.address,
            //     to: this.toWallet,
            //     value: value,
            //     [commitPriceName]: gas_price
            // })
        })
        .then(res => {
            if (res.err_no === 0) {
                GlobalService.consoleLog("数据保存后台成功，开始跳转....");
                this.global.closeGlobalLoading(this);
                this.navCtrl.push(CoinTransactionPage, {
                    tx: {
                        txhash: thisTx,
                        type: 1,
                        from: this.address,
                        to: this.toWallet,
                        value: -this.sendAmount,
                        gas_used: this.gasUsed,
                        gas_ubbey_used: this.gasUbbeyUsed,
                        timestamp: Date.now(),
                        status: 1,
                        displayStatus: Lang.L('WaitTransactionPackage')
                    }
                })
            } else {
                throw new Error(Lang.L('commitFailure')); 
            }
        })
        .catch(e => {
            this.global.closeGlobalLoading(this);
            GlobalService.consoleLog(e);
        })
    }

    

}
