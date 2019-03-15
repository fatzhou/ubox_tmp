import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPage } from '../bt-set/bt-set';
import { BtPlayPage } from '../bt-play/bt-play';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";

/**
 * Generated class for the BtTaskPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-bt-task',
    templateUrl: 'bt-task.html',
})
export class BtTaskPage {
    btTaskList: any = [];
    setIntervalTaskList: any = null;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private http: HttpService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtTaskPage');
        this.getTaskList();
        this.setIntervalTaskList = setInterval(() => {
            this.getTaskList()
        },3000);
    }
    ionViewWillLeave() {
        clearInterval(this.setIntervalTaskList);
        this.setIntervalTaskList = null;
        
    }
    goBtSetPage() {
        console.log("go BtTaskPage");
        this.navCtrl.push(BtSetPage);
    }

    getTaskList() {
        var url = this.global.getBoxApi("getBtTaskList");
        this.http.post(url, {})
        .then((res)=>{
            if(res.err_no === 0) {
                GlobalService.consoleLog("获取任务列表成功");
                this.btTaskList = res.list || [];
            }
        })
    }

    getComputed(finished,total) {
        if(total == 0) return '0%';
        let computed;
        return computed = ((finished / total) * 100).toFixed(2) + '%'
    }

    changeTaskStatus(item, latter) {
        var url = this.global.getBoxApi("changeBtTaskStatus");
        this.http.post(url, {
            taskid: item.taskid,
            former_status: item.status,
            latter_status: latter
        })
        .then((res)=>{
            if(res.err_no === 0) {
                this.global.createGlobalToast(this, {
                    message: "更改任务状态成功",
                });
                item.status = latter;
            }
        })
    }

    deleteTask(item) {
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD0e46988a'),
            message: Lang.L('WORD0e46988a'),
            // enableBackdropDismiss: false,
            buttons: [{
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.handleBack();
                    }
                },
                {
                    text: Lang.L('WORDd0ce8c46'),
                    handler: data => {
                        var url = this.global.getBoxApi("deleteBtTask");
                        this.http.post(url, {
                            taskid: item.taskid,
                            del_file: 1
                        })
                        .then((res)=>{
                            if(res.err_no === 0) {
                                this.global.createGlobalToast(this, {
                                    message: "删除任务成功",
                                });
                                this.getTaskList();
                            }
                        })
                    }
                }
            ]
        })
        
    }

    goBtPlayPage(item) {
        console.log("go goBtPlayPage");
        this.navCtrl.push(BtPlayPage, {
            path:  'http://192.168.0.14:37867/ubeybox/file/download?fullpath=' + item.dir + '/' + item.name
        });
    }
    
}
