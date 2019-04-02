import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { WalletCoinbasePage } from '../wallet-coinbase/wallet-coinbase';
import { DeviceManagementPage } from '../device-management/device-management';
import { DeviceListPage } from '../device-list/device-list';
import { MiningSettingPage } from '../mining-setting/mining-setting';
import { WalletSelectPage } from '../wallet-select/wallet-select';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import { CheckUpdate } from '../../providers/CheckUpdate';
/**
 * Generated class for the AboutDevicePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-about-device',
    templateUrl: 'about-device.html',
})

export class AboutDevicePage {
	ifMining:Boolean = false;
	coinbase:any = "";
	deviceName:any = "";
	deviceType:any = "";
	diskType:any = "";
	leftStorage:any = "";
	totalStorage:any = "";
	version:any = "";
	boxId:any = "";
	firstChange:any = true;

    constructor(public navCtrl: NavController,
        private global: GlobalService,
        private http: HttpService,
        private util: Util,
        private checkUpdate: CheckUpdate,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad AboutDevicePage!!!');
        var box = this.global.deviceSelected;
        if(!box) {
	       	this.global.createGlobalAlert(this, {
	            title: Lang.L("WORD59b0d149"),
	            message: Lang.L("WORDe6e1739b"),
	            buttons: [
	                {
	                    text: Lang.L("WORD0cde60d1"),
	                    handler: data => {
	                        this.navCtrl.push(DeviceListPage, {
                                refresh: false
                            });
	                    }
                    },
                    {
	                    text: Lang.L("WORD621202ef"),
	                    handler: data => {
	                        GlobalService.consoleLog('Cancel clicked');
	                        this.navCtrl.pop();
	                    }
	                },
	            ]
	        })
        } else {
        	var userInfo = this.global.boxUserInfo;
        	var diskInfo = this.global.diskInfo;

        	this.boxId = userInfo.boxId;
        	this.deviceName = box.friendlyName;
            this.ifMining = !!userInfo.share_switch;
            this.deviceType = box.deviceType;            
        	var disk = diskInfo.disks ? diskInfo.disks[0] : {};
        	this.diskType = disk.type || Lang.L("WORDe008139a");
        	this.totalStorage = Math.floor(disk.total / GlobalService.DISK_G_BITS)
        	this.leftStorage = Math.floor((disk.total - disk.usage) / GlobalService.DISK_G_BITS);
            this.version = box.version;
            this.util.getCoinbase()
            .then(res => {
                this.coinbase = res.coinbase;
            })
        }
        
    }

    rebootDevice() {
        this.util.rebootDevice(this);
    }

    unbindDevice() {
        this.util.unbindBox(this, this.boxId, ()=>{
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORDab667a91'),
                message: Lang.L('WORDe6e1739b'),
                buttons: [
                    
                    {
                        text: Lang.L('WORD0cde60d1'),
                        handler: data => {
                            this.navCtrl.push(DeviceListPage, {
                                refresh: true
                            });
                        }
                    },
                    {
                        text: Lang.L('NotBind'),
                        handler: data => {
                            this.navCtrl.pop();
                        }
                    },
                ]
            }) 
        })
    }

    goDeviceManagementPage() {
    	this.navCtrl.push(DeviceManagementPage);
    }

    copyNumber() {
        this.util.copyInfo(this.boxId)
        .then(res => {
            this.global.createGlobalToast(this, {
                message: Lang.L('CopySucceed')
            })
        })
    }

    copyType() {
        this.util.copyInfo(this.deviceType)
        .then(res => {
            this.global.createGlobalToast(this, {
                message: Lang.L('CopySucceed')
            })
        })
    }

    updateRom() {
        // this.checkUpdate.checkIfNewestVersion((finish, total) => {
        //     console.log("下载进度:" + finish +  ",总大小:" + total)
        // })
    }

    updateRom1() {
        this.global.createGlobalLoading(this, {
            message: Lang.L("getRomUpdate")
        });
        this.checkUpdate.updateRom({
            dialog: true
        })
        .then((res:any) => {
            if(res.type === 'optional') {
                 this.global.createGlobalAlert(this, {
                    title: Lang.L('updateDetected'),
                    message: Lang.Lf('updateTips', res.data.dstVer),
                    buttons: [
                        {
                            text: Lang.L("Update"),
                            handler: data => {
                                GlobalService.consoleLog("升级固件:" + res.data.dstVer + "," + res.data.signature);
                                return new Promise((resolve, reject) => {
                                    return this.checkUpdate.updateRomIndeed(res.data.dstVer, res.data.signature, resolve, reject);
                                })
                                .then(ver => {
                                    GlobalService.consoleLog("升级完成:" + ver);
                                })
                                .catch(e => {
                                    GlobalService.consoleLog("升级异常：" + e.stack);
                                })
                            }
                        },   
                        {
                            text: Lang.L("Cancel"),
                            handler: data => {
                                // reject();
                                GlobalService.consoleLog("用户拒绝升级");
                            }
                        },                         
                    ]
                })                 
            } else if(res.type === 'newest') {
                this.global.createGlobalToast(this, {
                    message: Lang.L('NewestVersion')
                })
            }
        }, res => {
            this.global.createGlobalToast(this, {
                message: Lang.L('NewestVersion')
            })              
        })
          .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.global.closeGlobalLoading(this);
          })

    }
}
