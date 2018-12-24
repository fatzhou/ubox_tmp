import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';
/**
 * Generated class for the MiningListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-mining-list',
    templateUrl: 'mining-list.html',
})
export class MiningListPage {
    avenueData:any = [];
    avenueMap:any = {};
    coinbase:string = "";
    loading = true; //是否正在获取数据
    chainType:any;
    constructor(public navCtrl: NavController, 
                private global: GlobalService,
                private http: HttpService,
                private util: Util,
    			public navParams: NavParams) {}

    ionViewDidEnter() {
        GlobalService.consoleLog('ionViewDidLoad MiningListPage');
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
        let start = "2017-01-01 00:00:00";
        let yesterday = new Date(new Date().setDate((new Date().getDate() - 1)));
        let utcEnd = Util.getUTCTime(yesterday);
        let end = Util.getTime(yesterday);
        let offset = new Date().getTimezoneOffset() * 60;
        return this.http.post(GlobalService.centerApi["getAvenueList"].url, {
            start_date: start,
            end_date: end
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
                let base = GlobalService.CoinDecimal;
                for(var i = 0, len = dayInfo.length; i < len; i++) {
                    var dateInfo;
                    dateInfo = (dayInfo[i].date || '').split('-');
                	var key = dateInfo[0] + "-" + ('00' + dateInfo[1]).slice(-2);
                	if(!avenueData[key]) {
                		avenueData[key] = [];
                    }
                    avenueData[key].push({
                        date: dateInfo.join('-'),
                        earn: this.util.cutFloat(dayInfo[i].earn / base, 2)
                    })
                }
                var myAvenueData = Object.keys(avenueData).map((k) => { 
                    return { 
                        key: k, 
                        value: avenueData[k].reverse()
                    } 
                }).reverse();                
                this.avenueData = myAvenueData;                    
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.avenueData = [];
        })
    }

    seeMoreList(){
        this.getMiningData();
    }
}
