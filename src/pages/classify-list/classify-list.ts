import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { ChangeDetectorRef } from '@angular/core';

import { HttpService } from '../../providers/HttpService';
import { Events, App } from 'ionic-angular';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { Lang } from "../../providers/Language";
import { TaskListPage } from '../task-list/task-list';
import { Md5 } from 'ts-md5/dist/md5';
import { Platform } from 'ionic-angular';
import { FileTransfer } from '../../providers/FileTransfer';
import { FileDownloader } from '../../providers/FileDownloader';
import { PreviewImagePage } from '../preview-image/preview-image';
import { PreviewOtherPage } from '../preview-other/preview-other';
import { SelectUploadFolderPage } from '../../pages/select-upload-folder/select-upload-folder'
import { Storage } from '@ionic/storage';


declare var cordova;
@Component({
  selector: 'page-classify-list',
  templateUrl: 'classify-list.html',
})
export class ClassifyListPage {
    showFileSelect: Boolean = false;
    pageTitle: any = Lang.L('DirAllFiles');
    currPath: any = "";
    fileList: any = []; //显示文件数组
    // pageFileList: any = []; //显示的缩略图文件列表
    dataAcquired: any = false;
    allBtnsShow: Boolean = false;
    selectedFiles: any = [];
    canDownload: Boolean = true;
    canDelete: Boolean = true;
    canRename: Boolean = true;
    canMove: Boolean = true;
    canDetail: Boolean = true;
    selectAllStatus: Boolean = false;
    showEng: any = GlobalService.applang;
    showTitle: any = [];
    isRefresh: boolean = false;
    pageNo: number = 1;
    pageSize: number = 10;
    DetailInfo: any = null;
    isShowDetail: boolean = false;
    hideAddBtn: boolean = false;
    classify: number = 0;
    index: number = 0;
    count: number = 0;
    static _this;

    constructor(public navCtrl: NavController,
        public global: GlobalService,
        private cd: ChangeDetectorRef,
        public util: Util,
        public http: HttpService,
        private events: Events,
        private toastCtrl: ToastController,
        private platform: Platform,
        private file: File,
        private transfer: FileTransfer,
        private downloader: FileDownloader,
        private storage: Storage,
        public navParams: NavParams) {       
        GlobalService.consoleLog("进入classify-list的构造函数....");

        ClassifyListPage._this = this;

        this.events.unsubscribe('file:updated', ClassifyListPage.fileUpdated);
        this.events.subscribe('file:updated', ClassifyListPage.fileUpdated);
        this.events.unsubscribe('image:move', ClassifyListPage.moveFileList);
        this.events.subscribe('image:move', ClassifyListPage.moveFileList);
    }

    ionViewDidEnter() {
        this.global.currPath = this.currPath;
        this.hideAddBtn = false;
    }


    static fileUpdated(task) {
        GlobalService.consoleLog("文件更新事件响应---");
        let flag = true;
        let _this = ClassifyListPage._this;

        if(task && task.taskId) {
            GlobalService.consoleLog(_this.classify + "," + task.fileStyle);
            //传入任务
            if(task.action === 'upload' && task.fileStyle === {2: 'video', 1: 'image', 4: 'doc', 3: 'music'}[_this.classify]) {
            } else {
                flag = false;
            }
        }
        if(flag) {
            GlobalService.consoleLog("文件上传成功导致列表更新...");
            _this.resetPageParam();
            _this.listFiles();
        }
    }

    static moveFileList() {
        let _this = ClassifyListPage._this;
        _this.resetPageParam();
        GlobalService.consoleLog("文件移动成功，更新数据 classify-list");
        for(let i = 0; i < _this.selectedFiles.length; i++) {
            _this.moveFile(_this.selectedFiles[i].path.replace(/\/$/g, '') + "/", _this.selectedFiles[i].name, _this.global.currPath.replace(/\/$/g, '') + "/", _this.selectedFiles[i].name, "move");
        }            
    }

    ionViewWillLeave() {
        this.hideAddBtn = true;
        //保存缩略图map到缓存
        this.storage.set('thumbnailMap', JSON.stringify(this.global.thumbnailMap));
    }

    ionViewDidLoad() {
        this.pageNo = 1;
        GlobalService.consoleLog('ionViewDidLoad ClassifyListPage');
        if (this.global.deviceSelected) {
            this.initPage();
            this.listFiles();
        }
        GlobalService.consoleLog("this.currPath" +this.currPath)
    }

    pretify(name) {
        if(name.length < 22) {
            return name;
        } else {
            return name.slice(0, 12) + '...' + name.slice(-8);
        }
    }

    hasThumbnail(type) {
        if(type === 'image' || type === 'video' && this.platform.is('ios')) {
            return true;
        }
        return false;
    }

    //勾选文件
    setSelectedFiles(file) {
        GlobalService.consoleLog("选择了文件:" + JSON.stringify(file));
        // var index = file.index;
        //反选
        // this.fileList[index].selected = !this.fileList[index].selected;
        file.selected = !file.selected;
        //判断当前是否被选中
        if (file.selected) {
            GlobalService.consoleLog("文件未被选中，直接加入选中列表");
            //选中，添加到选中列表
            GlobalService.consoleLog(this.selectedFiles);
            this.selectedFiles.push(file);
        } else {
            //未选中，需要从列表中删除
            for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
                if (file.name === this.selectedFiles[i].name) {
                    this.selectedFiles.splice(i, 1);
                    break;
                }
            }
        }
        this.setBtnsStatus();
    }

    setBtnsStatus() {
        var ifContainFixedContent = this.checkFixedContent();
        //只要选中至少1个文件，就可删除
        this.canDelete = ifContainFixedContent && this.selectedFiles.length > 0;
        //用户仅选择一个文件时，可以重命名
        this.canRename = ifContainFixedContent && this.selectedFiles.length === 1;
        this.canDetail = ifContainFixedContent && this.selectedFiles.length === 1;

        //用户选择的文件中不包含文件夹时，可以下载
        this.canDownload = ifContainFixedContent && this.selectedFiles.length > 0 && this.selectedFiles.filter((item) => item.type === 1).length === 0;
        this.canMove = ifContainFixedContent && this.selectedFiles.length > 0 && this.selectedFiles.filter((item) => item.type === 1).length === 0;
        GlobalService.consoleLog("当前delete, rename, download的状态分别为:" + [this.canDelete, this.canRename, this.canDownload].join(","));
    }

    clearStatus() {
        this.canDownload = false;
        this.canDelete = false;
        this.canDetail = false;
        this.canMove = false;
        this.canRename = false;
        this.selectedFiles = [];
        this.allBtnsShow = false;
        this.showFileSelect = false;
        this.selectAllStatus = false;
        // this.selectAllStatus = false;
        for(let i = 0, len = this.fileList.length; i < len; i++) {
            this.fileList[i].selected = false;
        } 
        GlobalService.consoleLog("按钮显示状态：" + this.allBtnsShow);
    }

    listFiles() {
        GlobalService.consoleLog("开始加载文件列表数据...");
        var url = this.global.getBoxApi("listClassFolder");
        let start = this.index;
        GlobalService.consoleLog('url' +url) 
        return this.http.post(url, {
            path: '/',
            label: this.classify,
            index: this.index,
            limit: this.pageSize
        })
        .then((res) => {
            this.dataAcquired = true;
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                this.count = res.count;
                if (res.list && res.list.length > 0) {
                    let md5 = '';
                    list = res.list.map((item) => {
                        let test = /(\.HEIC)$/gi;
                        item.name = item.name.replace(/\(\d+\)(\.[^\.]+)$/, "$1");
                        this.classify === 1 && (md5 = Md5.hashStr(item.path + "/" + item.name).toString());
                        if(!test.test(item.name)) { 
                            return {
                                name: item.name,
                                size: item.size,
                                type: 0,
                                displayTime: this.util.getDisplayTime(item.modify_time * 1000),
                                style: this.util.computeFileType(item.name),
                                selected: false,
                                thumbnail: this.global.thumbnailMap[md5] || "",
                                index: this.index + index++,
                                path: item.path
                            }
                        }
                    })
                }
                if(start === 0) {
                    this.fileList = list;
                } else {
                    GlobalService.consoleLog("持续翻页。。。。。");
                    this.fileList = this.fileList.concat(list);
                }
                if(this.classify === 1) {
                    this.util.getThumbnail(this.fileList, true);
                }
                this.cd.detectChanges();
                //获取缩略图
                this.clearStatus();
            }
            return false;
        })
    }


    judgeBusy() {
        return this.global.fileTaskList.some(item => {
            return !item.finished && item.pausing != 'paused' && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash;
        });
    }

    //预置目录检查：不允许用户删除该目录
    checkFixedContent() {
        var fixedContentCheck = this.selectedFiles.filter(item => {
            return item.name === 'Images' || item.name === 'Videos' || item.name === 'Documents' || item.name === 'Musics';
        })
        return fixedContentCheck.length === 0;
    }

    // 长按，显示按钮区域，并将当前文件加入选择list，同时需要更新底部导航栏状态
    showAllBtns(info) {
        this.allBtnsShow = true;
    }

    goBack() {
        this.navCtrl.pop();
    }

    cancelSelect() {
        GlobalService.consoleLog("重置状态");
        this.clearStatus();
    }

    selectAll() {
        GlobalService.consoleLog("用户触发全选，触发的操作是：" + this.selectAllStatus);
        this.selectedFiles = [];
        if(!this.selectAllStatus) {
            GlobalService.consoleLog("当前已经全选");
            for(let i = 0, len = this.fileList.length; i < len; i++) {
                this.fileList[i].selected = true;
                this.selectedFiles.push(this.fileList[i]);
            }            
        } else {
            for(let i = 0, len = this.fileList.length; i < len; i++) {
                this.fileList[i].selected = false;
                this.selectedFiles = [];
            }              
        }
        this.selectAllStatus = !this.selectAllStatus;
        this.setBtnsStatus();
    }

    downloadFileList() {
        if(!this.canDownload) {
            return false;
        }
        GlobalService.consoleLog("开始下载文件");
        if (!this.setSelectedFiles.length) {
            GlobalService.consoleLog("尚未选择文件，无法下载");
            return false;
        }
        var flag = false;
        this.global.createGlobalToast(this, {
            message: this.global.L('StartDownloading')
        })
        for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
            this.transfer.downloadFile(this.selectedFiles[i], this.selectedFiles[i].path);
        }

        this.allBtnsShow = false;
        this.clearStatus();
    }

    deleteFile() {
        if(!this.canDelete) {
            return false;
        }
        if (!this.selectedFiles.length) {
            GlobalService.consoleLog("尚未选择文件，无法删除");
            return false;
        }
        GlobalService.consoleLog("开始删除文件");

        var path = [];
        for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
            path.push(this.selectedFiles[i].path.replace(/\/$/g, '') + "/" + this.selectedFiles[i].name);
        }
        var hasFolder = this.selectedFiles.filter(item=>item.type === 1).length;        
        var self = this;
        this.util.deleteFileDialog(path, hasFolder, ()=>{
            this.resetPageParam();
            //完成删除回调
            this.listFiles();
            this.allBtnsShow = false;
            this.global.createGlobalToast(this, {
                message: Lang.L('WORD57a63e05')
            });
        })
        return true;
    }

    renameFile() {
        if(!this.canRename) {
            return false;
        }
        GlobalService.consoleLog("开始重命名文件");
        if (this.selectedFiles.length !== 1) {
            GlobalService.consoleLog("尚未选择文件，无法删除");
            return false; 
        }
        var selectedFile = this.selectedFiles[0];
        var self = this;
        var sn = selectedFile.name;
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORDae3092c3'),
            // message: selectedFile.type === 1 ? Lang.Lf('WillRenameDirectory', sn) : Lang.Lf('WillRenameFile', sn),
            inputs: [{
                name: 'newName',
                type: 'text',
                value: selectedFile.name,
                placeholder: selectedFile.type === 1 ? Lang.L('PlsInputYourDirectoryName') : Lang.L('PlsInputYourFileName')
            }, ],
            // enableBackdropDismiss: false,
            buttons: [{
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                        // this.global.alertCtrl.dismiss();
                        // this.handleBack();
                    }
                },
                {
                    text: Lang.L('WORD65abf33c'),
                    handler: data => {
                        var name = data.newName.replace(/(^\s+|\s+$)/g,'');
                        if(!name) {
                            this.global.createGlobalToast(this, {
                                message: Lang.L('WORD0f8908c2'),
                                position: 'bottom'
                            });
                            return false;
                        }
                        if(name.length > 60){
                            this.global.createGlobalToast(this, {
                                message: Lang.L('WORDTestLen'),
                                position: 'bottom'
                            })
                            return false;
                        }
                        // if(this.testName.test(name)){
                            name= name.replace(/[\／|*?<>]/g,'');
                        // }
                        GlobalService.consoleLog("重命名文件：" + name + "长度为" + name.length);
                        var selectedFile = this.selectedFiles[0];
                        var prefix = this.selectedFiles[0].path.replace(/\/$/g, '') + "/";  
                        var regex = /\.([^\.])+$/;
                        var oName = this.selectedFiles[0].name;                        
                        self.moveFile(prefix, oName, prefix, name, "rename");
                        return true;
                    }
                }
            ]
        })
        return true;
    }

    moveFile(oldPath, oldName, newPath, newName, type = "rename") {
        var selectedFile = this.selectedFiles[0];
        this.util.moveFile(oldPath, oldName, newPath, newName)
        .then((res) => {
            if (res) {
                GlobalService.consoleLog("重命名成功");
                if(type == 'rename') {
                    selectedFile.name = newName;
                } 
                this.allBtnsShow = false;
                this.global.alertCtrl && this.global.alertCtrl.dismiss();
                let message = "";
                if(type === 'rename') {
                    message = selectedFile.type === 1 ? Lang.L('RenameDirectorySuccess') : Lang.L('RenameFileSuccess'); 
                } else {
                    message = selectedFile.type === 1 ? Lang.L('MoveDirectorySuccess') : Lang.L('MoveFileSuccess');
                }
                this.global.createGlobalToast(this, {
                    message: message
                })
            }
        })
        return true;
    }

    initPage() {
        var type = this.navParams.get("type");
        var config = {
            'image': {
                title: Lang.L('DirImages'),
                path: '/Images',
                label: 1
            },
            'video': {
                title: Lang.L('DirVideos'),
                path: '/Videos',
                label: 2
            },
            'music': {
                title: Lang.L('DirMusics'),
                path: '/Musics',
                label: 3
            },
            'document': {
                title: Lang.L('DirDocuments'),
                path: '/Documents',
                label: 4
            }
        };
        if (config[type]) {
            this.classify = config[type].label;
            this.pageTitle = config[type].title;
            this.currPath = config[type].path;
        } else {
            this.classify = 0;
            var path = this.navParams.get('path');
            var myItem = "";
            for (var item in config) {
                if (config[item].path === path) {
                    myItem = item;
                    break;
                }
            }
            if (myItem) {
                // this.pageTitle = config[myItem].title;
                this.pageTitle = config[myItem].title;
            } else {
                this.showTitle = path.split("/");
                this.pageTitle = this.showTitle[this.showTitle.length-1];
            }
            this.currPath = path;
        }
        this.pageNo = 1;
        this.index = 0;
        this.pageSize = this.classify == 1 ? 32 : 10; 
        this.global.currPath = this.currPath;
        this.dataAcquired = false;
        this.fileList = [];
    }

    resetPageParam() {
        // this.fileList = [];
        this.index = 0;
    }

    closeFileSelect() {
        GlobalService.consoleLog("关闭浮层");
        this.showFileSelect = false;
    }

    openFileSelect() {
        GlobalService.consoleLog("打开浮层");
        this.showFileSelect = true;
    }

    goFolderPage(param) {
        this.navCtrl.push(ClassifyListPage, {
            type: param.type,
            path: param.path
        });
    }

    goNextFolder(info) {
        if(this.allBtnsShow) {
            this.setSelectedFiles(info);
        } else {
            if(info.style == 'image') {
                let test = /(\.HEIC)$/gi;
                if(test.test(info.name)) {
                    this.navCtrl.push(PreviewOtherPage, {
                        currPath: this.currPath,
                        info: info
                    });
                } else {
                    this.navCtrl.push(PreviewImagePage, {
                        currPath: this.currPath,
                        info: info,
                        from: 'classifyList',
                        list: this.fileList,
                        pageIndex: this.pageNo,
                        pageSize: this.pageSize,
                        count: this.count,
                        index: info.index
                    });
                }
            } else {
                this.navCtrl.push(PreviewOtherPage, {
                    currPath: info.path,
                    info: info
                });
                GlobalService.consoleLog("选择了文件，打开文件");
            }            
        }

    }

    addFileDone() {
        this.listFiles();
    }

    goTaskPage() {
        this.navCtrl.push(TaskListPage);
    }

    toggleDetailPage(isShow = false, isPop = null) {
        if(this.classify == 1 || this.allBtnsShow) {
            this.DetailInfo = this.selectedFiles[0];
        }
        if(!this.canDetail && !this.DetailInfo) {
            this.isShowDetail = false;
            return false;
        }
        GlobalService.consoleLog("toggleDetailPage + " +isShow + 'this.DetailInfo' + this.DetailInfo);
        this.isShowDetail = isShow;
    }

    moveSingleFile() {
        if(!this.canMove) {
            this.global.selectFolderType = 'upload';
            return false;
        }
        this.global.selectFolderType = 'move';
        this.navCtrl.push(SelectUploadFolderPage)
    }

    refreshFileList(infiniteScroll) {
        GlobalService.consoleLog("上滑加载")
        this.pageNo++;
        this.index += this.pageSize;
        // this.limit += this.limit;
        if(this.index < this.count) { 
            this.listFiles();
        }
        infiniteScroll.complete();     
    }
}
