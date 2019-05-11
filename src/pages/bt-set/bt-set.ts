import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";
import { BtSetPathPage } from '../bt-set-path/bt-set-path';
import { BtSetDiskPage } from '../bt-set-disk/bt-set-disk';

/**
 * Generated class for the BtSetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-bt-set',
    templateUrl: 'bt-set.html',
})
export class BtSetPage {

    path: string = '';
    taskNum: number = 1;
    diskLabel: string = '';
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public global: GlobalService,
        public util: Util,
        public http: HttpService,
        private events: Events,) {
        events.subscribe('bt-path-change', (path) => {
            this.path = path;
            this.global.diskInfo.disks.filter(item => {
                if(this.global.currSelectDiskUuid == item.uuid) {
                    this.diskLabel = item.label || '';
                }
            })
        })
    }

    ionViewDidLoad() {
        // GlobalService.consoleLog('ionViewDidLoad BtSetPage');
        this.getTaskConfig();
    }
    ionViewWillLeave() {
        GlobalService.consoleLog('ionViewWillLeave BtSetPage');
        this.changeTaskConfig();
    }

    goBtSetPathPage() {
        GlobalService.consoleLog("go BtSetPathPage");
        this.navCtrl.push(BtSetDiskPage, {
            currPath: this.path
        });
        // this.navCtrl.push(BtSetDiskPage);
    }

    changeTaskNum(type) {
        if(type == 0) {
            if(this.taskNum >= 2) {
                this.taskNum--;
            }
        } else {
            if(this.taskNum <= 9) {
                this.taskNum++;
            }
        }
    }

    getTaskConfig() {
        var url = this.global.getBoxApi("getBtTaskConfig");
        this.http.post(url, {})
        .then((res)=>{
            if(res.err_no === 0) {
                this.path = res.dir;
                this.taskNum = res.task_num;
                if(this.global.diskInfo.disks) {
                    this.global.diskInfo.disks.filter(item => {
                        if(res.disk_uuid == item.uuid) {
                            this.diskLabel = item.label || '';
                        }
                    })
                }
            }
        })
    }

    changeTaskConfig() {
        var url = this.global.getBoxApi("changeBtTaskConfig");
        this.http.post(url, {
            task_num: this.taskNum,
            dir: this.path,
            disk_uuid: this.global.currSelectDiskUuid
        })
        .then((res)=>{
            if(res.err_no === 0) {
                this.global.createGlobalToast(this, {
                    message: Lang.L('ChangeTaskConfigSuccess'),
                });
            }
        })
    }
}
