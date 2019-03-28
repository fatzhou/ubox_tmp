import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { NoticeDetailPage } from '../notice-detail/notice-detail'
import { Storage } from '@ionic/storage';
import { Util } from '../../providers/Util';

/**
 * Generated class for the NoticeListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-notice-list',
  templateUrl: 'notice-list.html',
})
export class NoticeListPage {
  messageList: any =[];
  pageIndex: any = 0;
  pageSize: any = 100;
  appLang: any = GlobalService.applang;

  constructor(public navCtrl: NavController,
    private global: GlobalService,
    private http: HttpService,
    private events: Events,
    public storage: Storage,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad NoticeListPage');
    this.getNoticeList();
    this.events.publish("isShow:false");
  }

  goNoticeDetailPage(id){
    GlobalService.consoleLog("id   :"+ id);
    this.navCtrl.push(NoticeDetailPage, {id: id});
  }

  getNoticeList(){
    var url = GlobalService.centerApi["noticeList"].url;
    this.http.post(url, {
        timeStamp: 0,
        startPos: this.pageIndex,
        endPos: this.pageSize,
    })
    .then((res) => {
        if (res.err_no === 0) {
            var list = [];
            var index = 0;
            if (res.list && res.list.length > 0) {
                this.messageList = res.list;
                for(let i = 0; i < this.messageList.length; i++){
                  this.messageList[i].msg = JSON.parse(this.messageList[i].msg);
                  this.messageList[i].name = this.messageList[i].msg[this.appLang].name.replace("<br />",'');
                  this.messageList[i].time = this.formatDate(this.messageList[i].timeStamp);
                }      
                this.global.allNoticeList = this.messageList;
                this.storage.set('allNoticeList', JSON.stringify(this.messageList));          
            }
        }
    })
  }
  formatDate(value){
    let date = new Date(value);
    let y = date.getFullYear();
    let MM = (date.getMonth() + 1).toString();
    MM = parseInt(MM) < 10 ? ('0' + MM) : MM;
    let d = date.getDate().toString();
    d = parseInt(d) < 10 ? ('0' + d) : d;
    let h = date.getHours().toString();
    h = parseInt(h) < 10 ? ('0' + h) : h;
    let m = date.getMinutes().toString();
    m = parseInt(m) < 10 ? ('0' + m) : m;
    let s = date.getSeconds().toString();
    s = parseInt(s) < 10 ? ('0' + s) : s;
    return y + '-' + MM + '-' + d;
  }
}
