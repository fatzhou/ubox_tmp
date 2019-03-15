import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtDetailPage } from '../bt-detail/bt-detail';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

/**
 * Generated class for the SearchBtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-search-bt',
  templateUrl: 'search-bt.html',
})
export class SearchBtPage {
    searchFeedList: any = [];
    searchKeyList: any = [];
    inputValue: string = '';
    loading: boolean = false;
    session: string = '';
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        public storage: Storage) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchBtPage');
        this.getSearchKey();
    }

    ionViewWillLeave() {
        console.log("leave")
        this.setSearchKey();
    }

    goBtDetailPage() {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage);
    }

    goBack() {
        this.navCtrl.pop();
    }

    setSearchKey() {
        this.storage.set("searchKeyList", JSON.stringify(this.searchKeyList));
    }

    getSearchKey() {
        this.storage.get("searchKeyList")
        .then(res => {
            if(res) {
                console.log("res" + res)
                this.searchKeyList = JSON.parse(res);
                if(this.searchKeyList.length > 10) {
                    this.searchKeyList = this.searchKeyList.slice(0,10);
                }
            }
        });
    }

    searchList(key = null) {
        if(this.loading == true) {
            return false;
        }
        this.loading = true;
        var url = GlobalService.centerApi["getSearchList"].url;
        let keyword = key || this.inputValue;
        this.inputValue = keyword;
        if(!key) {
            this.searchKeyList.unshift(keyword);
        }
        console.log(JSON.stringify(this.searchKeyList));
        if(this.searchKeyList.length > 10) {
            this.searchKeyList = this.searchKeyList.slice(0,10);
        }
        let obj: any = {
            keyword: keyword
        };
        if(!key) {
            obj.session = this.session;
            obj.action = "donext";
        }
        this.http.post(url, obj)
        .then((res) => {
            if (res.err_no === 0) { 
                this.session = res.session;
                let hash = {}; 
                let list = res.list || [];
                if(key) {
                    this.searchFeedList = this.searchFeedList.concat(list);
                } else {
                    this.searchFeedList = list;
                }
                this.searchFeedList = this.searchFeedList.reduce((preVal, curVal) => {
                    hash[curVal.resid] ? '' : hash[curVal.resid] = true && preVal.push(curVal); 
                    return preVal 
                }, [])
                setTimeout(()=>{
                    this.loading = false;
                },500);
            }
        })
    }

    clearSearchKeys() {
        this.searchKeyList = [];
    }

    clearKey() {
        this.inputValue = '';
    }
    refreshFeedList(infiniteScroll) {
        GlobalService.consoleLog("上滑加载")
        this.searchList(this.inputValue);
        infiniteScroll.complete();     
    }

    downloadBt(url) {
        console.log("download" + url)
        this.util.downloadBt(url)
        .then(res => {
            console.log("正在下载bt")
        })
    }
}