import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Events, App } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { DeviceSearchPage } from '../../pages/device-search/device-search';

/**
 * Generated class for the BindBoxComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bind-box',
  templateUrl: 'bind-box.html'
})
export class BindBoxComponent {

    @Output() closeBindBox = new EventEmitter < any > ();

    constructor(
        private global: GlobalService,
        private app: App
    ) {
        // GlobalService.consoleLog('Hello BindBoxComponent Component');
    }

    closeBindBoxComponent(){
        GlobalService.consoleLog("关闭浮层事件触发");
        this.closeBindBox.emit();
    }

    goDeviceSearchPage() {
        this.app.getRootNav().push(DeviceSearchPage, {
            refresh: true
        });
    }

}
