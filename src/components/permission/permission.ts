import { Component, Output, Input, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { Events } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";
import { FileManager } from '../../providers/FileManager';
import { GuidancePage } from '../../pages/guidance/guidance';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PermissionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'permission',
  templateUrl: 'permission.html'
})
export class PermissionComponent {

    @Output() closeDetailBox = new EventEmitter < any > ();
    platformName: any = '';
    constructor(
        private global: GlobalService,
        private util: Util,
        private events: Events,
        public navCtrl: NavController,
        private fileManager: FileManager,
        private platform: Platform,
        public storage: Storage,
    ) {
        // console.log('Hello PermissionComponent Component');
        this.platformName = this.global.platformName;
    }

    checkPermission() {
        // console.log('准备检查权限')
        this.fileManager.getPermission()
        .then(res => {
            this.storage.set('ReadPermitted', true);
            this.fileManager.readPermitted = true;
            // console.log('准备关闭弹窗了')
            this.closeBox(false);
            this.fileManager.initFileList();
        })
        .catch(e => {
            this.closeBox(true)
        })
    }

    closeBox(close) {
        this.events.publish('close:box',close);
    }

}
