import { Component } from '@angular/core';
import { NavController, NavParams, ItemContent } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';
import { UappPlatform } from "../../providers/UappPlatform";

import { AboutDevicePage } from '../about-device/about-device';
import { AppDetailPage } from '../app-detail/app-detail';
import { LoginPage } from '../login/login';
import { AppsInstalled } from '../../providers/AppsInstalled';
import { InternalFormsSharedModule } from '@angular/forms/src/directives';

/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-search',
    templateUrl: 'search.html',
})
export class SearchPage {
    labelList: any = {};
    bannerStyle: any = {};
    appList: any = {};//全部的应用列表
    showList: any = [];//需要展示的应用列表
    bannerList: any = [];//需要展示的banner列表
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private events: Events,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private uappPlatform: UappPlatform,
        private appsInstalled: AppsInstalled,
        private app: App) {
            events.unsubscribe('language:change');
            events.subscribe('language:change', () => {
                console.log("语言变更")
                this.showList = this.global.SearchData.appList[GlobalService.applang];
                let bannerList = this.global.SearchData.bannerList;
                this.bannerList = [];
                if(this.showList.length != 0) {
                    for(let i = 0;i < this.showList.length; i++) {
                        for(let j = 0; j < bannerList.length; j++) {
                            if(this.showList[i].id == bannerList[j]) {
                                this.bannerList.push(this.showList[i]);
                            }
                        }
                    }
                }
            })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SearchPage');
        if(!this.bannerList.length) {
            this.getSearchData()
            .then((res)=> {
                // console.log(JSON.stringify(res));
                this.showList = this.global.SearchData.appList[GlobalService.applang];
                this.labelList = this.global.SearchData.labelList;
                this.bannerStyle = this.global.SearchData.bannerStyle;
                let bannerList = this.global.SearchData.bannerList;
                if(this.showList.length != 0) {
                    for(let i = 0;i < this.showList.length; i++) {
                        for(let j = 0; j < bannerList.length; j++) {
                            if(this.showList[i].id == bannerList[j]) {
                                this.bannerList.push(this.showList[i]);
                            }
                        }
                    }
                }
                // console.log('this.bannerList' + JSON.stringify(this.bannerList))
            })
        }
    }

    openApp(item) {
        if(item.type === 0) {
            //网页应用，直接打开
            this.util.openUrl(item.xml);
        } else {
            if(item.box) {
                //依赖盒子，但是没有盒子
                if(!this.global.centerUserInfo.bind_box_count) {
                    this.global.createGlobalToast(this, {
                        message: this.global.L('BindBoxFirst')
                    })
                    return false;                    
                } else if(!this.global.deviceSelected) {
                    this.global.createGlobalToast(this, {
                        message: this.global.L('BoxOffline')
                    })
                    return false;                     
                }
            }
            //下载安装
            if(this.appsInstalled.uappInstalled[item.id]) {
                //已安装
                this.uappPlatform.openApp(item.id);
            } else {
                //安装中则直接返回
                if(item.progress === undefined) {
                    item.progress = 1;
                    //尚未安装
                    this.appsInstalled.installUapp({
                        id: item.id,
                        xml: item.xml,
                        type: item.type,
                        box: item.box,
                        enter: item.enter,
                        version: item.version
                    }, (res) => {
                        console.log("安装进度：" + JSON.stringify(res));
                        let processProgress = this.util.getUappProgress(item, res);
                        this.goProgress(item, processProgress);
                    })    
                    .then(res => {
                        //安装完成.....
                        console.log("APP已安装成功.......");
                        this.global.createGlobalToast(this, {
                            message: this.global.Lf('UappInstallSucceed', item.title)
                        })
                    })    
                    .catch(e => {
                        item.progress = undefined;
                    })            
                }

            }
        }
    }

    goProgress(item, p) {
        if(item.progress < p) {
            //清除上一次未完成的定时器
            if(item.interval) {
                clearInterval(item.interval);
                item.interval = null;
            }
            item.interval = setInterval(() => {
                item.progress++;
                if(item.progress >= p) {
                    clearInterval(item.interval);
                    item.interval = null;
                }
            }, 100);
        }
    }

    goAppDetail(info) {
        this.app.getRootNav().push(AppDetailPage,{
            "info": info
        });
    }    

    goLoginPage() {
        this.app.getRootNav().push(LoginPage);
    }

    showNetworkPopup() {
        this.events.publish('open-popup');
    }

    //远程获取配置
    getSearchData() {
        var that = this;
        var url = GlobalService.searchDataConfig[GlobalService.ENV];
        if(!this.global.SearchData){
            return this.http.get(url, {}, false)
            .then((res:any) => {
                if(typeof res === 'string') {
                    res = JSON.parse(res);
                }
                if(res) {
                    // console.log("search拿到了")
                    this.global.SearchData = res;
                }
                return res;
            })
            .catch(e => {
                GlobalService.consoleLog('版本配置赋值出错:' + e.stack);
            })
        } else {
            return Promise.resolve(this.global.SearchData);
        }
    }

    goAboutDevice() {
        this.app.getRootNav().push(AboutDevicePage);
    }
}
