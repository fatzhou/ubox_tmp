import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
/**
 * Generated class for the DeviceDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-device-detail',
    templateUrl: 'device-detail.html',
})
export class DeviceDetailPage {
    disk: any = {};
    diskName: any = '';
    diskStatus: any = '';
    diskNo: any = '';
    diskModel: any = '';
    diskVersion: any = '';
    diskNewVersion: any = '';
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private http: HttpService,) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceDetailPage');
        this.disk = this.global.diskInfo;
        this.diskName = this.disk.name;
        this.diskStatus = this.global.useWebrtc ? '远场连接' : '内场连接';
        this.diskNo = this.disk.boxid;
        this.diskModel = this.disk.hardware;
        this.diskVersion = this.disk.firmware;
        this.diskNewVersion = this.disk.firmware;
    }

    setHostName() {
        this.global.createGlobalAlert(this, {
            title: '主机重命名',
            inputs: [{
                name: 'folderName',
                type: 'text',
                value: this.diskName
            }, ],
            buttons: [{
                    text: Lang.L('WORDd0ce8c46'),
                    handler: data => {      
                        var name = data.folderName.replace(/(^\s+|\s+$)/g,'');
                        if(!name) {
                            this.global.createGlobalToast(this, {
                                message: Lang.L('WORD284e3541'),
                                position: 'bottom',
                            });
                            return false;
                        } else {   
                            var url = this.global.getBoxApi('renameHost');
                            this.http.post(url, {
                                hostname: data.folderName
                            })  
                            .then(res=>{
                                if(res.status === 0) {
                                    this.global.createGlobalToast(this, {
                                        message: '重命名成功',
                                    })
                                    this.diskName = data.folderName;
                                    
                                } else {
                                    this.global.createGlobalToast(this, {
                                        message: '重命名失败',
                                    })
                                }
                                return true;
                            })
                            
                        }
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                    }
                }
            ]
        })
    }

}
