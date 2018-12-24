import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';


@Component({
    selector: 'page-mining-test-list',
    templateUrl: 'mining-test-list.html',
})
export class MiningTestListPage {
    avenueData:any = [];
    avenueMap:any = {};
    coinbase:string = "";
    loading = true; //是否正在获取数据
    chainType:any;
    start:any = 1538323200000;
    nowstart:any = new Date();
    nowend:any = new Date();
    constructor(public navCtrl: NavController, 
                private global: GlobalService,
                private http: HttpService,
                private util: Util,
    			public navParams: NavParams) {}

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidLoad MiningTestListPage');
        this.chainType = this.global.getChainType();
        this.coinbase = this.navParams.get('coinbase');
        this.getMiningList();

    }

    ionViewDidLeave() {
        this.avenueData = [];
        this.avenueMap = {};
    }

    getMiningList() {
        GlobalService.consoleLog("检测登录态");
        if (this.global.centerUserInfo.uname !== undefined) {
            GlobalService.consoleLog("用户已登录中心，查询box信息");
            this.getMiningData();
        } else {
        	var self = this;
        	Util.askForLogin(this, true, ()=>{
        		self.getMiningData();
        	});
        }
    }

    fetchData() {
        this.nowend = new Date((this.nowstart));
        this.nowstart = new Date(this.nowstart.getTime() - 31 * 24 * 3600 * 1000);
        let utcEnd = Util.getUTCTime(this.nowend);
        let end = Util.getTime(this.nowend);
        let start = Util.getTime(this.nowstart);
        let offset = new Date().getTimezoneOffset() * 60;
        return this.http.post(GlobalService.centerApi["getChainAvenueList"].url, {
            start_date: start,
            end_date: end,
            addr: this.coinbase,
            offset_time: offset
        });
    }

    
    getMiningData() {
        this.loading = true;
    	this.fetchData()
        .then(res => {
            this.loading = false;
            if(res.err_no === 0) {
                GlobalService.consoleLog("获取收益成功");
                var dayInfo = res.day_info || [];
                var avenueData = this.avenueMap;
                let base = GlobalService.CoinDecimalBlockchain;
                for(var i = 0, len = dayInfo.length; i < len; i++) {
                    var dateInfo;
                    dateInfo = (dayInfo[i].date || '').split('-');
                	var key = dateInfo[0] + "-" + ('00' + dateInfo[1]).slice(-2);
                	if(!avenueData[key]) {
                		avenueData[key] = [];
                    }
                    avenueData[key].push({
                        showdetail: false,
                        date: dateInfo.join('-'),
                        earn: this.util.cutFloat(dayInfo[i].earn / base, 2),
                        detaillist: []
                    })
                }
                if(this.nowstart.getTime() > this.start){
                    this.getMiningData();
                } else {
                    var myAvenueData = Object.keys(avenueData).map((k) => { 
                        GlobalService.consoleLog(avenueData[k]);
                        return { 
                            key: k, 
                            value: avenueData[k].reverse()
                        } 
                    }).reverse();                
                    this.avenueData = myAvenueData; 
                }
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.avenueData = [];
        })
    }
    fetchDetailData(dayInfo) {
        let start = Util.getTime(dayInfo.date);
        GlobalService.consoleLog("详情请求的开始时间" + start);
        let offset = new Date().getTimezoneOffset() * 60;
        return this.http.post(GlobalService.centerApi["getChainMiningListByDate"].url, {
            start_date: start,
            end_date: start,
            addr: this.coinbase,
            offset_time: offset
        });
    }
    seeMiningDetailList(dayInfo){
        if(dayInfo.detaillist.length != 0){
            return false;
        }
    	this.fetchDetailData(dayInfo)
        .then(res => {
            if(res.err_no == 0){
                for(let i = 0, len = res.blocks.length; i < len; i++) {
                    res.blocks[i].timestamp = Util.getLocalTime(res.blocks[i].timestamp * 1000, '-');
                    res.blocks[i].earn = this.util.cutFloat((parseInt(res.blocks[i].block_reward) + parseInt(res.blocks[i].block_fees)) / GlobalService.CoinDecimalBlockchain, 2),
                    dayInfo.detaillist.push(res.blocks[i]);
                }
                dayInfo.detaillist.reverse();
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
    }
}
