import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Lang } from '../../providers/Language';
import { FileManager } from '../../providers/FileManager';
import { FileTransport } from '../../providers/FileTransport';
import { HttpService } from '../../providers/HttpService';
import { Events } from 'ionic-angular';
import { FileDownloader } from '../../providers/FileDownloader';
import { Util } from '../../providers/Util';
import { File } from '@ionic-native/file';
import { Md5 } from 'ts-md5/dist/md5';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { FileDetailPage } from '../../pages/file-detail/file-detail'

/**
 * Generated class for the PreviewImagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-preview-image',
    templateUrl: 'preview-image.html',
})
export class PreviewImagePage {
    @ViewChild(Slides) slides: Slides;

    imageInfo: any = {};
    imageUrl: any = '';
    imageName: any = '';
    currPath: string = '';
    isShowDetail: boolean = false;
    isShowTitle: boolean = false;
    fileList: any = [];
    fromType: string;
    pageIndex: number = 0;

    pageSize: number = 10;
    apiUrl: string;
    apiData: any;
    count: number = 0;
    isHasPath: boolean = false;
    isFindImage: boolean = false; //检查是否找到进入的那个图片
    index: number = 0;
    static _this;
    constructor(public navCtrl: NavController,
        private lang: Lang,
        private global: GlobalService,
        private events: Events,
        private fileManager: FileManager,
        private file: File,
        private transfer: FileTransport,
        private http: HttpService,
        private fileDownloader: FileDownloader,
        private util: Util,
        public navParams: NavParams) {
        PreviewImagePage._this = this;

        events.unsubscribe('image:update', PreviewImagePage.resetName);
        events.subscribe('image:update', PreviewImagePage.resetName);
    }

    static resetName(name) {
        PreviewImagePage._this.imageName = name;
    }

    ionViewDidLoad() {
        PreviewImagePage._this = this;
        // this.global.createGlobalLoading(this, {
        //     message: Lang.L("Loading")
        // });
        GlobalService.consoleLog('ionViewDidLoad PreviewImagePage');
        this.imageInfo = this.navParams.get('info') || {};
        this.currPath = this.navParams.get('currPath');
        this.imageName = this.imageInfo.name || '';
        GlobalService.consoleLog("显示图片" + JSON.stringify(this.imageInfo));
        this.currPath = this.currPath.replace(/\/+$/, '') + '/';
        this.fromType = this.navParams.get('from') || 'classifyList';
        this.fileList = this.navParams.get('list');
        this.pageIndex = this.navParams.get('pageIndex');
        this.pageSize = this.navParams.get('pageSize');
        this.count = this.navParams.get('count');
        this.isHasPath = this.fromType == 'list' ? false : true;
        this.index = this.navParams.get('index') || 0;
        console.log('准备查看第'+this.index+'张图片');
        // this.slides.slideTo(this.index);
        this.slides.initialSlide = this.index;
        this.getPhotoUrl(this.imageInfo);
    }

    getPhotoUrl(task) {
		console.log("即将下载文件：" + JSON.stringify(task))
        this.transfer.getFileLocalOrRemote(task.path, this.global.fileSavePath + this.global.PhotoSubPath + "/", task.name, this.global.PhotoSubPath)
        .then(res => {
			if(res) {
				if(!task.thumbnail) {
					task.thumbnail = res;
				}
				task.photo = res;
				let name = task.name.replace(/\(\d+\)(\.[^\.]+)$/, "$1");
				let md5 = Md5.hashStr(task.path + "/" + name).toString();
				if(!this.global.thumbnailMap[md5]) {
					this.global.thumbnailMap[md5] = res;
				}				
				this.global.photoMap[md5] = res;
			}
            // this.global.closeGlobalLoading(this);  
        })
        .catch(e => {
            // this.global.closeGlobalLoading(this); 
        })

        // this.file.checkFile(this.global.fileSavePath + this.global.PhotoSubPath + "/", task.name)
        // .then(res => {
        //     GlobalService.consoleLog("直接使用本地文件");
        //     this.global.closeGlobalLoading(this);  
        //     task.thumbnail = this.global.fileSavePath + this.global.PhotoSubPath + "/" + task.name;
        // }, res => {
        //     this.file.checkDir(this.global.fileSavePath, this.global.PhotoSubPath)
        //     .then(res => {
        //         return Promise.resolve(true);
        //     }, res => {
        //         return this.file.createDir(this.global.fileSavePath, this.global.PhotoSubPath, true)           
        //     })
        //     .then(res => {
        //         GlobalService.consoleLog("显示图片" + JSON.stringify(task));
        //         let localPath = this.global.fileSavePath + this.global.PhotoSubPath + "/" + task.name,
        //         remotePath;
        //         if(this.fromType == 'list') {
        //             remotePath = this.currPath;
        //         } else {
        //             remotePath = task.path;
        //         }
        //         remotePath = remotePath.replace(/\/$/,'') + '/' + task.name;
        //         console.log('下载地址'  + remotePath);
        //         let downloadTool = this.fileDownloader.createDownloader(localPath, remotePath);
        //         downloadTool.download(localPath, remotePath)
        //         .catch(err => {
        //             GlobalService.consoleLog("下载失败" + JSON.stringify(err));
        //             this.global.closeGlobalLoading(this);  
        //         })
        //         let fileId = this.util.generateFileID(localPath, remotePath, 'download');
        //         GlobalService.consoleLog("本地预览图片的fileId:" + fileId);
        //         this.fileDownloader.onProgress(fileId, (res)=>{
        //             if(res.totalsize === res.downloadsize) {
        //                 console.log("文件下载完成......");
        //                 task.thumbnail = localPath;
        //                 this.global.closeGlobalLoading(this);
        //             }
        //         })
        //         this.fileDownloader.onFailure(fileId, (res) => {
        //             this.global.closeGlobalLoading(this);
        //         })
        //     })            
        // })
        // .catch(e => {
        //     this.global.closeGlobalLoading(this);            
        // })
    }


    goDetailPage() {
        this.navCtrl.push(FileDetailPage, {
            info: this.imageInfo
        })
    }

    getApiData() {
        if(this.fromType == 'list') {
            this.apiUrl = this.global.getBoxApi("listFolder");
            this.apiData = {
                path: this.currPath
            }
        } else {
            this.apiUrl = this.global.getBoxApi("listClassFolder");
            this.apiData = {
                path: '/',
                label: 1,
                index: this.pageIndex,
                limit: this.pageSize
            };
        }
    }
    getFileList() {
        this.getApiData();
        this.http.post(this.apiUrl, this.apiData)
        .then((res) => {
            if (res.err_no === 0) {
                var list = [];
                var index = 0;
                if (res.list && res.list.length > 0) {
                    list = res.list.filter((item) => {
                        let md5;
                        if(this.isHasPath) {
                            md5 = Md5.hashStr(item.path + "/" + item.name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
                        } else {
                            md5 = Md5.hashStr(this.currPath + "/" + item.name.replace(/\(\d+\)(\.[^\.]+)$/, "$1")).toString();
                        }
                        let test = /(\.HEIC)$/gi;
                        if(!test.test(item.name) && this.util.computeFileType(item.name, item.type) == 'image') { 
                            return {
                                name: item.name,
                                size: item.size,
                                type: item.type,
                                displayTime: this.util.getDisplayTime(item.modify_time * 1000),
                                fileStyle: this.util.computeFileType(item.name, item.type),
                                selected: false,
                                thumbnail: this.global.thumbnailMap[md5] || "",
                                photo: this.global.photoMap[md5] || "",
                                index: index++,
                                path: item.path || ""
                            }
                        }
                        
                    })
                    console.log('list.length' + list.length)
                }
                
                this.count = res.count;
                if(this.pageIndex === 0) {
                    GlobalService.consoleLog("第一页，重置数据:");
                    this.fileList = list;
                } else {
                    GlobalService.consoleLog("持续翻页。。。。。");
                    this.fileList = this.fileList.concat(list);
                }
                this.transfer.getThumbnail(this.fileList, this.isHasPath, this.currPath); 
            }
            return false;
        })
    }

    goBack() {
        this.navCtrl.pop();
    }

    toggleTitle() {
        this.isShowTitle = !this.isShowTitle;
    }

    slideChanged() {
        let currentIndex = this.slides.getActiveIndex();
		console.log('Current index is' + currentIndex);
		if(currentIndex == this.imageInfo.index) {
			//正在下载中....
			return false;
		}
        this.imageName = this.fileList[currentIndex].name;
        this.imageInfo = this.fileList[currentIndex];
        if(this.fromType != 'list') {
            this.currPath = this.imageInfo.path;
        }
        this.getPhotoUrl(this.fileList[currentIndex]);
        if(currentIndex == (this.fileList.length - 1)) {
            if(this.fileList.length < this.count) {
                this.pageIndex += this.pageSize;
                if(this.pageIndex < this.count) { 
                    this.getFileList();
                }
            }
		}
		return true;
    }

}
