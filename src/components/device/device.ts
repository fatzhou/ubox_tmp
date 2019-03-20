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
  @Input() networkStatusShow: boolean;
  @Output() goDevicePage = new EventEmitter < any > ();
  @Output() goLoginPage = new EventEmitter < any > ();
  @Output() showPopup = new EventEmitter < any > ();
  constructor(
    private global: GlobalService,
    private events: Events,
    private app: App) {
    var l = this.global.getAppLang();
    this.showboxStatus = Lang.ErrBox[1502].Title[l];
  }

  closeLoginTips() {
    this.loginTipsFlag = false;
  }

  closeTips() {
    this.tipsShow = false;
  }

  promptLogin() {
    this.goLoginPage.emit();
  }

  showNetworkPopup() {
    this.showPopup.emit(true)
  }

  showBindBox() {
    if(this.global.deviceSelected) {
      this.goPages();
    } else {
      this.events.publish("open-bind-box",true);
    }
  }

  goPages(){
    GlobalService.consoleLog("关闭浮层事件触发");
    if(this.global.centerUserInfo.bind_box_count > 0) {
      if(this.global.deviceSelected) {
        this.goDevicePage.emit();
      } else {
        // console.log("有设备未连接")
      }
    } else {
      this.events.publish("open-bind-box", true);
    }
    
  }

}
