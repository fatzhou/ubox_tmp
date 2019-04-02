import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { BtSetDiskPage } from '../bt-set-disk/bt-set-disk'
import { SelectImgPage } from '../select-img/select-img';
import { Lang } from '../../providers/Language';
import { GlobalService } from '../../providers/GlobalService';
import { FileManager } from '../../providers/FileManager';

/**
 * Generated class for the SelectAlbumPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova;
declare var window;

@Component({
    selector: 'page-select-album',
    templateUrl: 'select-album.html',
})
export class SelectAlbumPage {
    albums: any = [];
    type: any = "image";
    constructor(public navCtrl: NavController,
        private platform: Platform,
        private cd: ChangeDetectorRef,
        private global: GlobalService,
        private fileManager: FileManager,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad SelectAlbumPage');
        this.type = this.navParams.get('type') || 'image';
        GlobalService.consoleLog("文件类型：" + this.type);
        // this.albums = this.global.localAlbums || [];
        // this.fileManager.classifiedPhotoLibrary(this.type);
        this.fileManager.getLocalFiles(this.type)
        .then(res => {
            let config = this.fileManager.resourceStorage[this.type];
            this.albums = this.global[config.album];
            GlobalService.consoleLog("相册：" + JSON.stringify(this.albums));
        })
        .catch(e => {
            GlobalService.consoleLog("获取相册及图片出错：" + e.message || e.stack)
        }) 
    }

    goBtSetDiskPage() {
        this.navCtrl.push(BtSetDiskPage);
    }

    goSelectImgPage(album) {
        this.navCtrl.push(SelectImgPage, {
            album: album,
            type: this.type
        });
    }

}
