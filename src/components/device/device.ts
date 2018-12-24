import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { Events, App } from 'ionic-angular';
/**
 * Generated class for the DeviceComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'device',
  templateUrl: 'device.html'
})
export class DeviceComponent {
  tipsShow:any = true;
  showboxStatus:any;
  loginTipsFlag = true;

  @Input() lastPath: string;
  @Output() goDevicePage = new EventEmitter < any > ();
  constructor(
    private global: GlobalService,
    private events: Events,
    private app: App) {
    var l = this.global.getAppLang();
    this.showboxStatus = Lang.ErrBox[1502].Title[l];
  }

  ionViewDidLoad() {
  }

  closeLoginTips() {
    this.loginTipsFlag = false;
  }

  closeTips() {
    this.tipsShow = false;

  }

  promptLogin() {
    
  }

  goPages(){
    GlobalService.consoleLog("关闭浮层事件触发");
    this.goDevicePage.emit();
  }

}
