import { Component, Output, Input, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { SelectUploadFolderPage } from '../../pages/select-upload-folder/select-upload-folder'

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

    constructor(
        private global: GlobalService,
        public navCtrl: NavController,
        private events: Events,
    ) {
        console.log('Hello FileFooterComponent Component');
    }

    goSelectUploadFolderPage() {
        this.navCtrl.push(SelectUploadFolderPage);
    }

    uploadEvent() {
        console.log('点击上传')
        if(this.canClick == false) {
            return false;
        }
        this.uploadFileEvent.emit();
    }

}
