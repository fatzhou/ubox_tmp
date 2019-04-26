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
        public global: GlobalService,
        private http: HttpService,) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad DeviceDetailPage');
        this.disk = this.global.diskInfo;
        this.diskName = this.disk.name;
        this.diskStatus = this.global.useWebrtc ? Lang.L('RemoteConnection') : Lang.L('LocalConnection');
        this.diskNo = this.disk.boxid;
        this.diskModel = this.disk.hardware;
        this.diskVersion = this.disk.firmware;
        this.diskNewVersion = this.disk.firmware;
    }

    setHostName() {
        this.global.createGlobalAlert(this, {
            title: Lang.L('Rename'),
            inputs: [{
                name: 'folderName',
                type: 'text',
                value: this.diskName
            }, ],
            buttons: [                {
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
                                if(res.err_no === 0) {
                                    this.global.createGlobalToast(this, {
                                        message: Lang.L('WORD1b35951f'),
                                    })
                                    this.diskName = data.folderName;
                                    this.global.diskInfo.name = this.diskName;

                                } else {
                                    this.global.createGlobalToast(this, {
                                        message: Lang.L('RenameError'),
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

    /**
     * 切换远近场模式
     */
    toggleWebrtcEngine(){
        this.global.createGlobalLoading(this, {});
        if(this.global.useWebrtc == true){
            GlobalService.consoleLog('当前正在使用远场，切换连接模式为近场');
            this.http.stopWebrtcEngine()
        } else {
            GlobalService.consoleLog('当前正在使用近场，切换连接模式为远场');
            this.http.startWebrtcEngine()
        }
        setTimeout(()=>{
            this.global.closeGlobalLoading(this);
            this.diskStatus = this.global.useWebrtc ? Lang.L('RemoteConnection') : Lang.L('LocalConnection');
        }, 1000);
    }

}
