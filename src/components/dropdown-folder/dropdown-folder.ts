import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Events } from 'ionic-angular';

/**
 * Generated class for the DropdownFolderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dropdown-folder',
  templateUrl: 'dropdown-folder.html'
})

export class DropdownFolderComponent {
    @Input() pageTitle: string;
    @Output() parentClick = new EventEmitter<any>();
    @Output() setShowType = new EventEmitter<any>();

 	typeListShow:Boolean = false;

    constructor(
        private global: GlobalService,
        private events: Events,
    ) {
        GlobalService.consoleLog('Hello DropdownFolderComponent Component');
        events.unsubscribe('type-list:close');
        events.subscribe('type-list:close', (res) => {
            GlobalService.consoleLog("文件分类关闭成功:" + res);
            this.typeListShow = res;
        })
    }

    goFolderPage(type, path) {
		this.parentClick.emit({
			type,
			path
		});
    }

    toggleFolderSelect() {
        this.typeListShow = !this.typeListShow;
        this.setShowType.emit(this.typeListShow);
    }


    


}
