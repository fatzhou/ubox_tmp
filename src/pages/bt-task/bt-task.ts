import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BtSetPage } from '../bt-set/bt-set';
import { ListPage } from '../list/list';
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
    btDoneList: any = [];
    btDoingList: any = [];
    btDoneNum: any = 0;
    btDoingNum: any = 0;
    tabIndex: any = 0;
    isShowOptions: boolean = false;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private http: HttpService) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad BtTaskPage');
        this.getTaskList();
        // this.setIntervalTaskList = setInterval(() => {
        //     this.getTaskList()
        // },3000);
    }
    ionViewWillLeave() {
        clearInterval(this.setIntervalTaskList);
        this.setIntervalTaskList = null;
        this.isShowOptions = false;
    }
    goBtSetPage() {
        console.log("go BtTaskPage");
        this.navCtrl.push(BtSetPage);
    }
    changeIndex(index) {
        this.tabIndex = index;
    }
    getTaskList() {
        var url = this.global.getBoxApi("getBtTaskList");
        this.http.post(url, {})
        .then((res)=>{
            if(res.err_no === 0) {
                GlobalService.consoleLog("获取任务列表成功");
                this.btTaskList = res.list || [];
                this.btDoneList = this.btTaskList.filter(item => {
                    item.isDelete = false;
                    return item.status == 3;
                });
                this.btDoingList = this.btTaskList.filter(item => {
                    item.isDelete = false;
                    return item.status != 3;
                });
                this.btDoneNum = this.btDoneList.length;
                this.btDoingNum = this.btDoingList.length;
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
        item.isDelete = false;
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
            title: '提示',
            message: '确认删除该任务',
            // enableBackdropDismiss: false,
            inputs: [{
                name: 'checkbox1',
                type: 'checkbox',
                label: '同时删除硬盘本地文件',
                value: 'value1',
                checked: false
            }],
            buttons: [{
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.handleBack();
                    }
                },
                {
                    text: Lang.L('Delete'),
                    handler: data => {
                        let isDelete = 0;
                        if(data.indexOf('value1') > -1) {
                            isDelete = 1;
                        }
                        var url = this.global.getBoxApi("deleteBtTask");
                        this.http.post(url, {
                            taskid: item.taskid,
                            del_file: isDelete
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

    goListPage(item) {
        console.log("go goBtPlayPage");
        this.navCtrl.push(ListPage, {
            type: "",
            path: item.dir
        })
        .then(()=> {
            item.isDelete = false;
        })
        // this.navCtrl.push(BtPlayPage, {
        //     path:  'http://192.168.0.14:37867/ubeybox/file/download?fullpath=' + item.dir + '/' + item.name
        // });
    }
    

    getStatus(item) {
        if(item.status == -1) {
            return '等待下载'
        } else if(item.status == 0) {
            return '连接中'
        } else if(item.status == 1) {
            return '下载' + ""
        } else if(item.status == 2) {
            return '已暂停'
        } else if(item.status == 3) {
            return '已完成'
        }else if(item.status == 4) {
            return '下载失败'
        }
    }

    computeSpeed(task) {
        if(task.speed > GlobalService.DISK_M_BITS) {
            return (task.speed / GlobalService.DISK_M_BITS).toFixed(2) + 'M';
        } else {
            return (task.speed / GlobalService.DISK_K_BITS).toFixed(2) + 'K';
        }
    }

    getChangeStatus(item) {
        if(item.status == -1 || item.status == 0 || item.status == 1) {
            return '下载中'
        } else if(item.status == 2) {
            return '继续下载'
        } else if(item.status == 3) {
            return '查看文件'
        }else if(item.status == 4) {
            return '重新下载'
        }
    }

    showPcToast() {
        this.global.createGlobalToast(this, {
            message: '在电脑上打开Ubbey客户端，可对您设备里的文件进行管理，下载地址：www.ubbey.org/download'
        })
        this.toggleShowOptions('close');
    }

    toggleShowOptions(isShow = null) {
        if(isShow != null) {
            this.isShowOptions = false;
        } else {
            this.isShowOptions = !this.isShowOptions;
        }
    }

    toggleAllTaskList(action) {
        this.isShowOptions = false;
        if(action == 'stop') {
            this.btDoingList.map((item)=> {
                if(item.status != 2 && item.status != 4) {
                    this.changeTaskStatus(item, 2)
                }
            })
        } else {
            this.btDoingList.map((item)=> {
                if(item.status == 2 || item.status == 4) {
                    this.changeTaskStatus(item, 1)
                }
            })
        }
    }

    toggleShowDelete(item = null, isDelete = true) {
        if(item == null) {
            this.btDoingList.filter(item => {
                item.isDelete = false;
            })
            this.btDoneList.filter(item => {
                item.isDelete = false;
            })
            return false;
        }
        if(item.status != 3) {
            this.btDoingList.filter(item => {
                item.isDelete = false;
            })
            item.isDelete = isDelete;
        } else {
            this.btDoneList.filter(item => {
                item.isDelete = false;
            })
            item.isDelete = isDelete;
        }
    }
}
