import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";
/**
 * Generated class for the FileDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-file-detail',
    templateUrl: 'file-detail.html',
})
export class FileDetailPage {
    title: any = '';
    info: any = {};
    type: any = '';
    size: any = 0;
    place: any = '';
    owner: any = '';
    createdTime: any;
    changeTime: any;
    changeUser: any;
    constructor(private global: GlobalService,
		private util: Util,
		public navCtrl: NavController,
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad FileDetailPage');
        this.info = this.navParams.get("info");
        this.type = this.info.fileStyle;
        this.size = this.info.size;
        this.place = this.global.currPath;
        this.changeUser = this.owner = this.global.boxUserInfo.username || this.global.centerUserInfo.uname || '';;
        this.createdTime = this.info.displayTime;
        this.changeTime = this.info.displayTime;
        this.title = this.info.name;
    }

}
