import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { BtSetDiskPage } from '../bt-set-disk/bt-set-disk'
import { Util } from '../../providers/Util';
import { FileTransport } from '../../providers/FileTransport';
import { FileUploader } from '../../providers/FileUploader';
import { Events } from 'ionic-angular';
import { FileManager } from '../../providers/FileManager';

/**
 * Generated class for the SelectAudioVideoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-audio-video',
    templateUrl: 'select-audio-video.html',
})
export class SelectAudioVideoPage {
    isAllFile: boolean = false;
    isAllSelected: boolean = false;
    fileList: any = [];
    allFileList: any = [];
    dataType: any = 'music';
    canUpload: boolean = false;
    dataReady: boolean = false;
    pageNo: number = 1;
    pageAllNo: number = 1;
    pageSize: number = 20;
    unUploadedCount: number = 0;
    totalCount: number = 0;
    isShowFooter: boolean = false;
    platformName: any = '';

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private transfer: FileTransport,
        private util: Util,
        private events: Events,
        private fileManager: FileManager,
        private fileUploader: FileUploader,
    ) {
        this.events.subscribe('taskList:changed', ()=>{
            //任务变更，需重新计数
            this.filterUploadFlag();
        })
    }
    ionViewDidEnter() {
        this.isShowFooter = false;
    }

    ionViewWillLeave() {
        this.isShowFooter = true;
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad SelectAudioVideoPage');
        this.platformName = this.global.platformName;
        this.dataType = this.navParams.get('type');
        // GlobalService.consoleLog("资源状态：" + this.fileManager.scanDiskReady);
        this.fileManager.getLocalFiles(this.dataType)
        .then(res => {
            this.getFileByType();
            this.filterUploadFlag();              
        })
        .catch(e => {
            GlobalService.consoleLog("获取相册及图片出错：" + e.message || e.stack)
        }) 
        GlobalService.consoleLog("this.fileList   :" + JSON.stringify(this.fileList));
    }

    getFileByType() {
        let config = this.fileManager.resourceStorage[this.dataType];
        this.allFileList = this.global[config.name];
        this.totalCount = this.allFileList.length;
        GlobalService.consoleLog("总条目数：" + this.totalCount); 
        // this.fileList = this.allFileList.slice(0, this.pageNo * this.pageSize);
        GlobalService.consoleLog('this.fileList' + JSON.stringify(this.fileList));
    }

    /**
     * [filterUploadFlag 计算图片是否上传的标记]
     */
    filterUploadFlag() {
        let globalTask = this.global.fileTaskList.filter(item => {
            if(this.dataType == 'video' || this.dataType == 'music') {
                return item.fileStyle === {'video':'video','audio':'music','document':'doc'}[this.dataType] && item.action === 'upload';
            } else {
                return item.fileStyle != ('video' || 'music' || 'image') && item.action === 'upload';
            }
        });
        let count = 0;

        for(let i = 0, len = this.allFileList.length; i < len; i++) {
            let id = this.allFileList[i].id;
            this.allFileList[i].isSelected = false;
            let uploadTask = globalTask.find(item => {
                return id === item.fileId;
            });
            if(uploadTask) {
                this.allFileList[i].uploaded = true;
                count++;
            } else {
                this.allFileList[i].uploaded = false;
            }
        }
        GlobalService.consoleLog("已上传文件：" + count + ",总文件数目：" + this.totalCount);
        this.unUploadedCount = this.totalCount - count; 
        this.filterFiles();
    }

    filterFiles() {
        let fileList = this.allFileList.filter(item => !item.uploaded);   
        this.fileList = fileList.slice(0, this.pageNo * this.pageSize);   
    }

    toggleAllFile(isAllFile) {
        this.isAllFile = isAllFile;
        if(this.isAllFile) {
            this.fileList = this.allFileList.slice(0, this.pageAllNo * this.pageSize);
        } else { 
            this.filterFiles();
        }
    }

    toggleAllSelected() {
        this.isAllSelected = !this.isAllSelected;
        this.canUpload = this.isAllSelected;
        this.fileList.map((item) => {
            item.isSelected = this.isAllSelected;
        });
    }

    toggleSelect(info) {
        info.isSelected = !info.isSelected;
        if(info.isSelected) {
            //全选按钮
            this.isAllSelected = !this.fileList.some((item) =>  item.isSelected == false );
            //上传按钮
            this.canUpload = true;
        } else {
            //全选按钮
            this.isAllSelected = false;
            //上传按钮
            this.canUpload = this.fileList.some(item => item.isSelected == true);
        }
    }

    goBtSetDiskPage() {
        this.navCtrl.push(BtSetDiskPage);
    }

    uploadOneFile(uploadingList, index) {
        let uploadItem = uploadingList[index];
        return this.fileManager.getNativeUrl(uploadItem)
        .then(res => {
            let fileUrl = res;
            GlobalService.consoleLog("即将上传文件：" + fileUrl);
            this.transfer.uploadSingleFile(fileUrl, this.global.currPath, {
				id: uploadItem.id
			});
            index++;
            if(index < uploadingList.length) {
                setTimeout(()=>{
                    this.uploadOneFile(uploadingList, index);
                }, 1000);
            }
        })
        .catch(e => {
            //保存文件到本地失败
        })          
    }

    uploadFile() {
        let uploadingList = this.fileList.filter((item) => item.isSelected == true && (this.isAllFile || !item.uploaded) );
        if(!uploadingList.length) {
            return false;
        }

        var uploadUrl = this.global.getBoxApi('uploadFileBreaking');
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

        this.uploadOneFile(uploadingList, 0);
        this.util.popToPage(this,2);
    }

    refreshFileList(infiniteScroll) {
        if(this.isAllFile) {
            let number = this.pageAllNo * this.pageSize;
            //所有文件
            if(number < this.allFileList.length) {
                this.pageAllNo++;
                this.fileList = this.allFileList.slice(0, number + this.pageSize);  
            }
        } else {
            let content = this.allFileList.filter(item => !item.uploaded);
            let number = this.pageNo * this.pageSize;
            if(number < content.length) {
                this.pageNo++;
                this.fileList = content.slice(0, number + this.pageSize);  
            }
        }
        infiniteScroll.complete();
    }
}
