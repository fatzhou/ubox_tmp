import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { HttpService } from '../../providers/HttpService';
import { Events, App } from 'ionic-angular';
import { Md5 } from 'ts-md5/dist/md5';
import { Util } from '../../providers/Util';
import { FileTransport } from '../../providers/FileTransport';
import { SelectUploadFolderPage } from '../../pages/select-upload-folder/select-upload-folder'
import { SelectAudioVideoPage } from '../../pages/select-audio-video/select-audio-video';
import { SelectFolderPage } from '../../pages/select-folder/select-folder'
import { SelectAlbumPage } from '../../pages/select-album/select-album'
import { Platform } from 'ionic-angular';

// import { ImagePicker } from '@ionic-native/image-picker';
// import { MediaPicker } from '@ionic-native/media-picker';
// declare var MediaPicker: any;
// declare var window;


/**
 * Generated class for the AddFileComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
// declare var imagePicker;
@Component({
    selector: 'add-file',
    templateUrl: 'add-file.html'
})
export class AddFileComponent {
    fileDoneFlag:Boolean = false;
    totalSize:any = 0;
    tasklistlen:number = 0;
    plat:string = 'android';

    @Input() currPath: string;
    @Input() eventType: string;
    @Input() allBtnsShow: string;
    @Output() addFileDone = new EventEmitter < any > ();
    @Output() selectFileDone = new EventEmitter < any > ();
    @Output() closeFileSelect = new EventEmitter < any > ();
    
    constructor(
        private camera: Camera,
        private events: Events,
        private http: HttpService,
        private util: Util,
        private transfer: FileTransport,
        private global: GlobalService,
        public navCtrl: NavController,
        private app: App,
        private platform: Platform,
        public navParams: NavParams,
    ) {        
        GlobalService.consoleLog("文件筛选构造:" + this.currPath);
        try {
            var box = this.global.diskInfo;
            var disk = box.disks && box.disks[0];
            if (disk) {
                this.totalSize = this.util.cutFloat((disk.total - disk.usage) / GlobalService.DISK_G_BITS, 2);
            } else {
                this.totalSize = '--';
            }
            this.plat = this.platform.is('android') ? 'android' : 'ios';
        } catch(e) {
            GlobalService.consoleLog(e);
        }
    }

    // selectLocalFile(type) {
    //     GlobalService.consoleLog("浏览文件");
    //     var camera = this.camera;
    //     var mediaType = {
    //         "image": 0,
    //         "video": 1,
    //         "music": 3,
    //         "document": 4,
    //         "all": 2
    //     };
    //     let cameraOptions = {
    //         sourceType: camera.PictureSourceType.PHOTOLIBRARY,
    //         destinationType: camera.DestinationType.FILE_URI,
    //         quality: 100,
    //         correctOrientation: true,
    //         mediaType: mediaType[type]
    //     }
    //     console.log("选择文件类型：" + type + "," + mediaType[type]);

    //     camera.getPicture(cameraOptions)
    //     .then(file_uri => {
    //         GlobalService.consoleLog("成功选择文件：" + file_uri);
    //         if(!file_uri.startsWith("file://")) {
    //             file_uri = "file://" + file_uri;
    //         }
    //         this.selectFileDone.emit({
    //             file_uri
    //         });
    //         this.transfer.uploadSingleFile(file_uri, this.currPath);
    //     }, err => {
    //         GlobalService.consoleLog(err)
    //     });
    // }

    closeFileSelectEvent() {
        GlobalService.consoleLog("关闭浮层事件触发");
        this.closeFileSelect.emit();
    }

    makeFolder() {
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD7c5e25c1'),
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
                                    this.closeFileSelectEvent();
                                    if(this.eventType === 'home') {
                                        this.events.publish("home:succeed");
                                    } else if(this.eventType === 'list') {
                                        this.events.publish(this.currPath + ":succeed");
                                    }
                                    this.global.closeGlobalAlert(this);
                                    this.global.createGlobalToast(this, {
                                        message: Lang.L('WORD3eca2610'),
                                    })
                                }
                            })
                        }
                        return true;
                    }
                }
            ]
        })
    }

    goSelectPage(type,currPath) {
        this.global.selectFolderType = 'upload';
        this.global.eventType = this.eventType;
        this.global.currPath = currPath;
        // console.log('type' + type);
        this.closeFileSelect.emit();
        let selectedName = '';
        selectedName = currPath == '/' ? Lang.L('DirAllFiles') : currPath.split('/')[currPath.split('/').length -1];
        this.global.selectedUploadFolderName = selectedName;

        if(type == 'image') {
            this.app.getRootNav().push(SelectAlbumPage, {
                type: type
            });
        } else if(type == 'audio' || type === 'video' || type == 'document') {
            // this.global.selectDataType = type;
            this.app.getRootNav().push(SelectAudioVideoPage, {
                type: type
            });
        } else if(type == 'all') {
            this.app.getRootNav().push(SelectFolderPage, {
                url: this.global.fileRootPath
            });
        } else if(type == 'create') {
            this.app.getRootNav().push(SelectUploadFolderPage,{
                "type" : true,
                "count" : 0,
                "currPath" : this.currPath,
                // "selectedName": selectedName
            });
        }
    }

    

}
