import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";

/**
 * Generated class for the BtSetPathPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: 'page-bt-set-path',
    templateUrl: 'bt-set-path.html',
})
export class BtSetPathPage {

        currPath: any = "";
        type: boolean = false;
        fileList: any = [];
        selectedName: any = '';
        count: any = 0;
        path: any = '';
        pathList: any = [];
        static _this;
        constructor(
            public navCtrl: NavController, 
            public navParams: NavParams,
            public global: GlobalService,
            public util: Util,
            public http: HttpService,
            private events: Events,) {
            BtSetPathPage._this = this;
            events.subscribe('file:updated', BtSetPathPage.listFiles)
        }
    
        ionViewDidLoad() {
            this.count = this.navParams.get("count") || 0;
            console.log('this.count' + this.count);
            GlobalService.consoleLog('ionViewDidLoad SelectfolderPage');
            GlobalService.consoleLog('this.currPath  :' + this.currPath);
            this.currPath = this.navParams.get("currPath") || this.global.currSelectPath;
            let path = this.currPath == '/' ? Lang.L('DirAllFiles') : Lang.L('DirAllFiles') + this.currPath;
            this.path = path.replace(/\//g, '>');
            this.pathList = this.path.split('>');
            this.selectedName = this.currPath == '/' ? Lang.L('DirAllFiles') : this.currPath.split('/')[this.currPath.split('/').length -1];
            this.global.selectedUploadFolderName = this.selectedName;
            BtSetPathPage.listFiles();
        }
    
        static listFiles() {
            let _that = BtSetPathPage._this
            var url = _that.global.getBoxApi("listFolder");
            _that.http.post(url, {
                path: _that.currPath,
                disk_uuid: _that.global.currSelectDiskUuid
            })
            .then((res) => {
                if (res.err_no === 0) {
                    var list = [];
                    if (res.list && res.list.length > 0) {
                        list = res.list.filter((item) => {
                            return item.type === 1
                        })
                    }
                    _that.fileList = list;
                    GlobalService.consoleLog("获取文件列表成功，即将清除状态");
                }
            })
        }
    
        goNextFolder(info, type) {
            GlobalService.consoleLog("选择了文件夹，进入文件夹");
            let currPath;
            currPath = '/';
            if(type == '1') {
                let index = 0;
                index = this.pathList.indexOf(info);
                if(index == (this.pathList.length - 1)){
                    return false;
                }
                for(let i=1;i <= index; i++) {
                    currPath += this.pathList[i];
                    if(i < index) {
                        currPath += '/'
                    }
                    
                }
            } else {
                currPath = this.currPath.replace(/\/$/g, '') + "/" + info;
            }
            GlobalService.consoleLog('currPath' + currPath);
            this.global.currSelectPath = currPath;
            this.navCtrl.push(BtSetPathPage, {
                "type" : false,
                "count" : this.count + 1,
                "currPath" : currPath
            });          
        }
    
    
        goBack(index = null) {
            if(index) {
                this.navCtrl.pop();
            } else {
                console.log('this.count' + this.count);
                this.util.popToPage(this, this.count + 2);
            }
            
        }
    
        savePath() {
            // this.events.publish('bt-path-change', this.currPath);
            this.global.currSelectPath = this.currPath;
            this.goBack();
        }

}
