import { Component } from '@angular/core';
import { NavController, NavParams,IonicApp } from 'ionic-angular';

import { LoginPage } from "../login/login";
import { TabsPage } from "../tabs/tabs";
import { GlobalService } from "../../providers/GlobalService";
import { Util } from "../../providers/Util";

import { HttpService } from "../../providers/HttpService";
import { CheckUpdate } from "../../providers/CheckUpdate";
import { Md5 } from "ts-md5/dist/md5";
import xml2js from 'xml2js';
import { Lang } from '../../providers/Language';
import { Events, Nav, Platform, App } from 'ionic-angular';
import { ClickAndWaitDirective } from '../../directives/click-and-wait/click-and-wait'
/**
 * Generated class for the DevicelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var serviceDiscovery;
@Component({
    selector: 'page-device-list',
    templateUrl: 'device-list.html',
})
export class DeviceListPage {
    public deviceList: any = [];
    private scanning: Boolean = false;
    private progress = 0;
    private interval:any = null;
    private searched:any = false;
    private SetTimeOutNameOne:any;
    private SetTimeOutNameTwo:any;
    private isClicked:any = false;
    username: any = "";
    password: any = "";
    refresh: boolean = false;
    constructor(
        public navCtrl: NavController,
        public platform: Platform,
        public http: HttpService,
        private lang: Lang,
        private app: App,
        private events: Events,
        private checkUpdate: CheckUpdate,
        private global: GlobalService,
        private util: Util,
        // private loadingCtrl: LoadingController,
        public navParams: NavParams
    ) {
        GlobalService.consoleLog("开始发现页构造");

        platform.ready().then(() => {
            if (platform.is('cordova')) {
                GlobalService.consoleLog("开始发现盒子");
                if(!this.global.foundDeviceList.length && !this.refresh) {
                    this.searchUbbeyBox();                    
                }
            } else {
                this.deviceList = [{"boxId":"UBOXV10014294708667138ec","bindUser":"ho**o@hotmail.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV10014294708667138ec","version":"1.2.3","URLBase":["192.168.0.54:37867"],"bindUserHash":"842fa767457ee4e500aa3965467b4d4c"},{"boxId":"UBOXV1001885167250487f65","bindUser":"10**2@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001885167250487f65","version":"1.2.3","URLBase":["192.168.0.42:37867"],"bindUserHash":"56f25028a9718d0f06ed6167e7783dbe"},{"boxId":"UBOXV10010390521016732a7","bindUser":"iq**0@163.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV10010390521016732a7","version":"1.2.3","URLBase":["192.168.0.17:37867"],"bindUserHash":"0e3191ae3d8e0e48fc44a277fefb55fe"},{"boxId":"UBOXV1001548593547181270","bindUser":"1****@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001548593547181270","version":"1.2.3","URLBase":["192.168.0.12:37867"],"bindUserHash":"d615d5793929e8c7d70eab5f00f7f5f1"},{"boxId":"UBOXV1001936700425858b84","bindUser":"we**u@yqtc.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001936700425858b84","version":"1.2.3","URLBase":["192.168.0.46:37867"],"bindUserHash":"1f5261c7b51fe39a5169265909b96f8b"},{"boxId":"UBOXV100190154614900562d","bindUser":"3****@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV100190154614900562d","version":"1.2.3","URLBase":["192.168.0.7:37867"],"bindUserHash":"69938a60b5519a50e76d597f4386f0c9"},{"boxId":"UBOXV1001799091145690066","bindUser":"61**7@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001799091145690066","version":"1.2.3","URLBase":["192.168.0.37:37867"],"bindUserHash":"fad2e4e1cf6b97113521c9b1f9a4a692"},{"boxId":"UBOXV1001566112576196c10","bindUser":"ho**c@126.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001566112576196c10","version":"1.2.3","URLBase":["192.168.0.26:37867"],"bindUserHash":"e4df2d363e002eeb1baf286763f7450b"},{"boxId":"UBOXV1001829658683969548","bindUser":"zh**i@yqtc.com","friendlyName":"32","manufacturer":"23","manufacturerURL":"23","deviceType":"UBOXV1001829658683969548","version":"1.3.0","URLBase":["192.168.0.30:37867"],"bindUserHash":"fad5425d5a71091cbe01fd6cdc978123"},{"boxId":"UBOXV1001365382808113e32","bindUser":"46**1@qq.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001365382808113e32","version":"1.2.3","URLBase":["192.168.0.11:37867"],"bindUserHash":"2ccdb8a5df91fbb4069978c2098637c7"},{"boxId":"UBOXV1001959186708495d5e","bindUser":"li**u@yqtc.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV1001959186708495d5e","version":"1.2.3","URLBase":["192.168.0.51:37867"],"bindUserHash":"45f4d2cf6b45ffc0ccf2956b3b99617a"},{"boxId":"UBOXV10014304231654448d8","bindUser":"xi**i@yqtc.com","friendlyName":"UB1400Y","manufacturer":"YQTC company","manufacturerURL":"https://www.yqtc.co","deviceType":"UBOXV10014304231654448d8","version":"1.2.3","URLBase":["192.168.0.55:37867"],"bindUserHash":"63efa05526f5263ce8f45aa38761dfea"}]
            }
        });
    }
    
    ionViewDidEnter() {
        GlobalService.consoleLog("进入发现列表页");
        this.refresh = this.navParams.get('refresh') || false;
        if(!this.global.userLoginInfo) {
            console.log("this.global.user");
            this.util.getUserList()
            .then(res => {
                if(this.global.userLoginInfo){
                    this.username = this.global.userLoginInfo.username;
                    this.password = this.global.userLoginInfo.password;
                }
            }) 
        } else {
            this.username = this.global.userLoginInfo.username;
            this.password = this.global.userLoginInfo.password;
        }
        // this.getVersionControl();
        if (this.platform.is('cordova')) {
            if (this.global.foundDeviceList.length && !this.refresh) {
                GlobalService.consoleLog("已经不用再次扫描了");
                this.deviceList = this.global.foundDeviceList;
            } else {
                if(!this.searched) {
                    GlobalService.consoleLog("非搜索状态，可以搜索");
                    this.searchUbbeyBox();
                } else {
                    GlobalService.consoleLog("已经开始发现服务，不重复触发");
                }
            }
        } 
    }

    ionViewWillLeave() {
        GlobalService.consoleLog("清除已发现状态");
        this.stopScan();
        console.log('离开了devicelist页面')
    }

    stopScan() {
        GlobalService.consoleLog("用户触发停止扫描");
        this.scanning = false;
        this.searched = false;
        this.clearTimeOutName();
        console.log("清楚定时器成功..");
    }

    computeNetworkInfo() {
        let global = this.global;
        if(global.networkType === 'wifi' && !!global.wifiName) {
            return global.Lf("YourWifi", global.wifiName);
        } else if(global.networkType != 'none' && global.networkType != 'unknown' && global.networkType != '') {
            return global.Lf("YourNetworkType", global.networkType);
        } else if((global.networkType === '' || global.networkType === 'none') && global.wifiName==='') {
            return global.Lf("YourNetworkOffline");
        } else {
            return '';
        }
    }

    goBack() {
        this.navCtrl.pop();
    }

    clearTimeOutName(){
        if(this.SetTimeOutNameOne){
            clearTimeout(this.SetTimeOutNameOne);
            this.SetTimeOutNameOne = null;
        }
        if(this.SetTimeOutNameTwo){
            clearTimeout(this.SetTimeOutNameTwo);
            this.SetTimeOutNameTwo = null;
        }
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    listenUbbeyBox() {
        GlobalService.consoleLog("发现超时检测,触发UI更新")
        var interval = setInterval(() => {
            if (this.scanning === false) {
                this.searched = false;
                this.clearTimeOutName();
                clearInterval(interval);
                interval = null;
            }
        }, 200);

        this.SetTimeOutNameTwo = setTimeout(() => {
            // if (this.scanning) {
            //     this.global.createGlobalToast(this, {
            //         message: Lang.L('WORDf824108c')
            //     })
            // }
            if (interval) {
                GlobalService.consoleLog("发现超时!!!");
                clearInterval(interval);
                interval = null;
            } 
            this.searched = false;
            this.scanning = false;
            this.clearTimeOutName();
        }, 20000);
    }

    searchUbbeyBox() {
        GlobalService.consoleLog("调用发现服务！");
        this.clearTimeOutName();
        if(!this.platform.is('cordova')) {
            return false;
        }
        // this.clearTimeOutName();        
        GlobalService.consoleLog(this.scanning + "是否正在扫描scanning");
        GlobalService.consoleLog(this.searched + "是否正在扫描searched");
        if(this.searched === true) {
            GlobalService.consoleLog("闪屏关闭");
            return false;
        } else {
           this.searched = true;
        }

        var self = this;
        var start = Date.now();
        this.progress = 0;
        this.scanning = true;

        GlobalService.consoleLog("注册定时器");
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.interval = setInterval(() => {
            this.progress = Math.min(99, this.progress + 1);
        }, 200);

        this.util.searchUbbey()
        .then(res => {
            GlobalService.consoleLog("发现接口成功回调");
            // if(!self.scanning) {
            //     GlobalService.consoleLog("用户手动中止，不处理结果");
            //     return false;
            // }
            self.deviceList = res;
            var delay = 6000 - (Date.now() - start);
            self.SetTimeOutNameOne = setTimeout(() => {
                self.progress = 100;
                GlobalService.consoleLog("搜索成功，修改scanning状态！");
                self.scanning = false;
                self.searched = false;
                self.clearTimeOutName();
                clearInterval(this.interval);
                self.interval = null;
            }, delay);
        })
        .catch(e => {
            GlobalService.consoleLog("Error calling Service Discovery Plugin");
            self.progress = 100;
            self.scanning = false;
            self.searched = false;            
            self.clearTimeOutName();
            clearInterval(self.interval);
            self.interval = null;
        })

        this.listenUbbeyBox();
        return true;
    }

    gotoBinding(dv) {
        if(this.isClicked == true){
            return false;
        }
        this.isClicked = true;
        setTimeout(()=> {
            this.isClicked = false;
        },5000)
        this.global.deviceSelected = dv;
        
        GlobalService.consoleLog("用户选择盒子:" + JSON.stringify(dv));
        this.global.useWebrtc = false;
        this.global.resetWebrtc('box');
        this.checkBindBox(dv);
        // this.checkUpdate.updateRom({
        //     dialog: false
        // }).then((res: any) => {
        //     GlobalService.consoleLog("检查升级");
        //     this.updateCallback(dv);
        // })
        // .catch(e => {
        //     this.updateCallback(dv);
        // })
        // this.updateCallback(dv);
        //如果盒子版本号是1.0.1，则需要调用检查盒子版本接口
        // if(dv.version === '1.0.1' || dv.version === '1.0.2') {
        //     let url = this.setUpdateRomUrl(this.global.getBoxApi('checkRomUpdate'));
        //     this.http.post(url, {}, false);
        // }
    }

    checkBindBox(dv) {
        GlobalService.consoleLog("开始校验盒子登录态，登录则直接进入首页，否则进入登录页");
        GlobalService.consoleLog(JSON.stringify(this.global.deviceSelected));
        console.log("this.global.userLoginInfo  " + JSON.stringify(this.global.userLoginInfo));
        if (!dv.bindUser) {
            GlobalService.consoleLog("盒子未绑定用户，直接绑定");
            this.global.createGlobalLoading(this, {
                message: this.global.L('Loading')
            })
            this.util.bindBox(this)
            .then((res) => {
                console.log("绑定流程已完成....");
                this.global.closeGlobalLoading(this);
                if(res) {
                    console.log("绑定成功.....");
                    this.navCtrl.push(TabsPage)
                    .then(() => {
                        this.isClicked = false;
                        this.global.createGlobalToast(this, {
                            message: Lang.L('BindSuccess')
                        })
                    })                    
                } else {
                    //绑定失败。。。。。
                    console.log("绑定失败....");
                }
            })
            .catch(e => {
                console.log("钱包绑定失败....");
            })
        } else {
            this.global.createGlobalToast(this, {
                message: Lang.L('BoxHasBind')
            })
            this.isClicked = false;
        }
    }


    updateCallback(dv){
        GlobalService.consoleLog("开始校验盒子登录态，登录则直接进入首页，否则进入登录页");
        GlobalService.consoleLog(JSON.stringify(this.global.deviceSelected));
        var uname = this.global.centerUserInfo.uname;
        if (!dv.bindUser) {
            GlobalService.consoleLog("盒子未绑定用户，直接去登录页");
            this.navCtrl.push(LoginPage)
            .then(() => {
                this.isClicked = false;
            })
        } else if(uname && (dv.bindUserHash != Md5.hashStr(uname.toLowerCase()).toString())) {
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD46ed4d8e'),
                message: Lang.L('WORDd0b25fa3'),
                buttons: [
                    {
                        text: Lang.L('WORD85ceea04'),
                        handler: data => {
                            this.isClicked = false;
                        }
                    },
                    {
                        text: Lang.L('WORD1b9bba37'),
                        handler: data => {
                            this.global.centerUserInfo = {};
                            this.navCtrl.push(LoginPage)
                            .then(() => {
                                this.isClicked = false;
                            })
                        }
                    }
                ]
            })
        } else {
            GlobalService.consoleLog("盒子已经被绑定，检验当前是否有登录态；如果已登录则直接去首页");
            this.http.post(this.global.getBoxApi("getUserInfo"), {}, false)
            .then((res) => {
                if (res.err_no === 0) {
                    GlobalService.consoleLog("拉取中心登录态");
                    this.global.boxUserInfo = res.userinfo;
                    this.http.post(GlobalService.centerApi["getUserInfo"].url, {}, false)
                    .then(
                        (r) => {
                            if (r.err_no === 0) {
                                this.global.centerUserInfo = r.user_info;
                                if(this.global.boxUserInfo.username.toLowerCase() !== r.user_info.uname.toLowerCase()) {
                                    //this.events.publish('token:expired');
                                    this.util.logoutCenter(null);
                                }
                            }
                        }
                    );

                    this.navCtrl.push(TabsPage)
                    .then(() => {
                        this.isClicked = false;
                    })
                } else {
                    this.navCtrl.push(LoginPage)
                    .then(() => {
                        this.isClicked = false;
                    })
                }
            })
            .catch(e => {
                this.isClicked = false;
            })
        }
        return true;
    }

    goLoginPage() {
        GlobalService.consoleLog("直接登录，未设置盒子信息");
        this.global.deviceSelected = null;
        this.global.useWebrtc = true;
        this.navCtrl.push(LoginPage)
        .then(() => {
            this.isClicked = false;
            console.log("取消按钮点击保护");
        })
        // this.http.post(GlobalService.centerApi["getUserInfo"].url, {}, false)
        // .then(
        //     (res) => {
        //         if (res.err_no === 0) {
        //             this.global.centerUserInfo = res.user_info;
        //             this.navCtrl.push(TabsPage)
        //              .then(() => {
        //               const startIndex = this.navCtrl.getActive().index;
        //               this.navCtrl.remove(0, startIndex);
        //             });
        //         } else {
        //             this.navCtrl.push(LoginPage, {
        //                 clearCookie: true
        //             });
        //         }
        //     }
        // )
    }

}
