import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Web3Service } from '../../providers/Web3Service';
import { Util } from '../../providers/Util';
import { MiningSettingPage } from '../mining-setting/mining-setting';
import { MiningListPage } from '../mining-list/mining-list';
import { MiningTestListPage } from '../mining-test-list/mining-test-list';
import { WalletSelectPage } from '../wallet-select/wallet-select';
import { DeviceListPage } from '../device-list/device-list';
import { Events, App } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { DeviceManagementPage } from '../device-management/device-management';
import { AboutDevicePage } from '../about-device/about-device';

/**
 * Generated class for the MiningPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-mining',
    templateUrl: 'mining.html',
})
export class MiningPage {
    boxInfo:any = {
        mining: true,
        share_size: 0
    };

    ifMining:any;

    shareSize:any = 0;
    username:any = "";
    password:any = "";

    chainType:any = "ERC20";

    totalEarn:any = 0;

    coinbase:String = "";
    miningDays:any = 0;
    miningHours:any = 0;
    miningMinutes:any = 0;

    unlockEarn:any = 0.00;
    lastDayEarn:any = 0.00;
    monthEarned:any = 0.00;
    lastSevenEarnings:any = [];

    pageNo:number = 1;
    pageSize:number = 20;

    needCommit = true;

    shareStorage: any = 0;
    isChainMining: boolean = false;
    isEnoughSpace: boolean = false;
    loading: boolean = false;

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private web3: Web3Service,
        private events: Events,
        private app: App,
        public navParams: NavParams) {

        GlobalService.consoleLog("进入Mining构造函数...");

        this.events.unsubscribe('mining:change');
        this.events.subscribe('mining:change', (obj)=>{
            GlobalService.consoleLog("挖矿数据变更:" + obj.storage);
            this.setIfMining(obj.ifMining);
            let storage = Math.floor(obj.storage / GlobalService.DISK_G_BITS);
            this.shareSize = storage;
            if(this.chainType === 'ERC20') {
                this.global.deviceSelected.shareSize = storage;
            } else {
                this.global.deviceSelected.chainShareSize = storage;
            }
            
        })
        this.events.subscribe('coinbase:change', (res) => {
            this.coinbase = res.coinbase;
            if(this.chainType === 'ERC20') {
                this.global.deviceSelected && (this.global.deviceSelected.coinbase = res.coinbase);
            }
        });
        this.events.subscribe('tab:enter', (res) => {
            if(res.pageId == 1){
                GlobalService.consoleLog('ionViewDidEnter MiningPage');
                this.pageNo = 1;
                this.needCommit = true;
                this.refreshData();
                if(this.chainType !== 'ERC20'){
                    GlobalService.consoleLog("getprocess")
                    this.getShareStorage();
                }
            }
        });
    }

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidEnter MiningPage');
        this.pageNo = 1;
        this.needCommit = true;
        this.refreshData();
        if(this.chainType !== 'ERC20'){
            GlobalService.consoleLog("getprocess")
            this.getShareStorage();
        }
    }

    ionViewDidLeave(){
        this.loading = false;
    }

    refreshData() {
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        //从中心获取挖矿收益
        this.getMiningInfo();
        GlobalService.consoleLog(this.global.deviceSelected)        
    }

    getMiningInfo() {
        GlobalService.consoleLog("检测登录态");
        if (this.global.centerUserInfo.uname !== undefined) {
            GlobalService.consoleLog("用户已登录中心，查询box信息");
            this.getBoxInfo();
        } else {
            this.http.post(GlobalService.centerApi["getUserInfo"].url, {}, false)
            .then((res:any) => {
                if (res.err_no === 0) {
                    GlobalService.consoleLog("已登录");
                    this.global.centerUserInfo = res.user_info;
                    this.getBoxInfo();
                } else {
                    // this.askForLogin();
                    var self = this;
                    Util.askForLogin(this, true, ()=>{
                        self.getBoxInfo();
                    })
                }
            })
        }
    }

    showErrorTips() {
        if(!this.global.deviceSelected) {
            this.global.createGlobalToast(this, {
                message: Lang.L('YouNotConnectedDev')
            })
            return false;
        }
        if(!this.global.boxUserInfo.coinbase) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORD3a536642')
            })
            return false;
        }        
    }

    setChainType() {
        this.global.chainSelectIndex = (this.global.chainSelectIndex + 1) % this.global.chainSelectArray.length;
        this.web3.changeChainProvider();
        this.events.publish('chainType:update');
        this.refreshData();
        if(this.chainType !== 'ERC20'){
            this.getShareStorage();
        }
    }


    changeIfMining() {
        if(this.needCommit === false) {
            GlobalService.consoleLog("本次暂不需要提交ifMining的修改");
            this.needCommit = true;
            return false;
        }

        GlobalService.consoleLog("用户切换了mining状态:" + this.ifMining);
        this.canSetMine(()=>{
        // 未配置盒子，不可点击按钮
            if(!this.coinbase && this.ifMining) {
                this.setIfMining(false);
                this.global.createGlobalToast(this, {
                    message: Lang.L('WORD3a536642')
                })
                return false;
            }
            // this.changeSetMining()
            if(!this.ifMining){
                //关闭挖矿询问
                let title = Lang.L("CloseMining");
                if(this.chainType !== 'ERC20'){
                    title = Lang.L("CloseChainMining");
                }
                this.global.createGlobalAlert(this, {
                    title: title,
                    message: Lang.L("CloseMiningInfo"),
                    buttons: [{
                            text: Lang.L("Cancel"),
                            handler: data => {
                                GlobalService.consoleLog('Cancel clicked');
                                this.setIfMining(true);
                            }
                        },
                        {
                            text: Lang.L("Close"),
                            handler: data => {
                                this.changeSetMining();
                            }
                        }
                    ]
                })
            }else{
                if(this.shareSize == 0){
                    //开启挖矿询问
                    let title = Lang.L("StartMining");
                    let message = Lang.L("StartMiningInfo");
                    if(this.chainType !== 'ERC20'){
                        title = Lang.L("StartChainMining");
                        message = Lang.L("StartChainMiningInfo");
                    }
                    this.global.createGlobalAlert(this, {
                        title: title,
                        message: message,
                        buttons: [{
                                text: Lang.L("StopMining"),
                                handler: data => {
                                    GlobalService.consoleLog('Cancel clicked');
                                    this.setIfMining(false);
                                }
                            },
                            {
                                text: Lang.L("WORD899d5535"),
                                handler: data => {
                                    this.app.getRootNav().push(MiningSettingPage, {
                                        ifMining: !this.ifMining,
                                        chainType: this.chainType,
                                        coinbase: this.coinbase,
                                        shareSize: this.chainType === 'ERC20' ? this.global.deviceSelected.shareSize : this.global.deviceSelected.chainShareSize
                                    });
                                }
                            }
                        ]
                    })
                } else {
                    this.changeSetMining();
                }
            }
        })
    }

    canSetMine(successCallback) {
        if(!!this.global.deviceSelected) {
            GlobalService.consoleLog("用户已选择盒子，此时可以更改挖矿设置")
            successCallback && successCallback();
        } else {
            GlobalService.consoleLog("用户没有选择盒子，此时无法更改挖矿设置")
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD99645c33'),
                message: Lang.L('WORDc9659c05'),
                buttons: [
                    {
                        text: Lang.L('WORD93ea7a8b'),
                        handler: data => {

                        }
                    },
                    {
                        text: Lang.L('WORD0cde60d1'),
                        handler: data => {
                            this.app.getRootNav().push(DeviceListPage, {
                                refresh: false
                            });
                        }
                    }
                ]
            }) 
        }
    }

    setIfMining(b) {
        // GlobalService.consoleLog("从这里设置的...");
        if(this.ifMining !== b) {
            this.needCommit = false;
            this.ifMining = b;
        }
    }

    getBoxInfo() {
        let chainType = this.chainType;
        let shareSize = 0;
        let coinbase = '';
        let chainShareSize = 0;
        GlobalService.consoleLog("更新盒子信息")
        return new Promise((resolve, reject) => {
            if(chainType === 'ERC20') {
                //没有盒子，获取中心接口的信息
                this.http.post(GlobalService.centerApi["getBoxList"].url, {})
                .then(res => {  
                    if(res.err_no === 0) {
                        GlobalService.consoleLog("中心登录，使用中心数据 ");
                        this.boxInfo = res.boxinfo && res.boxinfo[0] || {};
                        if(this.global.deviceSelected){
                            var boxUserInfo = this.global.boxUserInfo;
                            this.setIfMining(!!boxUserInfo.share_switch);
                            shareSize = boxUserInfo.share_storage;
                            coinbase = boxUserInfo.coinbase;    
                        } else {
                            var boxInfo = this.boxInfo;
                            if(boxInfo) {
                                this.setIfMining(boxInfo.mining);
                                shareSize = boxInfo.share_size || 0;
                                coinbase = boxInfo.coinbase;   
                            } else {
                                this.setIfMining(false);
                                shareSize = 0;
                                coinbase = '';   
                            }
                        }
                        resolve();                   
                    } else {
                        reject();
                    }
                })   
            } else {
                if(this.global.deviceSelected){
                    GlobalService.consoleLog("请求测试链数据" + this.global.getBoxApi('getChainProfile'));
                    this.http.post(this.global.getBoxApi('getChainProfile'), {})
                    .then(res => {
                        if(res.err_no === 0) {
                            GlobalService.consoleLog("测试数据")
                            this.setIfMining(res.if_mine === 1);
                            shareSize = res.set_sharesize;
                            chainShareSize = res.set_sharesize;
                            coinbase = res.coinbase;
                            this.shareStorage = res.sharesize;
                            let url = this.global.getBoxApi('getChainOnlineTime');
                            this.http.post(url, {})
                            .then(res => {
                                if(res.err_no == 0){
                                    this.boxInfo.online_mining = res.time;
                                }
                                resolve();
                            })
                            .catch(e => {
                                GlobalService.consoleLog(e.stack);
                                reject();
                            })
                        } else {
                            reject();
                        }
                    })
                    .catch(e => {
                        GlobalService.consoleLog(e.stack);
                        reject();
                    })

                } else {
                    GlobalService.consoleLog("没有盒子啊");
                    reject();
                }

            }          
        })
        .then(()=>{
            GlobalService.consoleLog("分享内存大小：" + shareSize);
            if(this.global.deviceSelected) {
                this.global.deviceSelected.shareSize = Math.ceil(shareSize / GlobalService.DISK_G_BITS);
                this.global.deviceSelected.coinbase = coinbase;
                this.global.deviceSelected.chainShareSize = Math.ceil(chainShareSize / GlobalService.DISK_G_BITS);
            }
            // this.global.miningInfo.shareStorage = (shareSize / GlobalService.DISK_G_BITS).toFixed(0);
            this.shareSize = (shareSize / GlobalService.DISK_G_BITS).toFixed(0);
            GlobalService.consoleLog("最后展示的分享内存shareSize   ：" + this.shareSize + '   ....shareSize    ...' + shareSize);
            this.global.boxInfo = this.boxInfo;
            if(this.boxInfo.online_mining == undefined){
                this.miningDays = '--';
                this.miningHours = '--';
                this.miningMinutes = '--';
            }else{
                var secondsPerDay = 3600 * 24;
                this.miningDays = Math.floor(this.boxInfo.online_mining / secondsPerDay) || 0;
                this.miningHours = Math.floor((this.boxInfo.online_mining % (3600 * 24)) / 3600) || 0;
                this.miningMinutes = Math.floor((this.boxInfo.online_mining % 3600) / 60) || 0;
            }
            this.coinbase = coinbase;
        })
        .then(res => {
            this.setAvenueInfo();  
        })
        .catch(e => {
            GlobalService.consoleLog(e);
            this.initChainData();
        })                  
    }

    initChainData(){
        this.miningDays = '--';
        this.miningHours = '--';
        this.miningMinutes = '--';
        this.isChainMining = false;
        this.isEnoughSpace = false;
        this.global.shareFileProduced = '--';
        this.lastDayEarn = 0.00;
        this.totalEarn = 0.00;
        this.lastSevenEarnings = [];
        this.coinbase = '';
        this.monthEarned = 0.00;
        this.unlockEarn = 0.00;
        this.setIfMining(false);
    }

    setAvenueInfo() {
        var lastDay = new Date(new Date().setDate((new Date().getDate() - 1)));
        var lastDayChain = new Date(new Date().setDate((new Date().getDate() - 1)));
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        if(chainType !== 'ERC20'){
            lastDay = new Date();
        }
        var last30Day = new Date(new Date().setDate((new Date().getDate() - 30)));
        var lastSevenEarnings = [];
        //获取收益信息
        let start = this.getDate(last30Day),
            end = this.getDate(lastDay);

        this.lastSevenEarnings = [];
        this.unlockEarn = 0;
        this.lastDayEarn = 0;
        this.monthEarned = 0;

        this.getAvenueData(start, end, this.coinbase)
        .then(res => {
            if(res.err_no === 0) {
                GlobalService.consoleLog("获取收益成功");
                let unit = this.chainType !== 'ERC20' ? GlobalService.CoinDecimalBlockchain : GlobalService.CoinDecimal;
                var dayInfo = res.day_info || [];
                if(this.chainType !== 'ERC20') {
                    this.totalEarn = (res.total_reward / unit).toFixed(2);
                } else {
                    let totalEarn = this.global.centerUserInfo.earn / GlobalService.CoinDecimal || 0;
                    this.totalEarn = this.util.cutFloat(totalEarn, 2);           
                }
                var monthEarned = 0.00;
                var lastDayEarn = 0.00;
                var unlockEarn = res.not_withdraw || 0;
                var lastDate = [lastDay.getFullYear(), ('00' + (lastDay.getMonth() + 1)).slice(-2), ('00' + lastDay.getDate()).slice(-2)].join('-');
                var thisMonth = new Date().getFullYear() + '-' + ('00' + (new Date().getMonth() + 1)).slice(-2);
                let getLastDate = lastDate;
                if(this.chainType != "ERC20"){
                    let lastday = new Date(new Date().setDate((new Date().getDate() - 1)));
                    getLastDate = [lastday.getFullYear(), ('00' + (lastday.getMonth() + 1)).slice(-2), ('00' + lastday.getDate()).slice(-2)].join('-');
                }
                GlobalService.consoleLog("昨日日期为" + lastDate);
                for(var i = 0, len = dayInfo.length; i < len; i++) {
                    let earn = +dayInfo[i].earn || 0;
                    monthEarned += earn;
                    
                    //只匹配昨天的
                    if(dayInfo[i].date == getLastDate) {
                        lastDayEarn += earn;
                    }

                    //匹配7天前
                    if(i >= len - 7) {
                        var amount = dayInfo[i].earn / unit || 0;
                        GlobalService.consoleLog(amount)
                        lastSevenEarnings.push({
                            date: dayInfo[i].date.replace(/^\d{4}-/,'').replace('-', '/'),
                            amount: this.util.cutFloat(amount, 2),
                            height: Math.min(100, amount / GlobalService.MaxEarnPerDay * 100) + 'px'
                        })
                    }
                } 
                this.unlockEarn = this.util.cutFloat(unlockEarn / unit, 2);
                this.monthEarned = this.util.cutFloat(monthEarned / unit, 2);
                this.lastDayEarn = this.util.cutFloat(lastDayEarn / unit, 2);
                this.lastSevenEarnings = lastSevenEarnings; 
            } else {
                this.totalEarn = 0;
                this.monthEarned = 0;
                this.lastDayEarn = 0;
                this.unlockEarn = 0;
                this.lastSevenEarnings = [];
            }     
            this.loading = true;
        }) 
    }

    getAvenueData(last30Day, lastDay, addr) {
        let chain = this.chainType;
        if(chain === 'ERC20') {
            return this.http.post(GlobalService.centerApi["getAvenueList"].url, {
                // start_date: this.getDate(last30Day),
                // end_date: this.getDate(lastDay),
                start_date: last30Day,
                end_date: lastDay
            })
        } else {
            if(addr) {
                return this.http.post(GlobalService.centerApi["getChainAvenueList"].url, {
                    addr: addr,
                    start_date: last30Day,
                    end_date: lastDay,
                    offset_time: new Date().getTimezoneOffset() * 60
                })                  
            } else {
                return new Promise((resolve, reject) => {
                    resolve({
                        err_no: -1
                    })
                })
            }
          
        }
    }

    getDate(date) {
        var year = date.getFullYear(),
            month = ('00' + (date.getMonth() + 1)).slice(-2),
            day = ('00' + date.getDate()).slice(-2);
        return [year, month, day].join('-') + ' 00:00:00';
    }

    goDeviceList() {
        if(this.global.deviceSelected) {
            GlobalService.consoleLog("已连接设备，进入设备管理");
            this.app.getRootNav().push(AboutDevicePage);            
        }
    }

    setMining() {
        GlobalService.consoleLog("即将设置挖矿信息");
        this.canSetMine(()=>{
            GlobalService.consoleLog("this.global.deviceSelected.chainShareSize"+this.global.deviceSelected.chainShareSize)

            this.app.getRootNav().push(MiningSettingPage, {
                ifMining: this.ifMining,
                chainType: this.chainType,
                coinbase: this.coinbase,
                shareSize: this.chainType === 'ERC20' ? this.global.deviceSelected.shareSize : this.global.deviceSelected.chainShareSize
            });
        })

    }

    goMiningList() {
        GlobalService.consoleLog("进入挖矿页面");
        var self = this;
        if(this.chainType == "ERC20"){
            self.app.getRootNav().push(MiningListPage, {
                coinbase: this.coinbase
            });
        } else {
            self.app.getRootNav().push(MiningTestListPage, {
                coinbase: this.coinbase
            });
        }
    }

    showShareData() {
        if(this.chainType == "ERC20" || this.ifMining == false){
            return false;
        }
        this.events.publish("show-data");
    }


    changeSetMining(){
        GlobalService.consoleLog("this.shareSize  :" +this.shareSize);
        let newSize = parseInt(this.shareSize) * GlobalService.DISK_G_BITS;
        if(this.shareSize == 0 || this.shareSize == '0'){
            if(this.chainType === 'ERC20'){
                newSize = GlobalService.DefaultMiningStorage;
            }else{
                newSize = GlobalService.DefaultChainMiningStorage;
            }
        }
        this.util.toggleIfMining({chainType: this.chainType, ifMining: this.ifMining, oldSize: parseInt(this.shareSize) * GlobalService.DISK_G_BITS, newSize: newSize})
        .then(res => {
            if(res.err_no === 0) {
                if(this.chainType === 'ERC20') {
                    this.global.boxInfo.mining = this.ifMining;
                    this.global.centerUserInfo.mining = this.ifMining;
                    this.boxInfo.mining = this.ifMining;
                    // this.global.miningInfo.ifMining = this.ifMining;
                    this.global.boxUserInfo.share_switch = this.ifMining ? 1 : 0;
                    this.global.boxUserInfo.share_storage = GlobalService.DefaultMiningStorage;
                    this.shareSize = (newSize / GlobalService.DISK_G_BITS).toFixed(0);
                }
            } else {
                GlobalService.consoleLog("更改失败");
                throw new Error("Toggle ifMining failed");
            }
        })
        .then(res => {
            if(this.ifMining) {
                if(this.shareSize == 0 || this.shareSize == '0'){
                    if(this.chainType === 'ERC20'){
                        this.global.createGlobalAlert(this, {
                            title: Lang.L('WORD96cad532'),
                            message: Lang.L('WORDe716466c'),
                            buttons: [
                                {
                                    text: Lang.L('WORD9916edcb'),
                                    handler: data => {
                                    }
                                },
                                {
                                    text: Lang.L('WORD899d5535'),
                                    handler: data => {
                                        GlobalService.consoleLog("this.global.deviceSelected.chainShareSize"+this.global.deviceSelected.chainShareSize)
                                        this.app.getRootNav().push(MiningSettingPage,{
                                            ifMining: this.ifMining,
                                            chainType: this.chainType,
                                            coinbase: this.coinbase,
                                            shareSize: this.chainType === 'ERC20' ? this.global.deviceSelected.shareSize : this.global.deviceSelected.chainShareSize
                                        });
                                    }
                                }
                            ]
                        })
                    }else{
                        this.global.createGlobalAlert(this, {
                            title: Lang.L('WORD96cad532'),
                            message: Lang.L('WORDe716466c'),
                            buttons: [
                                {
                                    text: Lang.L('WORD9916edcb'),
                                    handler: data => {
                                    }
                                },
                                {
                                    text: Lang.L('WORD899d5535'),
                                    handler: data => {
                                        GlobalService.consoleLog("this.global.deviceSelected.chainShareSize"+this.global.deviceSelected.chainShareSize)
                                        this.app.getRootNav().push(MiningSettingPage,{
                                            ifMining: this.ifMining,
                                            chainType: this.chainType,
                                            coinbase: this.coinbase,
                                            shareSize: this.chainType === 'ERC20' ? this.global.deviceSelected.shareSize : this.global.deviceSelected.chainShareSize
                                        });
                                    }
                                }
                            ]
                        })
                    }
                    
                }                
            } 
            // else {
            //     this.global.createGlobalAlert(this, {
            //         title: Lang.L('WORDb3bb7d1a'),
            //         message: Lang.L('WORD7a920180'),
            //         buttons: [
            //             {
            //                 text: Lang.L('WORDd0ce8c46'),
            //                 handler: data => {
            //                 }
            //             }
            //         ]
            //     })             
            // }                    
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.global.closeGlobalLoading(this);
            this.setIfMining(!this.ifMining);
        })
    }
    getShareStorage() {
        if(this.global.deviceSelected){
            this.http.post(this.global.getBoxApi('getMineProgress'), {})
            .then(res => {
                if(res.err_no === 0) {
                    GlobalService.consoleLog("获取生成文件状态")
                    if(res.status == 1) {
                        this.isChainMining = true;
                    } else {
                        this.isChainMining = false;
                    }
                    if(res.status == 3){
                        this.isEnoughSpace = true;
                    } else {
                        this.isEnoughSpace = false;
                    }
                    this.global.shareFileProduced = res.produce_filesize;
                } else {
                    throw new Error("Get mine progress error");
                }
            })
        } else {
            this.isChainMining = false;
            this.isEnoughSpace = false;
            this.global.shareFileProduced = '--';
        }
        
    }
}
