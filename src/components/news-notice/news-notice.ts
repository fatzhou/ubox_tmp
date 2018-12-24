import { Component , Input, Output, EventEmitter} from '@angular/core';
import { Events } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the NewsNoticeComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'news-notice',
  templateUrl: 'news-notice.html'
})
export class NewsNoticeComponent {
  
  @Input() head: any;
  @Input() info: any;
  @Input() version: any;
  @Input() action: any;
  @Input() txt: string;
  @Input() close: boolean;
  @Input() isShowAction: boolean;
  @Input() isVersion: boolean;
  @Output() closeNotice = new EventEmitter < any > ();
  
  
  constructor(private events: Events) {
    GlobalService.consoleLog('ionViewDidLoad NewBannerPage');
  }

  doAction() {
    GlobalService.consoleLog("Do action...." + this.action);
    if(this.action) {
      this.action();
    }
  }
  closeNoticeComponent(){
    GlobalService.consoleLog("关闭浮层事件触发");
    this.closeNotice.emit();
  }

}
