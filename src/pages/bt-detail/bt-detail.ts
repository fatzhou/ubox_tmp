import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events, App } from 'ionic-angular';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";

/**
 * Generated class for the BtDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-bt-detail',
  templateUrl: 'bt-detail.html',
})
export class BtDetailPage {
    type: string = 'feed';
    detailId: string = '';
    title: string = '';
    size: string = '';
    createdTime: string = '';
    fileType: any;
    language: string = '';
    file_number: any;
    btNum: any;
    hash: string = '';
    heat: string = '';
    link: string = '';
    detailDesc: any = null;
    constructor(public navCtrl: NavController, 
        public navParams: NavParams,
        public global: GlobalService,
        public util: Util,
        public http: HttpService,
        private events: Events,) {
    }

    ionViewDidLoad() {
        // console.log('ionViewDidLoad BtDetailPage');
        this.type = this.navParams.get("type");
        this.detailId = this.navParams.get("id");
        this.getDetail();
    }

    getDetail() {
        var url = '', param = {};
        if(this.type == 'feed') {
            url = GlobalService.centerApi["getFeedDetail"].url;
            param = {
                feedid: this.detailId
            }
        } else {
            url = GlobalService.centerApi["getSearchDetail"].url;
            param = {
                feedid: this.detailId
            }
        }
        this.http.post(url, param)
        .then((res)=>{
            if(res.err_no === 0) {
                this.title = res.title;
                this.size = res.size;
                this.createdTime = res.build_time;
                this.fileType = res.format;
                this.language = res.feedid;
                this.file_number = res.file_number;
                this.btNum = res.seed;
                this.hash = res.hash;
                this.heat = res.heat;
                this.link = res.mgurl;
                let language = 'en';
                if(GlobalService.applang == 'cn') {
                    language = 'zh';
                } else {
                    language = GlobalService.applang;
                }
                this.detailDesc = JSON.parse(res.describe)[language].describe;
                // console.log("detail" + JSON.stringify(res));
            }
        })
    }

    downloadBt() {
        // console.log("download" + this.link)
        this.util.downloadBt(this.link)
        .then(res => {
            console.log("正在下载bt")
        })
    }

}
