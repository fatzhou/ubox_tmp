import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPathPage } from '../bt-set-path/bt-set-path';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";

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
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public global: GlobalService,
        public util: Util,
        public http: HttpService,
        private events: Events,) {
        BtSetPathPage._this = this;
        events.subscribe('bt-path-change', (path) => {
            this.path = path;
        })
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtSetPage');
        this.getTaskConfig();
    }

    goBtSetPathPage() {
        console.log("go BtSetPathPage");
        this.navCtrl.push(BtSetPathPage, {
            currPath: this.path
        });
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
            }
        })
    }

    changeTaskConfig() {
        var url = this.global.getBoxApi("changeBtTaskConfig");
        this.http.post(url, {
            task_num: this.taskNum,
            dir: this.path
        })
        .then((res)=>{
            if(res.err_no === 0) {
                this.global.createGlobalToast(this, {
                    message: "更改任务配置成功",
                });
            }
        })
    }
}
