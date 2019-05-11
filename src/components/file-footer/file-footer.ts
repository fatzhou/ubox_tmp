import { Component, Output, Input, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { BtSetDiskPage } from '../../pages/bt-set-disk/bt-set-disk';

/**
 * Generated class for the FileFooterComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'file-footer',
    templateUrl: 'file-footer.html'
})
export class FileFooterComponent {
    @Input() canClick: boolean;
    @Output() uploadFileEvent = new EventEmitter < any > ();
    uploadFolder: string = '';
    constructor(
        private global: GlobalService,
        public navCtrl: NavController,
        private events: Events,
    ) {
        // GlobalService.consoleLog('Hello FileFooterComponent Component');
        if(this.global.currPath == '/') {
            this.uploadFolder = 'AllFiles';
        } else {
            let list = this.global.currPath.split('/');
            this.uploadFolder = list[list.length - 1];
        }
    }

    goSelectUploadFolderPage() {
        this.navCtrl.push(BtSetDiskPage);
    }

    uploadEvent() {
        // GlobalService.consoleLog('点击上传')
        if(this.canClick == false) {
            return false;
        }
        this.uploadFileEvent.emit();
    }

}
