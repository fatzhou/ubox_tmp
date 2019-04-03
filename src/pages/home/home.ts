import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ListPage } from '../list/list';
import { UserPage } from '../user/user';
import { MiningPage } from '../mining/mining';
// import { LoginPage } from '../login/login';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { Util } from '../../providers/Util';
import { DeviceSearchPage } from '../device-search/device-search';
import { AboutDevicePage } from '../about-device/about-device';
import { DeviceManagementPage } from '../device-management/device-management';
import { Lang } from "../../providers/Language";
import { FileTransport } from '../../providers/FileTransport';
import { Storage } from '@ionic/storage';
import { Md5 } from 'ts-md5/dist/md5';
import { Web3Service } from '../../providers/Web3Service';
import { ChangeDetectorRef } from '@angular/core';

import { FileManager } from '../../providers/FileManager';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Platform } from 'ionic-angular';

import { LoginPage } from '../login/login';


// import { FileTransport } from "../../providers/FileTransport"
/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage {
    showFileSelect: any = false;
    diskInterger: any = 0;
    diskFraction: any = "00";
    totalSpace: any = 0;
    miningInterger: any = 0;
    miningFraction: any = "00";
    miningTotal: any = 0;
    // static _this;
    isShowBox: boolean = false;

    //0319add
    currPath: string = '/'; 
    dataAcquired: any = false;
    type0List: any = [];
    type1List: any = [];
    isShowType0List: boolean = true;
    isShowType1List: boolean = true;
    allFileList: any = []; //总文件数组
    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private events: Events,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private app: App,
        private fileManager: FileManager,
        private web3: Web3Service,
        public storage: Storage,
        private platform: Platform,
        private transfer : FileTransport,
        private cd: ChangeDetectorRef,
        // public camera: Camera,
    ) {
        // HomePage._this = this;
        if (this.platform.is('android')) {
            this.global.platformName = 'android';
        } else if (this.platform.is('ios')) {
            this.global.platformName = 'ios';
        }

        GlobalService.consoleLog("Going home!");
        this.events.unsubscribe('home:succeed');
        this.events.subscribe('home:succeed', () => {
            GlobalService.consoleLog("成功接收到事件");
        })
        this.events.unsubscribe('chainType:update');
        this.events.subscribe('chainType:update', () => {
            GlobalService.consoleLog("成功更新chainType");
            this.setChainTypeList();
        })
        events.subscribe('upload:failure', (task) => {
            GlobalService.consoleLog("!!文件上传失败!!" + task.taskId);
            //删除任务以及上传器
            // this.global.fileHandler[taskId] = undefined;
            // let index = -1;
            // let name = "";
            // let taskInList = this.global.fileTaskList.forEach((item, ind) => {
            //     GlobalService.consoleLog(item.taskId);
            //     if(item.taskId === taskId) {
            //         name = item.name;
            //         index = ind;
            //         return false;
            //     }
            // })
            // GlobalService.consoleLog("待暂停的索引：" + index);
            task.pausing = "paused";
            this.global.fileHandler[task.taskId].pause();
            // if(index !== -1) {
            //     GlobalService.consoleLog("删除索引：" + index);
            //     this.global.fileTaskList.splice(index, 1);
            // }
            // this.fileUploader.uploader.clearCache();
            this.global.createGlobalToast(this, {
                message: Lang.Lf('UploadFileNotExist', task.name)
            })
        }); 

        events.subscribe('download:failure', (task) => {
            GlobalService.consoleLog("!!文件下载失败!!" + task.taskId);
            //删除任务以及上传器
            // this.global.fileHandler[taskId] = undefined;
            // let index = -1;
            // let name = "";
            // let taskInList = this.global.fileTaskList.forEach((item, ind) => {
            //     GlobalService.consoleLog(item.taskId);
            //     if(item.taskId === taskId) {
            //         name = item.name;
            //         index = ind;
            //         return false;
            //     }
            // })
            // GlobalService.consoleLog("待暂停的索引：" + index);
            task.pausing = "paused";
            this.global.fileHandler[task.taskId].pause();
            // if(index !== -1) {
            //     GlobalService.consoleLog("删除索引：" + index);
            //     this.global.fileTaskList.splice(index, 1);
            // }
            // this.fileUploader.uploader.clearCache();
            this.global.createGlobalToast(this, {
                message: Lang.Lf('DownloadFileNotExist', task.name)
            })
        });
        events.subscribe('close:box', (res) => {
            this.isShowBox = res;
        })

        // events.unsubscribe('backup:start', HomePage.backupEventerListener);
        // events.subscribe('backup:start', HomePage.backupEventerListener);
    }

    showNetworkPopup() {
        //通知父组件关闭
        // this.navCtrl.parent.showPopup(true);
        this.events.publish('open-popup');
    }

    ionViewDidEnter() {
        GlobalService.consoleLog("获取磁盘信息");
        this.getDiskStatus();
        // this.getMiningInfo();
        this.setLastDayEarn();
        this.getChainTypeList();
		this.util.getWalletList();  
		//检查是否需要获取权限并弹出窗口...
		if(this.platform.is('cordova')) {
			if(!this.fileManager.readPermitted && this.global.centerUserInfo.bind_box_count > 0) {
				// this.isShowBox = true;
				this.fileManager.getPermission()
				.then(res => {
					this.getFileInfo();
				}, () => {
					this.isShowBox = true;
				})
			} 			
		} 
    }
    
    ionViewDidLeave() {
        this.isShowBox = false;
	}
	
    getFileInfo() {
        // HomePage._this = this;
        if(this.fileManager.readPermitted) {
            if(!this.fileManager.photoLibraryReady) {
                this.fileManager.initFileList();
            }
            if(this.global.deviceSelected) {
                console.log(JSON.stringify(this.global.deviceSelected))
                let config = this.fileManager.resourceStorage['image'];
                console.log("图片配置：" + JSON.stringify(config));
                if(config.finished) {
                    console.log("图片获取已完成，直接备份");
                    setTimeout(() => {
                        this.fileManager.startBackUp();
                    }, 1000)
                } else if(this.platform.is('cordova')) {
                    console.log("图片获取尚未完成，需要先拉配置");
                    this.fileManager.getBackupInfo()
                    .then(res => {
                        this.fileManager.fetchAlbums('image')
                    })
                    .catch(e => {
                        //不需要备份
                    })
                }            
            }            
        }
    }

    // static backupEventerListener() {
    //     HomePage._this.fileManager.startBackUp();
    // }

    goMining() {
        // this.app.getRootNav().push(MiningPage);
        this.navCtrl.parent.select(1);
    }    

    goAboutDevice() {
        this.app.getRootNav().push(AboutDevicePage);
    }

    setLastDayEarn() {
        if (this.global.centerUserInfo && this.global.centerUserInfo.earn !== undefined) {
            GlobalService.consoleLog("设置挖矿收益：" + this.global.centerUserInfo.earn);
            var lastDay = new Date(new Date().setDate((new Date().getDate() - 1)));
            var lastDate = [lastDay.getFullYear(), ('00' + (lastDay.getMonth() + 1)).slice(-2), ('00' + lastDay.getDate()).slice(-2)].join('-');

            this.http.post(GlobalService.centerApi["getAvenueList"].url, {
                start_date: this.getDate(lastDay),
                end_date: this.getDate(lastDay),
            })
            .then(res => {
                if (res.err_no === 0) {
                    GlobalService.consoleLog("获取收益成功");
                    var dayInfo = res.day_info || [];
                    var earn = 0;
                    for(var i = 0, len = dayInfo.length; i < len; i++) {
                        if(dayInfo[i].date == lastDate) {
                            earn = dayInfo[i].earn;
                            break;
                        }
                    }
                    earn = earn / GlobalService.CoinDecimal;
                    this.miningInterger = Math.floor(earn);
                    this.miningFraction = this.util.cutFloat(earn - this.miningInterger,2).replace(/^\d+\./, '');
                    this.miningTotal = this.util.cutFloat(this.global.centerUserInfo.earn / GlobalService.CoinDecimal,2) || 0;
                    GlobalService.consoleLog(this.miningTotal + ',' + this.global.centerUserInfo.earn);
                }
            })
        } else {
            setTimeout(()=>{
                this.setLastDayEarn();
            }, 500);
        }
    }

    getDate(date) {
        var year = date.getFullYear(),
            month = ('00' + (date.getMonth() + 1)).slice(-2),
            day = ('00' + date.getDate()).slice(-2);
        return [year, month, day].join('-') + ' 00:00:00';
    }

    // getMiningInfo() {
    //   this.http.post(GlobalService.centerApi["getMiningInfo"].url, {

    //   })
    //   .then((res) => {
    //     if(res.err_no === 0) {

    //     }
    //   })
    // }

    getDiskStatus() {
        this.computeDiskSize(this.global.diskInfo);
    }

    computeDiskSize(box) {
        var disk = box && box.disks && box.disks[0];
        if (disk) {
            var freeSpace = (disk.total - disk.usage) / GlobalService.DISK_G_BITS;
            this.diskInterger = Math.floor(freeSpace);
            this.diskFraction = this.util.cutFloat(freeSpace, 2).replace(/^\d+\./, '');
            this.totalSpace = this.util.cutFloat(disk.total / GlobalService.DISK_G_BITS, 2);
        } else {
            this.diskInterger = '--';
            this.diskFraction = '--';
            this.totalSpace = '--';
        }
        GlobalService.consoleLog("发射总大小更新事件");
        // this.events.publish('totalsize:get', {
        //     total: this.totalSpace
        // })
    }

    goDeviceList() {
        if(this.global.deviceSelected) {
            GlobalService.consoleLog("已连接设备，进入设备管理");
            this.app.getRootNav().push(DeviceManagementPage);            
        }
    }

    goLoginPage() {
        this.app.getRootNav().push(LoginPage, {
            popBack: true
        });            
    }


    openFileSelect() {
        GlobalService.consoleLog("打开浮层");
        this.showFileSelect = true;
    }

    closeFileSelect() {
        GlobalService.consoleLog("收到关闭浮层事件");
        this.showFileSelect = false;
    }

    addFileDone() {
        GlobalService.consoleLog("收到文件上传成功事件");
    }

    goBindingPage() {
        this.app.getRootNav().push(DeviceSearchPage, {
            refresh: true
        });
    }

    goBuyBoxPage() {
        this.util.openUrl("https://ubbey.com/products/ubbey-box");
    }

    // slideOtherTab(tabName) {
    //   if(tabName === 'mining') {
    //     this.navCtrl.push(MiningPage);      
    //   } else if(tabName === 'user') {
    //     this.navCtrl.push(UserPage);
    //   }
    // }
    getChainTypeList() {
        this.storage.get('ChainType')
        .then(res => {
            GlobalService.consoleLog("缓存chainType状态：" + JSON.stringify(res));
            if(res) {
                this.global.chainTypeList = JSON.parse(res);
                let uname = this.global.boxUserInfo.username || this.global.centerUserInfo.uname;
                let hash = Md5.hashStr(uname.toLowerCase()).toString();
                let chainTypeItem = this.global.chainTypeList.filter(item => {
                    return hash == item.bindUserHash
                })
                if(chainTypeItem.length === 0) {
                    this.global.chainSelectIndex = 0;
                } else {
                    this.global.chainSelectIndex = chainTypeItem[0].index;
                }
                this.web3.changeChainProvider();
            }
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack)
        })
    }

    setChainTypeList(){
        let uname = this.global.boxUserInfo.username || this.global.centerUserInfo.uname;
        let hash = Md5.hashStr(uname.toLowerCase()).toString();
        let chainTypeItem = this.global.chainTypeList.filter(item => {
            return hash == item.bindUserHash
        })
        if(chainTypeItem.length === 0) {
            this.global.chainTypeList.push({
                bindUserHash: hash,
                index: this.global.chainSelectIndex
            })
        } else {
            chainTypeItem[0].index = this.global.chainSelectIndex;
        }
        this.storage.set('ChainType', JSON.stringify(this.global.chainTypeList))
        .then(res => {
            GlobalService.consoleLog("缓存chainType状态：" + res);
        })
        .catch(e => {
        })
    }

}
