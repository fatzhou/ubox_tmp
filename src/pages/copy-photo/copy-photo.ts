import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from "../../providers/Util";
import { Lang } from '../../providers/Language';
import { FileManager } from '../../providers/FileManager';
import { HttpService } from '../../providers/HttpService';

/**
 * Generated class for the CopyPhotoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-copy-photo',
  templateUrl: 'copy-photo.html',
})
export class CopyPhotoPage {
    backupSwitch: boolean = false;
    albumsList: any = [];
    selectedAlbumsCount: number = 0;
    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        private global: GlobalService,
        private util: Util,
        private http: HttpService,
        private fileManager: FileManager
    ) {
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad CopyPhotoPage');
        this.backupSwitch = this.global.albumBackupSwitch;
	}

	changeBackupSwitch() {
		if(this.backupSwitch) {
			if(this.albumsList.length > 0) {
				return;
			}
			let timeout = null;
			if(!this.fileManager.resourceStorage.image.finished) {
				this.global.createGlobalLoading(this, '');
				timeout = setTimeout(() => {
					this.changeBackupSwitch();		
				}, 100)
			} else {
				this.global.closeGlobalLoading(this);
				this.getAlbumList();
			}
		} else {
			this.global.closeGlobalLoading(this);
		}
	}
	
	getAlbumList() {
		if(!this.fileManager.resourceStorage.image.finished) {
			return Promise.reject("Not ready");
		}
       return this.fileManager.fetchAlbums('image')
        .then((res) => {
			GlobalService.consoleLog("获取相册成功......." + JSON.stringify(res));
			// this.fileManager.classifiedPhotoLibrary('image');
			this.albumsList = this.global.localAlbum.filter(item => item.content && item.content.length > 0);
            // let backupConfig = this.global.autoBackupAlbums;
            // this.albumsList.forEach(item => {
            //     if(backupConfig.indexOf(item.id) > -1) {
            //         item.backupSwitch = true;
            //     } else {
            //         item.backupSwitch = false;
            //     }
            // })
			this.selectedAlbumsCount = this.albumsList.filter(item => item.backupSwitch).length;
			console.log("符合条件的相册数：" + this.selectedAlbumsCount);
        })
        .catch(e => {
			GlobalService.consoleLog("搜索图片异常：" + JSON.stringify(e))
        })
	}

    updateSelectedAlbums(album) {
        this.selectedAlbumsCount = this.albumsList.filter(item => item.backupSwitch).length;
    }

    ionViewDidLeave() {
        GlobalService.consoleLog('ionViewDidLeave CopyPhotoPage');
        let url = this.global.getBoxApi('setCopyAlbums');
        let savedAlbums = [];
        this.albumsList.forEach(item => {
            if(item.backupSwitch) {
                savedAlbums.push(item.id);
            }
        })
        let savedAlbumsParam = savedAlbums.join(','),
            originAlbumsParam = this.global.autoBackupAlbums.join(',');
        console.log("需要备份的相册是：" + savedAlbumsParam);

        if(this.backupSwitch === this.global.albumBackupSwitch && savedAlbumsParam == originAlbumsParam) {
            //配置未改变，直接返回
            return false;
        }

        this.http.post(url, {
            equip_id: this.global.deviceID,
            dic_list: savedAlbums.join(','),
            backup: this.backupSwitch ? 1 : 2
        })
        .then(res => {
            if(res.err_no === 0) {
                this.global.autoBackupAlbums = savedAlbums;  
                //开始备份              
                if(this.backupSwitch === this.global.albumBackupSwitch) {
                    //原本已开启备份,但相册有变化
                    this.fileManager.switchBackup(true);
                    setTimeout(() => {
                        this.fileManager.startBackUp();
                    }, 3000);                    
                } else {
                    this.global.albumBackupSwitch = this.backupSwitch;
                    //是否自动备份有变化
                    if(this.backupSwitch) {
                        this.fileManager.switchBackup(true);
                        setTimeout(() => {
                            this.fileManager.startBackUp();
                        }, 3000);
                    } else {
                        //关闭备份
                        this.fileManager.switchBackup(false);
                    }
                }

            }
        })
    }

    

}
