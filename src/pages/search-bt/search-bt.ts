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
    isFocus: boolean = false;
    isShowLoad: boolean = false;
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

    goBtDetailPage(id) {
        console.log("go BtDetailPage");
        this.navCtrl.push(BtDetailPage, {
            type: 'search',
            id: id
        });
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

    searchList(key = null, refresh = false) {
        if(this.loading == true) {
            return false;
        }
        if(this.isShowLoad == true) {
            this.global.createGlobalLoading(this, {
                message: Lang.L('Loading')
            });
            this.isShowLoad = false;
            setTimeout(() => {
                this.global.closeGlobalLoading(this);
            },2000)
        }
        this.loading = true;
        var url = GlobalService.centerApi["getSearchList"].url;
        let keyword = key || this.inputValue;
        this.inputValue = keyword.replace(/\s+/g,"");
        if(this.inputValue == '') {
            return false;
        }
        if(this.searchKeyList.indexOf(this.inputValue) > -1) {
            this.searchKeyList.splice(this.searchKeyList.indexOf(this.inputValue), 1);
        }
        this.searchKeyList.unshift(this.inputValue);
        console.log(JSON.stringify(this.searchKeyList));
        if(this.searchKeyList.length > 10) {
            this.searchKeyList = this.searchKeyList.slice(0,10);
        }
        let obj: any = {
            keyword: this.inputValue
        };
        if(key && !refresh) {
            obj.session = this.session;
            obj.action = "donext";
        }
        this.http.post(url, obj)
        .then((res) => {
            if (res.err_no === 0) { 
                this.session = res.session;
                let hash = {}; 
                let list = res.list || [];
                if(key && !refresh) {
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
        this.storage.remove('searchKeyList');
    }

    clearKey() {
        this.inputValue = '';
    }
    refreshFeedList(infiniteScroll) {
        GlobalService.consoleLog("上滑加载")
        this.searchList(this.inputValue);
        infiniteScroll.complete();     
    }

    downloadBt(item) {
        console.log("download" + item.mgurl)
        if(item.status && item.status == 1) {
            return false;
        }
        item.status = 1;
        this.global.createGlobalAlert(this, {
            title: Lang.L('DownloadFile'),
            message: item.title,
            // enableBackdropDismiss: false,
            buttons: [
                {
                    text: Lang.L('Download'),
                    handler: data => {
                        let url = item.mgurl + '&dn=' + item.title;
                        this.util.downloadBt(url, item.resid)
                        .then(res => {
                            console.log("正在下载bt")
                        })
                        return true;
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.handleBack();
                    }
                },
            ]
        })
    }
}
