import { Component } from '@angular/core';
import { NavController, NavParams, App, Events } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import {DeviceDetailPage} from '../device-detail/device-detail';
import {DeviceSearchPage} from '../device-search/device-search';

/**
 * Generated class for the DeviceManagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-device-manage',
  templateUrl: 'device-manage.html',
})
export class DeviceManagePage {
    disks: any = [];
    isShowOptions: boolean = false;
    boxId:any = "";


    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public http: HttpService,
        private lang: Lang,
        private global: GlobalService,
        private util: Util,
        private events: Events) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceManagePage');
        this.util.getDiskStatus()
        .then((res:any)=>{
            this.disks = this.global.diskInfo.disks || [];
            this.disks.map(item => {
                item.isShowOptions = false;
            })
        })
        .catch(() => {
            this.disks = this.global.diskInfo.disks || [];
            this.disks.map(item => {
                item.isShowOptions = false;
            })
        })
        this.boxId = this.global.diskInfo.boxid;
    }

    goDeviceDetailPage() {
        this.navCtrl.push(DeviceDetailPage);
    }

    toggleShowOptions(action = null) {
        this.isShowOptions = !this.isShowOptions;
        this.disks.map(item => {
            if(item.isShowOptions) {
                item.isShowOptions = false;
            }
        })
    }

    showItemOptions(item) {
        this.closeAllOptions();
        item.isShowOptions = true;
    }
    closeAllOptions() {
        this.isShowOptions = false;
        this.disks.map(item => {
            if(item.isShowOptions) {
                item.isShowOptions = false;
            }
        })
    }

    unbindBox() {
        this.util.unbindBox(this, this.boxId, ()=>{
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORDab667a91'),
                message: Lang.L('WORDe6e1739b'),
                buttons: [
                    {
                        text: Lang.L('WORD0cde60d1'),
                        handler: data => {
                            this.navCtrl.push(DeviceSearchPage, {
                                refresh: true
                            });
                        }
                    },
                    {
                        text: Lang.L('NotBind'),
                        handler: data => {
                            this.isShowOptions = false;
                        }
                    },
                ]
            }) 
        })
    }

    rebootDevice() {
        this.util.rebootDevice(this);
    }

    setLoadingStatus(disk) {
        disk.isShowOptions = false;
        this.global.createGlobalLoading(this, {
            message: Lang.L('FormatDiskLoading')
        });        
        var url = this.global.getBoxApi('formatBox');
        this.http.post(url, {
            disk_uuid: disk.uuid
        })  
        .then(res=>{
            if(res.err_no === 0) {
                GlobalService.consoleLog("格式化完成");
                this.util.getDiskStatus();
                this.global.fileTaskList = [];
                this.global.currPath = '/';
                this.events.publish('list:refresh');
                disk.isShowOptions = false;
                this.global.createGlobalToast(this, {
                    message: Lang.L('FormatFinished')
                });
                this.global.closeGlobalLoading(this);  
            } else {
                this.global.closeGlobalLoading(this);
                this.global.createGlobalToast(this, {
                    message: Lang.L('FormatDisk') + Lang.L('UnkownError')
                });
                GlobalService.consoleLog("仍然在格式化");
            }
        })
    }

    setDiskLabel(disk) {
        disk.isShowOptions = false;
        this.global.createGlobalAlert(this, {
            title: '磁盘重命名',
            inputs: [{
                name: 'folderName',
                type: 'text',
                value: disk.label
            }, ],
            buttons: [
                {
                    text: Lang.L('WORD85ceea04'),
                    cssClass: 'order-3',
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                    }
                },
                {
                    text: Lang.L('WORDd0ce8c46'),
                    cssClass: 'order-2',
                    handler: data => {      
                        var name = data.folderName.replace(/(^\s+|\s+$)/g,'');
                        if(name.length > 64) {
                            this.global.createGlobalToast(this, {
                                message: '命名不能超过64个字符',
                                position: 'bottom',
                            });
                            return false;
                        }
                        if(!name) {
                            this.global.createGlobalToast(this, {
                                message: Lang.L('WORD284e3541'),
                                position: 'bottom',
                            });
                            return false;
                        } else {   
                            var url = this.global.getBoxApi('renameDisk');
                            this.http.post(url, {
                                disk_uuid: disk.uuid,
                                label: data.folderName
                            })  
                            .then(res=>{
                                if(res.err_no === 0) {
                                    this.global.createGlobalToast(this, {
                                        message: '重命名成功',
                                    })
                                    disk.label = data.folderName;
                                    this.util.getDiskStatus();
                                } else {
                                    this.global.createGlobalToast(this, {
                                        message: '重命名失败',
                                    })
                                }
                                return true;
                            })
                            
                        }
                    }
                }
            ]
        })
    }
    formatDisk(disk) {
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD652905a6'),
            message: Lang.L('WORDcc4cfe3d'),
            buttons: [
                {
                    text: Lang.L('WORD95d39fcd'),
                    handler: data => {
                        this.setLoadingStatus(disk);
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
}
