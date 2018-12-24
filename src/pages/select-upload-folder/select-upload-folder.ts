import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";

/**
 * Generated class for the SelectfolderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-upload-folder',
    templateUrl: 'select-upload-folder.html',
})
export class SelectUploadFolderPage {
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
        SelectUploadFolderPage._this = this;
        events.subscribe('file:updated', SelectUploadFolderPage.listFiles)
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad SelectfolderPage');
        GlobalService.consoleLog('this.currPath  :' + this.currPath);
        this.currPath = this.navParams.get("currPath") || this.global.currPath;
        this.type = this.navParams.get("type") || false;
        this.count = this.navParams.get("count") || 0;
        let path = this.currPath == '/' ? Lang.L('DirAllFiles') : Lang.L('DirAllFiles') + this.currPath;
        this.path = path.replace(/\//g, '>');
        this.pathList = this.path.split('>');
        this.selectedName = this.currPath == '/' ? Lang.L('DirAllFiles') : this.currPath.split('/')[this.currPath.split('/').length -1];
        this.global.selectedUploadFolderName = this.selectedName;
        SelectUploadFolderPage.listFiles();
        if(this.type == true) {
            this.makeFolder();
        }
    }

    static listFiles() {
        let _that = SelectUploadFolderPage._this
        var url = _that.global.getBoxApi("listFolder");
        _that.http.post(url, {
            path: _that.currPath
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
        GlobalService.consoleLog('currPath' +currPath);
        this.navCtrl.push(SelectUploadFolderPage, {
            "type" : false,
            "count" : this.count + 1,
            "currPath" : currPath
        });          
    }


    goBack(type) {
        if(type == 1){
            this.global.currPath = this.currPath;
            console.log('准备move1')
            if(this.global.selectFolderType == 'move') {
                console.log('准备move2')
                this.events.publish("image:move");
            }
        }
        this.util.popToPage(this, this.count + 2);
    }

    makeFolder() {
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD7c5e25c1'),
            message: Lang.L('WORD18239a0a'),
            inputs: [{
                name: 'folderName',
                type: 'text',
                placeholder: Lang.L('WORD5466a2d3')
            }, ],
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
                        var name = data.folderName.replace(/(^\s+|\s+$)/g,'');
                        if(!name) {
                            this.global.createGlobalToast(this, {
                                message: Lang.L('WORD284e3541'),
                                position: 'bottom',
                            });
                            return false;
                        } else {
                            GlobalService.consoleLog("创建文件夹：" + name);
                            var url = this.global.getBoxApi("createFolder");
                            var prefix = this.currPath.replace(/\/$/g, '') + "/";
                            this.http.post(url, {
                                fullpath: prefix + name
                            })
                            .then((res)=>{
                                if(res.err_no === 0) {
                                    GlobalService.consoleLog("创建文件夹成功");
                                    this.global.alertCtrl && this.global.alertCtrl.dismiss();
                                    this.global.createGlobalToast(this, {
                                        message: Lang.L('WORD3eca2610'),
                                    });
                                    this.events.publish('file:updated');
                                    SelectUploadFolderPage.listFiles();
                                    this.type = false;
                                }
                            })
                        }
                        return true;
                    }
                }
            ]
        })
    }
}
