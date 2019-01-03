import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { DeviceListPage } from '../device-list/device-list';
import { TabsPage } from '../tabs/tabs';
import { AboutDevicePage } from '../about-device/about-device';
import { Lang } from "../../providers/Language";
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the DeviceManagementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-device-management',
    templateUrl: 'device-management.html',
})
export class DeviceManagementPage {
	name:any = "";
	coinbase:any = "";
	ifMining:any = false;
	diskType:any = "HDD";
	diskStorage:any = "";
	boxId:any = "";
	chainType:string;
    constructor(public navCtrl: NavController, 
    			private global: GlobalService,
				private http: HttpService,
				private util: Util,
                private events: Events,
                private storage: Storage,
    			public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad DeviceManagementPage');
		var box = this.global.deviceSelected;
		this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        if(!box) {
            GlobalService.consoleLog("没连接盒子！");
	       	this.global.createGlobalAlert(this, {
	            title: Lang.L('WORD59b0d149'),
	            message: Lang.L('WORDe6e1739b'),
	            buttons: [{
	                    text: Lang.L('WORD621202ef'),
	                    handler: data => {
	                        GlobalService.consoleLog('Cancel clicked');
	                        this.navCtrl.pop();
	                    }
	                },
	                {
	                    text: Lang.L('WORD0cde60d1'),
	                    handler: data => {
	                        this.navCtrl.push(DeviceListPage, {
                                refresh: false
                            });
	                    }
	                }
	            ]
	        })
        } else {
            GlobalService.consoleLog("连接了盒子!");
        	var userInfo = this.global.boxUserInfo;
        	var diskInfo = this.global.diskInfo;
        	GlobalService.consoleLog(JSON.stringify(diskInfo))
        	this.boxId = userInfo.boxId;
			this.name = box.friendlyName;
			this.util.getCoinbase()
			.then(res => {
				this.coinbase = res.coinbase;
				this.ifMining = res.ifMining;
			})
			// if(this.navParams.get('if_mine')){
			// 	this.ifMining = this.navParams.get('if_mine');
			// } else {
			// 	this.ifMining = userInfo.ifMining;
			// }
        	var disk = diskInfo.disks && diskInfo.disks[0] || {};
            GlobalService.consoleLog("磁盘信息：" + JSON.stringify(disk))
        	this.diskType = disk.type || this.global.L('WORDe008139a');
        	this.diskStorage = Math.floor(disk.total / GlobalService.DISK_G_BITS) + 'GB/' + Math.floor((disk.total - disk.usage) / GlobalService.DISK_G_BITS) + 'GB';
        }
    }	

    goAboutDevicePage() {
    	this.navCtrl.push(AboutDevicePage);
    }

    setLoadingStatus() {
        this.global.createGlobalLoading(this, {
            message: Lang.L('FormatDiskLoading')
        });        
        var interval = setInterval(()=>{
            var url = this.global.getBoxApi('checkFormatStatus');
            this.http.post(url, {
            })  
            .then(res=>{
                if(res.status === 0) {
                    GlobalService.consoleLog("格式化完成");
                    this.global.loadingCtrl.dismiss();
                    this.global.fileTaskList = [];
                    this.storage.remove('fileTaskList');
                    if(interval) {
                       this.global.createGlobalToast(this, {
                            message: Lang.L('FormatFinished')
                        });
                        clearInterval(interval);
                        interval = null;                        
                    }
                } else {
                    GlobalService.consoleLog("仍然在格式化");
                }
            })
        }, 500)
    }

    rebootDevice() {
        this.util.rebootDevice(this);
    }

    formatDisk() {
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD652905a6'),
            message: Lang.L('WORDcc4cfe3d'),
            buttons: [
                {
                    text: Lang.L('WORD95d39fcd'),
                    handler: data => {
						var url = this.global.getBoxApi('formatBox');
						this.http.post(url, {
				    		diskname: (this.global.diskInfo.disks[0] || {}).name
				    	}) 
				    	.then(res => {
				    		if(res.err_no === 0) {
					            // this.global.createGlobalAlert(this, {
					            //     title: Lang.L('WORDaa10600b'),
					            //     message: Lang.L('WORDbe8f94ca'),
					            //     buttons: [
					            //         {
					            //             text: Lang.L('WORDd6291d38'),
					            //             handler: data => {
					            //                 this.navCtrl.push(TabsPage)
                 //                                .then(() => {
                 //                                  const startIndex = this.navCtrl.getActive().index;
                 //                                  GlobalService.consoleLog("即将删除历史记录：" + startIndex);
                 //                                  this.navCtrl.remove(0, startIndex);
                 //                                });
					            //             }
					            //         }
					            //     ]
					            // })	
                                this.setLoadingStatus();
				    		}
				    	})                         
                    }
                },
                {
                	text: Lang.L('WORD85ceea04'),
                	handler: data => {

                	}
                }
            ]
        })		               	
    }

    unbindBox() {
        this.util.unbindBox(this, this.boxId, ()=>{
            this.navCtrl.push(DeviceListPage, {
                refresh: true
            });
        })
    }
}
