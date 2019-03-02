import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { SelectUploadFolderPage } from '../select-upload-folder/select-upload-folder'
import { FileTransport } from '../../providers/FileTransport';
import { FileUploader } from '../../providers/FileUploader';
import { FileManager } from '../../providers/FileManager';

/**
 * Generated class for the SelectfolderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-select-folder',
    templateUrl: 'select-folder.html',
})
export class SelectFolderPage {
    listFiles: any = [];
    isAllSelected: boolean = false;
    canUpload: boolean = false;
    allFileList: any = [];
    pageNo: number = 1;
    pageSize: number = 10;
    localUrl: string;
    count: number = 0;
    isShowFooter: boolean = false;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private transfer: FileTransport,
        private fileUploader: FileUploader,
        private fileManager: FileManager,
        ) {
    }
    ionViewDidEnter() {
        this.isShowFooter = false;
    }

    ionViewWillLeave() {
        this.isShowFooter = true;
    }
    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad SelectfolderPage');
        this.localUrl = this.navParams.get('url');
        this.count = this.navParams.get("count") || 0;
        this.getFolderList();
        GlobalService.consoleLog(JSON.stringify(this.listFiles));
    }
    goSelectUploadFolderPage() {
        this.navCtrl.push(SelectUploadFolderPage);
    }

    selectFile(info) {
        if(info.isFile) {
            this.toggleSelect(info);
        } else {
            this.goNextFolder(info);
        }
    }

    toggleAllSelected() {
        this.isAllSelected = !this.isAllSelected;
        let isSelected = false;
        if(this.isAllSelected) {
            isSelected = true;
        }
        this.canUpload = isSelected;
        this.listFiles.map((item) => {
            if(item.isFile) {
                item.isSelected = isSelected;
            }
        });
    }

    toggleSelect(info) {
        info.isSelected = !info.isSelected ? true : false;
        this.checkIsAllSelected();
    }

    checkIsAllSelected() {
        this.isAllSelected = !this.listFiles.some((item) => {
            return item.isSelected == false && item.isFile == true;
        });
        this.canUpload = this.listFiles.some((item) => {
            return item.isSelected == true && item.isFile == true;
        });
    }

    uploadFile() {
        let uploadingList = [];
        uploadingList = this.listFiles.filter((item) => {
            return item.isSelected == true && item.isFile == true;
        })
        var uploadUrl = this.global.getBoxApi('uploadFileBreaking');
        for (let i = 0; i < uploadingList.length; i++) {
            let fileUrl = decodeURIComponent(uploadingList[i].nativeURL);
            this.transfer.uploadSingleFile(fileUrl, this.global.currPath, uploadingList[i].id);
            uploadingList[i].isSelected = false;
        }
        this.util.popToPage(this, this.count + 2);
    }

    refreshFileList(infiniteScroll) {
        if(this.listFiles.length < this.allFileList.length) {
            this.pageNo++;
            this.listFiles = this.allFileList.slice(0, this.pageNo * this.pageSize);  
        } 
        infiniteScroll.complete();
    }

    goNextFolder(info) {
        this.navCtrl.push(SelectFolderPage, {
            url: info.nativeURL,
            count: this.count + 1
        })
    }
    getFolderList() {
        this.fileManager.browserLocal(this.localUrl)
        .then(res => {
            this.allFileList = res.data;
            this.listFiles = this.allFileList.slice(0,this.pageSize);
        })
        .catch(e => {
        })
    }
}
