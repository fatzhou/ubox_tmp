import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Platform } from 'ionic-angular';
import { BtSetDiskPage } from '../bt-set-disk/bt-set-disk'
import { FileTransport } from '../../providers/FileTransport';
import { FileManager } from '../../providers/FileManager';
import { Md5 } from "ts-md5/dist/md5";
import { FileUploader } from '../../providers/FileUploader';

declare var cordova;
declare var window;
/**
 * Generated class for the SelectImgPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-img',
    templateUrl: 'select-img.html',
})
export class SelectImgPage {
    isAllFile: boolean = false;
    isAllSelected: boolean = false;
    currPath: string = "/";
    photos: any = [];
    albumId: any;
    albumTitle: any;
    albums: any;
    type: any;
    canUpload: boolean = false;
    unUploadedCount: number = 0;
    totalCount: number = 0;
    pageNo: number = 1;
    pageAllNo: number = 1;
    pageSize: number = 30;
    selectedFileList: any = [];
    fileList: any = [];
    isShowFooter: boolean = false;
    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        private transfer: FileTransport,
        private fileManager: FileManager,
        private fileUploader: FileUploader,
        private platform: Platform,
        private global: GlobalService,
        private events: Events,
        private util: Util,
    ) {
    }
    
    ionViewDidEnter() {
        this.isShowFooter = false;
    }

    ionViewWillLeave() {
        this.isShowFooter = true;
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad SelectImgPage');
        this.albums = this.navParams.get('album') || {};
        this.type = this.navParams.get('type') || {};
        this.currPath = this.global.currPath;
        // this.photos = this.albums.content.slice(0, this.pageSize);
        this.totalCount = this.albums.content.length || 0 ;
        this.filterUploadFlag();
        // this.events.subscribe('file:updated', this.updateTaskStatus);
    }


    updateTaskStatus(task) {
        GlobalService.consoleLog("Select-img: 任务上传成功");
        // task.uploaded = true;
        // this.unUploadedCount = this.unUploadedCount + 1;
    }    

    goBtSetDiskPage() {
        this.navCtrl.push(BtSetDiskPage);
    }
    
    /**
     * [filterUploadFlag 计算图片是否上传的标记]
     */
    filterUploadFlag() {
        let globalTask = this.global.fileTaskList.filter(item => item.action === 'upload' && item.fileStyle == 'image');
        let count = 0;
        let content = this.albums.content;

        for(let i = 0, len = content.length; i < len; i++) {
            let id = content[i].id;
            content[i].isSelected = false;
            let uploadTask = globalTask.find(item => {
                return id === item.fileId;
            });
            if(uploadTask) {
                content[i].uploaded = true;
                count++;
            } else {
                content[i].uploaded = false;
            }
        }        

        this.unUploadedCount = this.totalCount - count; 
        this.filterPhotos();
    }

    filterPhotos() {
        let photos = this.albums.content.filter(item => !item.uploaded);
        this.photos = photos.slice(0, this.pageNo * this.pageSize);
    }

    toggleAllFile(isAllFile) {
        this.isAllFile = isAllFile;
        if(this.isAllFile) {
            this.photos = this.albums.content.slice(0, this.pageAllNo * this.pageSize);
        } else { 
            this.filterPhotos();
        }
    }

    toggleAllSelected() {
        this.isAllSelected = !this.isAllSelected;
        this.canUpload = this.isAllSelected;
        this.photos.map((item) => {
            item.isSelected = this.isAllSelected;
        });
    }

    toggleSelectedImg(photo) {
        photo.isSelected = !photo.isSelected;
        if(photo.isSelected) {
            //全选按钮
            this.isAllSelected = !this.photos.some((item) =>  item.isSelected == false );
            //上传按钮
            this.canUpload = true;
        } else {
            //全选按钮
            this.isAllSelected = false;
            //上传按钮
            this.canUpload = this.photos.some(item => item.isSelected == true);
        }
    }

    // uploadThumbnail(photoLibrary) {
    //     let path = this.global.ThumbnailRemotePath;
    //     let md5 = Md5.hashStr(this.global.currPath + "/" + photoLibrary.fileName).toString();
    //     //计算缩略图名字
    //     let thumbnailName = md5 + ".png";
    //     let uploadUrl = this.global.getBoxApi('uploadFileBreaking');
    //     //上传第i张图片的缩略图
    //     GlobalService.consoleLog("准备存储缩略图和上传缩略图")
    //     return new Promise((resolve, reject) => {
    //         this.fileManager.saveThumbnail(photoLibrary, thumbnailName, (thumbnailFolderPath) => {
    //             let folder = thumbnailFolderPath.replace(/\/[^\/]+$/, '') + "/";
    //             //上传至服务器
    //             GlobalService.consoleLog("开始上传缩略图到服务器...." + folder + "," + thumbnailName + "," + path);
    //             this.fileManager.uploadThumbnail(folder, thumbnailName, path)
    //             .then(res => {
    //                 this.global.thumbnailMap[md5] = thumbnailFolderPath;
    //                 resolve(thumbnailFolderPath);
    //             })
    //             .catch(e => {
    //                 reject();
    //             })
    //         });                 
    //     })
    // }

    uploadOneImg(uploadingList, index) {
        let uploadItem = uploadingList[index];

        let callback = () => {
            index++;
            if(index < uploadingList.length) {
                setTimeout(() => {
                    this.uploadOneImg(uploadingList, index)
                }, 500);
            }             
        }

        return this.fileManager.getNativeUrl(uploadItem)
        .then(res => {
            let fileUrl = res;
            GlobalService.consoleLog("即将上传文件：" + fileUrl);
            setTimeout(() => {
                // this.uploadThumbnail(uploadItem)
                // .then(res => {
                    let md5 = Md5.hashStr(this.currPath.replace(/\/$/, '') + "/" + uploadItem.fileName).toString();
                    console.log('this.currPath   ' + this.currPath)
					this.global.thumbnailMap[md5] = uploadItem.thumbnailURL;
                    this.transfer.uploadSingleFile(fileUrl, this.currPath, {
						// thumbnail: res,
						id: uploadItem.id,
						thumbnail: uploadItem.thumbnail
					});
                    callback();
                // })
                // .catch(e => {
                //     callback();
                // })
            }, 100);
        })
        .catch(e => {
            //保存文件到本地失败
            callback();
        })          
    }

    uploadImg() {
        let uploadingList = this.photos.filter((item) => item.isSelected == true && (this.isAllFile || !item.uploaded) );
        if(!uploadingList.length) {
            GlobalService.consoleLog("没有需要上传的文件");
            return false;
        }

        var uploadUrl = this.global.getBoxApi('uploadFileBreaking');
        GlobalService.consoleLog(' uploadingList[i]e   : ' + JSON.stringify(uploadingList[0]))
        //提示正在上传图片
        this.global.createGlobalToast(this, {
            message: this.global.L('FileUploading')
        });
        this.unUploadedCount = this.unUploadedCount - uploadingList.length;
        uploadingList.forEach(item => {
            item.isSelected = false;  
            //TODO: 已上传列表需删除              
            item.uploaded = true;
        })

        this.uploadOneImg(uploadingList, 0);
        this.util.popToPage(this, 3);
    }

    refreshFileList(infiniteScroll) {
        GlobalService.consoleLog("上滑加载")
        if(this.isAllFile) {
            let number = this.pageAllNo * this.pageSize;
            //所有文件
            if(number < this.albums.content.length) {
                this.pageAllNo++;
                this.photos = this.albums.content.slice(0, number + this.pageSize);  
            }
        } else {
            let content = this.albums.content.filter(item => !item.uploaded);
            let number = this.pageNo * this.pageSize;
            if(number < content.length) {
                this.pageNo++;
                this.photos = content.slice(0, number + this.pageSize);  
            }
        }
        infiniteScroll.complete();
    }
}
