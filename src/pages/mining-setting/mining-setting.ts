import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { DeviceListPage } from '../device-list/device-list';
import { WalletCoinbasePage } from '../wallet-coinbase/wallet-coinbase';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import { WalletGeneratorPage } from '../wallet-generator/wallet-generator';
/**
 * Generated class for the MiningSettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-mining-setting',
    templateUrl: 'mining-setting.html',
})
export class MiningSettingPage {
    brightness: any = 0;
    // coinbase:any = "";
    totalSize:any = 0;
    ifMining:any = false;
    maxRange:any = 100;
    minRange:any = 1;
    chainType:string = "ERC20";
    oldShareSize:any = 0;
	coinbase:string;

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private events: Events,
        public navParams: NavParams) {
            this.events.subscribe('coinbase:change', (res) => {
				this.coinbase = res.coinbase;
                this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
                if(this.chainType === 'ERC20') {
                    this.global.deviceSelected && (this.global.deviceSelected.coinbase = res.coinbase);
                }
            });
    }

    setCoinbase() {
        this.navCtrl.push(WalletCoinbasePage,{
            shareSize: this.navParams.get('shareSize'),
            coinbase: this.coinbase,
        });
	}

	selectCoinbase(addr) {
		this.coinbase = addr;
	}
	
	goCreateWalletPage() {
		this.navCtrl.push(WalletGeneratorPage);
	}


    saveModify() {
        if(!this.coinbase && this.ifMining) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORD3a536642')
            })
            return false;
        }
        
        // var storage = Math.max(1, Math.floor(Math.min(this.brightness, this.maxRange) / 100 * this.totalSize)) * GlobalService.DISK_G_BITS;     
        var storage = this.computeShareSize() * GlobalService.DISK_G_BITS;
        this.util.toggleIfMining({chainType: this.chainType, ifMining: this.ifMining, oldSize: parseInt(this.oldShareSize) * GlobalService.DISK_G_BITS, newSize: storage})
        .then(res => {
            if(res.err_no === 0) {
                this.global.createGlobalToast(this, {
                    message: Lang.L('WORD5e6d7a09'),
                })

                GlobalService.consoleLog("更新盒子数据");
                this.http.post(this.global.getBoxApi('getUserInfo'), {}, false)
                .then((res) => {
                    this.global.boxUserInfo = res.userinfo;
                })
                if(this.chainType === 'ERC20') {
                    this.global.centerUserInfo.mining = this.ifMining;
                }
                this.events.publish('mining:change', {
                    ifMining: this.ifMining,
                    storage: storage
                });

                setTimeout(()=>{
                    this.navCtrl.pop();
                }, 100)
            } else {
                throw new Error('Save info failed');
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.global.closeGlobalLoading(this);
            this.ifMining = !this.ifMining;
        })
    }

    ionViewDidLoad() {
        this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        var boxInfo = this.global.boxInfo;
        this.ifMining = !!this.global.boxUserInfo.share_switch;
        GlobalService.consoleLog('ionViewDidLoad MiningSettingPage');
        if(!this.coinbase){
            this.coinbase = this.navParams.get('coinbase');
		}

        if (!!this.global.deviceSelected) {
            GlobalService.consoleLog("已选择盒子");
            var shareSize = 0;
            var size = 0;
            var disk = this.global.diskInfo.disks && this.global.diskInfo.disks[0] || {};
            size = Math.floor((disk.size - disk.used) / GlobalService.DISK_G_BITS);            
            shareSize = +this.navParams.get('shareSize') || 0;
            this.ifMining = this.navParams.get('ifMining');
            this.oldShareSize = shareSize;
            this.totalSize = size;
            if(this.chainType != 'ERC20') {
                this.totalSize += Math.floor(this.global.shareFileProduced / GlobalService.DISK_G_BITS);
            }            
            if(this.totalSize > 1500) {
                this.totalSize = 1500;
            } else if(this.totalSize > 800) {
                this.totalSize = 800;
            } 
            this.brightness = shareSize / this.totalSize  * 100;
            //this.maxRange =  this.totalSize > 1000 ? Math.min(100, 150000.0 / this.totalSize) : Math.min(100, 80000.0 / this.totalSize);
            GlobalService.consoleLog("分享大小: " + shareSize);
            GlobalService.consoleLog("总比例: " + this.maxRange)
            GlobalService.consoleLog("总大小：" + this.totalSize);
        } else {
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD83fddc65'),
                message: Lang.L('WORDc9659c05'),
                buttons: [
                    {
                        text: Lang.L('WORD0cde60d1'),
                        handler: data => {
                            this.navCtrl.push(DeviceListPage, {
                                refresh: false
                            });
                        }
                    },
                    {
                        text: Lang.L('WORD621202ef'),
                        handler: data => {
                            this.navCtrl.pop();
                        }
                    },
                ]
            })
        }
    }

    computeShareSize() {
        if(this.brightness === 1) {
            return 1;
        } else {
            return Math.min(this.totalSize, Math.max(1, +(this.brightness / 100 * this.totalSize).toFixed(0)));
        }
    }
}
