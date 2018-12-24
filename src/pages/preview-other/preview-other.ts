import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from "../../providers/Util";
import { Lang } from '../../providers/Language';
import { FileManager } from '../../providers/FileManager';
import { FileTransfer } from '../../providers/FileTransfer';
import { HttpService } from '../../providers/HttpService';
import { Events } from 'ionic-angular';

/**
 * Generated class for the PreviewOtherPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-preview-other',
    templateUrl: 'preview-other.html',
})
export class PreviewOtherPage {
    downloadStatus: string = 'default';
    fileInfo: any = {};
    fileName: any = '';
    fileSize: any = 0;
    currPath: string = '';
    isShowDetail: boolean = false;
    task: any = {};
    constructor(public navCtrl: NavController,
        private lang: Lang,
        private global: GlobalService,
        private util: Util,
        private events: Events,
        private fileManager: FileManager,
        private transfer: FileTransfer,
        private http: HttpService,
        public navParams: NavParams) {
        events.subscribe('fileName:update', (res) => {
            this.fileName = res;
        })
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad PreviewOtherPage');
        this.fileInfo = this.navParams.get('info') || {};
        this.currPath = this.navParams.get('currPath');
        this.fileName = this.fileInfo.name || '';
        this.fileSize = this.fileInfo.size || '0.00';
        // this.fileSize = this.util.cutFloat(this.fileInfo.size / GlobalService.DISK_M_BITS, 2) || 0;
        //过滤当前文件的下载任务
        GlobalService.consoleLog("所有下载任务:" + JSON.stringify(this.global.fileTaskList));
        GlobalService.consoleLog("文件信息：" + this.currPath + "," + this.fileName);
        let task = this.global.fileTaskList.filter(item => {
            return item.action === 'download' && item.path === (this.currPath.replace(/\/$/, '') + "/" + item.name) && this.fileName === item.name;
        })
        if(task.length) {
            this.task = task[0];
            GlobalService.consoleLog("获取到下载任务：" + JSON.stringify(this.task));
            if(this.task.loaded === this.task.total) {
                this.downloadStatus = 'finished';
            } else {
                this.downloadStatus = this.task.pausing;
            }
        }
    }

    toggleDetailPage(isShow = false, isPop = null) {
        GlobalService.consoleLog("toggleDetailPage + " + isShow);
        this.isShowDetail = isShow;
    }

    goBack() {
        this.navCtrl.pop();
        this.events.publish('file:updated');
    }

    controlDownloadFile() {
        if(this.downloadStatus === 'finished') {
            GlobalService.consoleLog("已下载，直接打开")
            //已完成，直接打开
            this.util.openFile(this.task.localPath);
        } else if(this.downloadStatus === 'default') {
            GlobalService.consoleLog("未创建下载任务");
            //尚未下载
            this.downloadFile();
        } else {
            GlobalService.consoleLog("下载中或者暂停中。。");
            let handler = this.global.fileHandler[this.task.taskId];
            //暂停或者恢复
            if(!handler || !this.task) {
                GlobalService.consoleLog("错误，未找到handler");
                return false;
            }
            if(this.task.pausing === 'doing' || this.task.pausing === 'waiting') {
                GlobalService.consoleLog("下载中，暂停下载");
                this.downloadStatus = 'paused';
                this.task.pausing = 'paused';
                handler.pause();
            } else {
                GlobalService.consoleLog("暂停中，恢复下载");
                this.downloadStatus = 'doing';
                this.task.pausing = 'doing';
                handler.resume();
            }
        }
        return true;
    }

    downloadFile() {
        this.downloadStatus = 'doing';
        this.transfer.downloadFile(this.fileInfo, this.global.currPath);
        setTimeout(()=>{
            var localPath = this.global.fileSavePath + this.fileInfo.name;
            var fullPath = this.global.currPath.replace(/\/$/g, '') + "/" + this.fileInfo.name;
            var fileId = this.util.generateFileID(localPath, fullPath, 'download');
            this.task = this.global.fileTaskList.filter(item => {
                return item.fileId == fileId;
            })[0];
        },1000);
    }

    computeFinished() {
        var downloadSize = 1;
        var allSize = 100;
        if(this.task && this.task.loaded !== undefined) {
            downloadSize = this.task.loaded;
            allSize = this.task.total;
        }
        var progress =  Math.floor(downloadSize / allSize * 100 || 0);
        if(downloadSize == allSize) {
            this.downloadStatus = 'finished';
        }
        // GlobalService.consoleLog("Progress:" + progress);
        return progress + '%';
    }

}
