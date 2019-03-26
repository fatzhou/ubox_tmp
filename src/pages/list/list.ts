import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { ChangeDetectorRef } from '@angular/core';
import { FileManager } from '../../providers/FileManager';

import { HttpService } from '../../providers/HttpService';
import { Events, App } from 'ionic-angular';
// import { FileTransport, FileUploadOptions, FileTransportObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { Lang } from "../../providers/Language";
import { TaskListPage } from '../task-list/task-list';
import { Md5 } from 'ts-md5/dist/md5';
import { Platform } from 'ionic-angular';
import { FileTransport } from '../../providers/FileTransport';
import { PreviewImagePage } from '../preview-image/preview-image';
import { PreviewOtherPage } from '../preview-other/preview-other';
import { SelectUploadFolderPage } from '../../pages/select-upload-folder/select-upload-folder'
import { Storage } from '@ionic/storage';
import { FileDetailPage } from '../../pages/file-detail/file-detail'
import { DeviceGuidancePage } from '../../pages/device-guidance/device-guidance'
import { DeviceManagePage } from '../../pages/device-manage/device-manage'
import { MenuController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
// import { AddFileComponent } from '../../components/add-file/add-file';
// import { Util } from '../../providers/Util';
/**
 * Generated class for the ListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova;
@Component({
    selector: 'page-list',
    templateUrl: 'list.html',
})
export class ListPage {
    showFileSelect: Boolean = false;
    pageTitle: any = Lang.L('DirAllFiles');
    currPath: any = "";
    allFileList: any = []; //总文件数组
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
    // @ViewChild(AddFileComponent) addfile: AddFileComponent;
    pageNo: number = 1;
    pageSize: number = 10;
    detailInfo: any = null;
    isShowDetail: boolean = false;
    hideAddBtn: boolean = true;
    // tasklistlen:number = 0;
    // fileSavePath:string = '';
    isShowType: boolean = false;
    static _this;
    type0List: any = [];
    type1List: any = [];
    isShowType0List: boolean = true;
    isShowType1List: boolean = true;
    isShowBox: boolean = false;
	isShowClassifyNav: boolean = false;
	rootPage:any = TabsPage;
    // isShowAside: boolean = false;
    constructor(public navCtrl: NavController,
        public global: GlobalService,
        private cd: ChangeDetectorRef,
        public util: Util,
        public http: HttpService,
        private events: Events,
        private toastCtrl: ToastController,
        private platform: Platform,
        private file: File,
        private storage: Storage,
        private fileManager: FileManager,
        private transfer: FileTransport,
        private app: App,
		private menuCtrl: MenuController,
        public navParams: NavParams) {
        
        ListPage._this = this;

        this.events.unsubscribe('file:updated', ListPage.updateFilesEvent);
        this.events.unsubscribe('image:move', ListPage.moveFilesEvent);
        this.events.unsubscribe('list:change', ListPage.moveChangeList);
        this.events.subscribe('file:updated', ListPage.updateFilesEvent);
        this.events.subscribe('image:move', ListPage.moveFilesEvent);
        this.events.subscribe('list:change', ListPage.moveChangeList);
    }

    ionViewDidEnter() {
        GlobalService.consoleLog("获取磁盘信息");
        // this.getDiskStatus();
        // this.getMiningInfo();
        if(!this.fileManager.readPermitted && this.global.centerUserInfo.bind_box_count > 0) {
            // this.isShowBox = true;
            this.fileManager.getPermission()
            .then(res => {
                this.getFileInfo();
            }, () => {
                this.isShowBox = false; //true
            })
        } 
        this.global.currPath = this.currPath;
        if(this.currPath == '/') {
            setTimeout(()=>{
                this.hideAddBtn = false;
            },100)
        } else {
            this.hideAddBtn = false;
        }
        
        ListPage._this = this;
    }

    ionViewDidLeave() {
        this.hideAddBtn = true;
        //保存缩略图map到缓存
        this.showFileSelect = false;
        this.isShowClassifyNav = false;
        this.storage.set('thumbnailMap', JSON.stringify(this.global.thumbnailMap));
        // this.events.unsubscribe('file:updated', this.updateFilesEvent)
        // // events.unsubscribe('image:move');
        // this.events.unsubscribe('image:move', this.moveFilesEvent);
    }

    ionViewDidLoad() {
        
        GlobalService.consoleLog('ionViewDidLoad ListPage');
        if (this.global.deviceSelected) {
            this.initPage();
            this.events.unsubscribe(this.currPath + ":succeed");
            this.events.subscribe(this.currPath + ':succeed', this.listFiles.bind(this));
            this.listFiles();
        }
        GlobalService.consoleLog("this.currPath" + this.currPath)
    }

    static updateFilesEvent(task) {
        let _this = ListPage._this;
        GlobalService.consoleLog("文件更新，刷新列表:" + JSON.stringify(task));
        if(!task || task.action === 'upload') {
            _this.listFiles();
        }
    }

    static moveFilesEvent() {
        let _this = ListPage._this;
        GlobalService.consoleLog("文件移动成功，更新数据 list" + _this.selectedFiles.length);

        for(let i = 0; i < _this.selectedFiles.length; i++) {
            _this.moveFile(_this.currPath.replace(/\/$/g, '') + "/", _this.selectedFiles[i].name, _this.global.currPath.replace(/\/$/g, '') + "/", _this.selectedFiles[i].name, "move");
        }        
    }
    
    static moveChangeList(selectedFile) {
        let _this = ListPage._this;
        let index0 = _this.type0List.findIndex(item => {
            return item.name == selectedFile.name
        })
        let index1 = _this.type1List.findIndex(item => {
            return item.name == selectedFile.name
        })
        GlobalService.consoleLog('返回移动的元素的索引');
        _this.type0List.splice(index0, 1);
        _this.type1List.splice(index1, 1);
        _this.events.publish(_this.global.currPath + ':succeed');
    }
    
    setShowType(isShow) {
        this.isShowType = isShow;
    }
    
    pretify(name) {
        if(name.length < 22) {
            return name;
        } else {
            return name.slice(0, 12) + '...' + name.slice(-8);
        }
    }

    hasThumbnail(type) {
        if(type === 'image') {
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
        this.canMove = ifContainFixedContent && this.selectedFiles.length === 1;

        //用户选择的文件中不包含文件夹时，可以下载
        this.canDownload = ifContainFixedContent && this.selectedFiles.length > 0 && this.selectedFiles.filter((item) => item.type === 1).length === 0;
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
        for(let i = 0, len = this.type0List.length; i < len; i++) {
            this.type0List[i].selected = false;
        } 
        for(let i = 0, len = this.type1List.length; i < len; i++) {
            this.type1List[i].selected = false;
        } 
        GlobalService.consoleLog("按钮显示状态：" + this.allBtnsShow);
    }

    listFiles() {
        GlobalService.consoleLog("开始加载列表数据...");
        var url = this.global.getBoxApi("listFolder");
        return this.http.post(url, {
            path: this.currPath
        })
        .then((res) => {
            this.dataAcquired = true;
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                if (res.list && res.list.length > 0) {
                    this.type0List = [];
                    this.type1List = [];
                    res.list.filter((item) => {
                        let name = item.name.replace(/\(\d+\)(\.[^\.]+)$/, "$1");
                        let md5 = Md5.hashStr(this.currPath + "/" + name).toString();
                        if(item.type == 1) {
                            this.type0List.push({
                                name: item.name,
                                size: item.size,
                                type: item.type,
                                path: this.currPath,
                                displayTime: this.util.getDisplayTime(item.modify_time * 1000),
                                fileStyle: this.util.computeFileType(item.name, item.type),
                                selected: false,
                                thumbnail: this.global.thumbnailMap[md5] || "",
                                index: index++
                            });
                        } else {
                            this.type1List.push({
                                name: item.name,
                                size: item.size,
                                type: item.type,
                                path: this.currPath,
                                displayTime: this.util.getDisplayTime(item.modify_time * 1000),
                                fileStyle: this.util.computeFileType(item.name, item.type),
                                selected: false,
                                thumbnail: this.global.thumbnailMap[md5] || "",
                                index: index++
                            });
                        }
                    })
                    list = this.type0List.concat(this.type1List);
                }

                this.allFileList = list;
                this.fileList = this.allFileList.slice(0, this.pageSize)
                this.transfer.getThumbnail(this.fileList, false, this.currPath);                    

                // this.cd.detectChanges();
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
    showAllBtns() {
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
            for(let i = 0, len = this.type0List.length; i < len; i++) {
                this.type0List[i].selected = true;
                this.selectedFiles.push(this.type0List[i]);
            } 
            for(let i = 0, len = this.type1List.length; i < len; i++) {
                this.type1List[i].selected = true;
                this.selectedFiles.push(this.type1List[i]);
            }           
        } else {
            for(let i = 0, len = this.type0List.length; i < len; i++) {
                this.type0List[i].selected = false;
            }   
            for(let i = 0, len = this.type1List.length; i < len; i++) {
                this.type1List[i].selected = false;
            }         
            this.selectedFiles = [];     
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
        this.global.createGlobalToast(this, {
            message: this.global.L('StartDownloading')
        })
        var flag = false;
        for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
			let selected = this.selectedFiles[i];
			let subFoldPath = {
				'image': this.global.PhotoSubPath,
				'video': this.global.VideoSubPath,
				'music': this.global.MusicSubPath
			}[selected.fileStyle] || this.global.DocSubPath;
			this.transfer.downloadFile({
				name: selected.name,
				fileStyle: selected.fileStyle
			}, this.currPath + selected.name, this.global.fileSavePath + subFoldPath + '/' + selected.name);
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
            path.push(this.currPath.replace(/\/$/g, '') + "/" + this.selectedFiles[i].name);
        }
        var hasFolder = this.selectedFiles.filter(item=>item.type === 1).length;        
        var self = this;
        this.util.deleteFileDialog(path, hasFolder, ()=>{
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
                        if(name.length>60){
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
                        var prefix = this.currPath.replace(/\/$/g, '') + "/";  
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
        console.log('list move   ssss' + this.selectedFiles.length)
        var selectedFile = this.selectedFiles[0];
        
        this.util.moveFile(oldPath, oldName, newPath, newName)
        .then((res) => {
            if (res) {
                GlobalService.consoleLog("重命名成功");
                this.listFiles();
                this.allBtnsShow = false;
                this.global.alertCtrl && this.global.alertCtrl.dismiss();
                let message = "";
                if(type === 'rename') {
                    message = selectedFile.type === 1 ? Lang.L('RenameDirectorySuccess') : Lang.L('RenameFileSuccess'); 
                } else {
                    message = selectedFile.type === 1 ? Lang.L('MoveDirectorySuccess') : Lang.L('MoveFileSuccess');
                    ListPage.moveChangeList(selectedFile);
                }
                this.global.createGlobalToast(this, {
                    message: message
                });
                this.cancelSelect();
            }
        })
        return true;
    }

    initPage() {
        var type = this.navParams.get("type");
        var config = {
            'all': {
                title: Lang.L('DirAllFiles'),
                path: "/"
            },
            'image': {
                title: Lang.L('DirImages'),
                path: '/Images',
            },
            'video': {
                title: Lang.L('DirVideos'),
                path: '/Videos',
            },
            'music': {
                title: Lang.L('DirMusics'),
                path: '/Musics',
            },
            'document': {
                title: Lang.L('DirDocuments'),
                path: '/Documents',
            }
        };
        if (config[type]) {
            // this.pageTitle = config[type].title;
            this.pageTitle = config[type].title;
            this.currPath = config[type].path;
        } else {
            var path = this.navParams.get('path') || '/';
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
        this.global.currPath = this.currPath;
        this.dataAcquired = false;
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
        this.app.getRootNav().push(ListPage, {
            type: param.type,
            path: param.path
        });
    }

    goNextFolder(file) {
        if(this.allBtnsShow) {
            this.setSelectedFiles(file);
        } else {
            if (file.type === 1) {
                GlobalService.consoleLog("选择了文件夹，进入文件夹");
                this.app.getRootNav().push(ListPage, {
                    type: "",
                    path: this.currPath.replace(/\/$/g, '') + "/" + file.name
                });
            } else if(file.fileStyle == 'image') {
                let test = /(\.HEIC)$/gi;
                if(test.test(file.name)) {
                    this.app.getRootNav().push(PreviewOtherPage, {
                        currPath: this.currPath,
                        info: file
                    });
                } else {
                    let list = this.allFileList.filter(item => {
                        return item.fileStyle == 'image' && !test.test(item.name)
                    });
                    let index = 0;
                    for(let i = 0; i < list.length; i++) {
                        if(list[i].name == file.name) {
                            index = i;
                            break;
                        }
                    }
                    this.app.getRootNav().push(PreviewImagePage, {
                        currPath: this.currPath,
                        info: file,
                        from: 'list',
                        list: list,
                        pageIndex: this.pageNo,
                        pageSize: this.pageSize,
                        count: list.length,
                        index: index
                    });
                }
            } else {
                this.app.getRootNav().push(PreviewOtherPage, {
                    currPath: this.currPath,
                    info: file
                });
                GlobalService.consoleLog("选择了文件，打开文件");
            }            
        }

    }

    addFileDone() {
        this.listFiles();
    }

    goTaskPage() {
        this.app.getRootNav().push(TaskListPage);
    }

    toggleDetailPage(detail, isShow = false) {
        if(this.allBtnsShow) {
            this.detailInfo = this.selectedFiles[0];
        } else if(detail) {
            this.detailInfo = detail;
        }
        if(!this.canDetail && !this.detailInfo) {
            this.isShowDetail = false;
            return false;
        }
        GlobalService.consoleLog("toggleDetailPage + " +isShow);
        this.isShowDetail = isShow;
    }

    moveSingleFile() {
        if(!this.canMove) {
            this.global.selectFolderType = 'upload';
            return false;
        }
        this.global.selectFolderType = 'move';
        this.app.getRootNav().push(SelectUploadFolderPage)
    }

    closeTypeList() {
        if(this.isShowType) {
            this.events.publish('type-list:close',false);
        }
    }

    noPhoto() {
        GlobalService.consoleLog('没有拿到img');
        // photo.thumbnail = '';
    }

    toggleListStatus(status) {
        if(status == 0) {
            this.isShowType0List = !this.isShowType0List
        } else {
            this.isShowType1List = !this.isShowType1List
        }
    }

    getFileInfo() {
        // HomePage._this = this;
        if(this.fileManager.readPermitted) {
            if(!this.fileManager.photoLibraryReady) {
                this.fileManager.initFileList();
            }
            if(this.global.deviceSelected) {
                console.log(JSON.stringify(this.global.deviceSelected))
                let config = this.fileManager.resourceStorage['image'];
                console.log("图片配置：" + JSON.stringify(config));
                if(config.finished) {
                    console.log("图片获取已完成，直接备份");
                    setTimeout(() => {
                        this.fileManager.startBackUp();
                    }, 1000)
                } else if(this.platform.is('cordova')) {
                    console.log("图片获取尚未完成，需要先拉配置");
                    this.fileManager.getBackupInfo()
                    .then(res => {
                        this.fileManager.fetchAlbums('image')
                    })
                    .catch(e => {
                        //不需要备份
                    })
                }            
            }            
        }
    }


    goDetailPage(info) {
        this.app.getRootNav().push(FileDetailPage, {
            info: info
        })
    }

    toggleClassifyNav(isShow = null) {
        if(isShow != null) {
            this.isShowClassifyNav = false;
        } else {
            this.isShowClassifyNav = !this.isShowClassifyNav;
        }
    }

    displayMenu() {
		console.log("即将显示左侧菜单........");
		this.menuCtrl.open();
    }


    goDeviceGuidance() {
        this.app.getRootNav().push(DeviceGuidancePage)
    }

    goDeviceManage() {
        this.app.getRootNav().push(DeviceManagePage)
    }
}
