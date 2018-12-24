import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Events } from 'ionic-angular';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';

/**
 * Generated class for the NoticeDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-notice-detail',
  templateUrl: 'notice-detail.html',
})
export class NoticeDetailPage {
  form: any = null;
  formDate: any = null;
  fileList: any = null;
  inputList: any = null;
  title: any = null;
  desc: any = null;
  appLang: any = GlobalService.applang;
  constructor(public navCtrl: NavController,
    private global: GlobalService,
    private http: HttpService,
    private events: Events,
    public navParams: NavParams,
    public sanitizer: DomSanitizer) {
      
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad NoticeDetailPage');
    GlobalService.consoleLog("this.navParams.get"+this.navParams.get("id"));

    this.getNoticeDetail();
  }
  getNoticeDetail(){
    var url = GlobalService.centerApi["noticeDetail"].url;
    this.http.post(url, {
        id: this.navParams.get("id"),
    })
    .then((res) => {
        if (res.err_no === 0) {
            if(res.detail){
              this.form = JSON.parse(res.detail.msg)[this.appLang];
              GlobalService.consoleLog("获取文件详情成功  " + JSON.stringify(this.form));
              this.formDate = this.formatDate(res.detail.timeStamp);
              this.title = this.form.name.replace("<br />",'');
              this.desc = this.form.desc;
              this.fileList = this.form.fileList;
              this.inputList = this.form.input;
            }
            
            GlobalService.consoleLog("获取文件详情成功");
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
    return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
  }
  assembleHTML(strHTML: any) {
    return this.sanitizer.bypassSecurityTrustHtml(strHTML);
  }  
}
