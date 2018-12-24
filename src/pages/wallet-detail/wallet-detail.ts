import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CoinGetPage } from '../coin-get/coin-get';
import { CoinSendPage } from '../coin-send/coin-send';
import { CoinTransactionPage } from '../coin-transaction/coin-transaction';
import { CoinUnitPage } from '../coin-unit/coin-unit';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { WalletSettingPage } from '../wallet-setting/wallet-setting';
import { Events } from 'ionic-angular';
import { Web3Service } from '../../providers/Web3Service'; 

/**
 * Generated class for the WalletDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-wallet-detail',
    templateUrl: 'wallet-detail.html',
})
export class WalletDetailPage {
    public refreshTime = 1500; //loading动画最少显示时间
    public refreshStart: any; //下拉松手时间
    public pageNo = 0; //当前页码
    public pageSize = 10; //每页条数
    public pageChainNo = 0; //当前页码
    public recordList:any = []; //数据列表
    public recordChainList:any = []; //数据列表
    public recordPendingList:any = []; //pending数据列表
    public more = false; //是否还有下一页
    public moreChain = false; //测试下挖矿收益是否还有下一页
    public loading = false; //是否正在获取数据
    public walletInfo:any = {}; //钱包信息
    public rateInfo:any = {};
    public chainType:string;
    public chainRecordIndex:number = 0;
    public chainFirstLoad:number = 0;//第一次切换到交易记录
    public totalSpent:number = 0; //pending总花费

    constructor(public navCtrl: NavController, 
                private http: HttpService,
                private global: GlobalService,
                private util: Util,
                private events: Events,
                private web3: Web3Service,
                public navParams: NavParams) {
        this.events.subscribe('change-wallet', (wallet) => {
            if(wallet.addr === this.walletInfo.addr) {
                if(wallet.name) {
                    this.walletInfo.name = wallet.name;                    
                }
                if(wallet.keystore) {
                    this.walletInfo.keystore = wallet.keystore;                     
                }
            }
        })
    }

    // ionViewDidLoad() {

    // }
    ionViewDidLeave(){
        // this.chainFirstLoad = 0;
        // this.chainRecordIndex = 0;
        // this.recordList = [];
        // this.recordChainList = [];
    }
    ionViewDidEnter() {
        //可能修改了汇率单位，此处需刷新
        this.getDisplayRate();
        this.pageNo = 0;
        //可能创建了交易，此处需刷新
        this.doRefresh(null);
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad WalletDetailPage');
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        //初始化钱包信息
        this.walletInfo = {
            name: this.walletInfo.name || this.navParams.get('name'),
            earn_this_month: parseFloat(this.navParams.get('earn_this_month')),
            earn_before: parseFloat(this.navParams.get('earn_before')),
            addr: this.walletInfo.addr || this.navParams.get('addr'),
            keystore: this.walletInfo.keystore || this.navParams.get('keystore')
        };
        this.walletInfo.earn_this_month = !this.walletInfo.earn_this_month == true || this.chainType != 'ERC20' ? 0 : this.walletInfo.earn_this_month;
        this.walletInfo.earn_before = !this.walletInfo.earn_before == true ? 0 : this.walletInfo.earn_before;
        this.walletInfo.totalEarn = this.util.cutFloat(this.walletInfo.earn_this_month + this.walletInfo.earn_before, 2);
        // if(this.walletInfo.totalEarn > 1e8) {
        //     this.walletInfo.totalEarn = Number(this.walletInfo.totalEarn).toExponential(2);
        // }
        //获取累计挖矿
        if(this.chainType === 'ERC20'){
            this.getAccumulateMining();
        }else{
            let offset = new Date().getTimezoneOffset() * 60;
            this.http.post(GlobalService.centerApi["getChainAvenueList"].url, {
                start_date: '2018-10-01 00:00:00',
                end_date: Util.getTime(new Date()),
                addr: this.walletInfo.addr,
                offset_time: offset
            })
            .then(res => {
                if(res.err_no === 0) {
                    this.walletInfo.totalMining = this.util.cutFloat(res.total_reward / GlobalService.CoinDecimalBlockchain, 2);
                }
            })
            .catch(e => {
                GlobalService.consoleLog(e.stack);
            })
        }
        
        

    }

    getAccumulateMining() {
        let url = GlobalService.centerApi.getWalletTotalMining.url;
        this.http.post(url, {
            addr: this.walletInfo.addr
        })
        .then(res => {
            if(res.err_no === 0) {
                this.walletInfo.totalMining = this.util.cutFloat(res.total / GlobalService.CoinDecimal, 2);
            }
        })
    }

    doRefresh(refresher) {
    	GlobalService.consoleLog("开始刷新数据...");
        //记录刷新时间戳
        this.refreshStart = Date.now();
        this.getChainPendingList();

        this.refreshWalletInfo(refresher);

        this.refreshWalletAmount();
    }

    refreshWalletAmount() {
        this.web3.getBatchAmount([this.walletInfo.addr], GlobalService.getUbbeyContract())
        .then(res => {
            let value = res[0];
            GlobalService.consoleLog("钱包余额：" + value);
            this.walletInfo.earn_before = value;
            this.walletInfo.totalEarn = this.util.cutFloat((+this.walletInfo.earn_this_month) + (+this.walletInfo.earn_before), 2);
            GlobalService.consoleLog((+this.walletInfo.earn_this_month) + (+this.walletInfo.earn_before))
            GlobalService.consoleLog("总钱数：" + this.walletInfo.totalEarn);
        })
    }

    evaluteWealth() {
       let wealth:any =  (parseFloat(this.walletInfo.earn_this_month) + parseFloat(this.walletInfo.earn_before)) * (this.rateInfo.rate || 0);
       // if(wealth > 1e8) {
       //   wealth = Number(wealth).toExponential(this.rateInfo.significand)
       // } else {
       //   wealth = wealth.toFixed(this.rateInfo.significand);
       // }

       wealth = this.util.cutFloat(wealth, this.rateInfo.significand);
       return wealth;
    }

    getDisplayRate() {
        this.http.post(GlobalService.centerApi["getUbbeyRate"].url, {})  
        .then(res => {
            if(res.err_no === 0) {
                if(res.rates) {
                    for(let i = 0, len = res.rates.length; i < len; i++) {
                        res.rates[i].symbol = {
                            "USD": "$",
                            "RMB": "¥",
                            "KWR": "₩",
                            "BTC": "฿"
                        }[res.rates[i].curreycy] || res.rates[i].curreycy;
                    }
                    this.rateInfo = (res.rates.filter(item => item.curreycy === this.global.coinUnit))[0] || {};
                    GlobalService.consoleLog(this.rateInfo)
                }
                this.global.globalRateInfo = res.rates;
            }
        })      
    }

    setCoinUnit() {
        this.navCtrl.push(CoinUnitPage);
    }

    getMore(infiniteScroll) {
        let more = this.more;
        let pageNo = this.pageNo;
        if(this.chainType != 'ERC20' && this.chainRecordIndex == 0){
            more = this.moreChain;
            pageNo = this.pageChainNo;
        }
        if(more === false) {
            infiniteScroll.complete();
            return false;
        }
        this.refreshWalletInfo(null)
        .then(total => {
            GlobalService.consoleLog("数据总数：" + total + ",页码：" + pageNo + "," + (total <= pageNo * this.pageSize));
            if(total <= pageNo * this.pageSize) {
                console.error("数据拉取完成...");
                if(this.chainType != 'ERC20' && this.chainRecordIndex == 0){
                    this.moreChain = false;
                }else{
                    this.more = false;
                }
                infiniteScroll.complete();
            } else {
                console.error("继续获取数据：" + total);
                this.getMore(infiniteScroll)
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
        return true;
    }

    computeDisplayAddr(addr) {
        return addr.slice(0, 8) + '......' + addr.slice(-8);
    }

    goWalletSettingPage() {
        this.navCtrl.push(WalletSettingPage, {
            name: this.walletInfo.name,
            addr: this.walletInfo.addr,
            keystore: this.walletInfo.keystore
        });
    }

    refreshWalletInfo(refresher) {
        if (refresher) {
            if(this.chainType != 'ERC20' && this.chainRecordIndex == 0){
               this.pageChainNo = 1;
            } else{
                this.pageNo = 1;
            }
        } else {
            if(this.chainType != 'ERC20' && this.chainRecordIndex == 0){
                this.pageChainNo = this.pageChainNo + 1;
            } else{
                this.pageNo = this.pageNo + 1;
            }
        }
        this.loading = true;
        if(this.chainType != 'ERC20' && this.chainRecordIndex == 0){
            return this.getMiningReward(refresher);
        }else{
            return this.getTransactList(refresher);
        }
        
    }

    goTransactionPage(list) {
        let gasUsed = list.gas_price * list.gas_used / GlobalService.CoinDecimal; //转换成eth
        let ethRate = this.global.globalRateInfo.filter(item => item.curreycy === 'ETH')[0].rate;
        let gasUbbey = gasUsed / ethRate;
        gasUbbey = this.util.cutFloat(gasUbbey, 2)
        if(this.chainType !== 'ERC20') {
            gasUsed = list.txfee / GlobalService.CoinDecimalBlockchain; //转换成eth
            gasUbbey = this.util.cutFloat(gasUsed, 6);
        }
        this.navCtrl.push(CoinTransactionPage, {
            tx: {
                from: list.from,
                to: list.to,
                value: list.value,
                txhash: list.txhash || list.tx_hash,
                status: list.status || 1,
                displayStatus: list.displayStatus,
                gas_used: this.util.cutFloat(gasUsed, 6),
                gas_ubbey_used: gasUbbey,   
                timestamp: list.timestamp * 1000
            }
        });
    }

    getUbbey() {
        this.navCtrl.push(CoinGetPage, {
            address: this.walletInfo.addr
        });
    }

    sendUbbey() {
        //计算可转账金额
        this.web3.getBatchAmount([this.walletInfo.addr], "", false)
        .then(res => {
            let total = 0;
            if(this.chainType !== 'ERC20') {
                total = res[0];
                //测试链需去除已转账pending金额
                 if(this.recordPendingList.length) {
                      total = this.util.cutFloat(total - this.totalSpent / GlobalService.CoinDecimalBlockchain, 2);
                 }   
            } else {
                total = this.walletInfo.earn_before;
            }
            this.navCtrl.push(CoinSendPage, {
                address: this.walletInfo.addr,
                total: total,
                keystore: this.walletInfo.keystore
            }); 
        })

    }

    getTransactList(refresher){
        var url = GlobalService.centerApi["getTransferList"].url;
        if(this.chainType !== 'ERC20') {
            url = GlobalService.centerApi["getTransactionByAddress"].url;
        }
        return this.http.post(url, {
            addr: this.walletInfo.addr,
            pageIndex: this.pageNo,
            pageSize: this.pageSize
        })
        .then(res => {
            if(res.err_no === 0) {
                this.more = (res.trans_num > this.pageNo * this.pageSize);
                let transList = res.trans || [];
                let base = GlobalService.CoinDecimal;
                if(this.chainType !== 'ERC20') {
                    this.more = (res.count > this.pageNo * this.pageSize);
                    transList = res.transactions || [];
                    base = GlobalService.CoinDecimalBlockchain;
                }
                for(let list of transList) {
                    //类型扩展
                    list.transferType = list.from === this.walletInfo.addr ? '-' : '+';
                    list.displayTime = Util.getLocalTime(list.timestamp * 1000);
                    list.addr = list.from === this.walletInfo.addr ? list.to : list.from;
                    list.displayAddr = list.type === 0 ? this.global.L("MiningReward") : this.computeDisplayAddr(list.addr || '');
                    list.value = this.util.cutFloat(list.value / base, 2);
                    if(list.value > 1e12) {
                        list.value = Number(list.value).toExponential(2);
                    }
                    list.displayStatus = this.util.computeTxStatus(list.status || 2);
                    list.value = list.transferType + list.value;
                }
                if(this.pageNo === 1) {
                    this.recordList = transList || [];                     
                } else {
                    this.recordList = this.recordList.concat(transList || []);
                }
            }
            if(refresher) {
                let st = Date.now() - this.refreshStart; 
                setTimeout(() => {
                    refresher.complete();
                    this.loading = false;
                }, this.refreshTime - st);                 
            } else {
                this.loading = false;
            }
            return res && res.trans_num || 0;
        })
    }

    changeChainRecordIndex(index){
        this.chainRecordIndex = index;
        this.doRefresh(null);        
    // if(this.chainFirstLoad == 0 && index == 1){
        //     this.doRefresh(null);
        //     this.chainFirstLoad = 1;
            
        // }
    }
    getMiningReward(refresher){
        return this.http.post(GlobalService.centerApi["getChainMiningList"].url, {
            addr: this.walletInfo.addr,
            pageIndex: this.pageChainNo,
            pageSize: this.pageSize
        })
        .then(res => {
            if(res.err_no === 0) {
                this.moreChain = (res.count > this.pageChainNo * this.pageSize);
                let transList = res.blocks || [];
                let base = GlobalService.CoinDecimalBlockchain;
                for(let list of transList) {
                    //类型扩展
                    list.displayTime = Util.getLocalTime(list.timestamp * 1000);
                    list.value = this.util.cutFloat((parseInt(list.block_fees) + parseInt(list.block_reward)) / base, 2);
                    if(list.value > 1e12) {
                        list.value = Number(list.value).toExponential(2);
                    }
                }
                if(this.pageChainNo === 1) {
                    this.recordChainList = transList || [];                     
                } else {
                    this.recordChainList = this.recordChainList.concat(transList || []);
                }
            }
            if(refresher) {
                let st = Date.now() - this.refreshStart; 
                setTimeout(() => {
                    refresher.complete();
                    this.loading = false;
                }, this.refreshTime - st);                 
            } else {
                this.loading = false;
            }
            return res && res.trans_num || 0;
        })
    }
    getChainPendingList(){
        if(this.chainType == 'ERC20') {
            return false;
        }
        this.http.post(GlobalService.centerApi["getTransactionPendingList"].url, {
            addr: this.walletInfo.addr
        })
        .then((res) => {
            if(res.err_no == 0){
                this.recordPendingList = [];
                let transList = res.penddings || [];
                this.totalSpent = 0;
                if(transList.length > 0){
                    transList = transList.sort((a,b)=>{
                        return b.nonce - a.nonce;
                    })
                    for(let list of transList) {
                        //类型扩展
                        list.transferType = list.from === this.walletInfo.addr ? '-' : '+';
                        list.timestamp = 0;
                        list.displayTime = '';
                        list.addr = list.from === this.walletInfo.addr ? list.to : list.from;
                        list.displayAddr = list.type === 0 ? this.global.L("MiningReward") : this.computeDisplayAddr(list.addr || '');
                        if(list.from === this.walletInfo.addr) {
                            this.totalSpent  = this.totalSpent + parseInt(list.value) + parseInt(list.txfee);
                        }
                        list.value = this.util.cutFloat(list.value / GlobalService.CoinDecimalBlockchain, 2);
                        if(list.value > 1e12) {
                            list.value = Number(list.value).toExponential(2);
                        }
                        list.status = 1;
                        list.displayStatus = this.util.computeTxStatus(list.status || 1);
                        list.value = list.transferType + list.value;
                    }
                    this.recordPendingList = transList || [];       
                }
            }
        })
        .catch((e) => {
            GlobalService.consoleLog(e.stack);
        })
        return true;
    }
}
