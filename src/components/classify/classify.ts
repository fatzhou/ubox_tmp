import { Component, EventEmitter, Output } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { ClassifyListPage } from '../../pages/classify-list/classify-list';
import { Lang } from "../../providers/Language";
import { DeviceSearchPage } from '../../pages/device-search/device-search';
import { Events, App } from 'ionic-angular';

/**
 * Generated class for the ClassifyComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'classify',
    templateUrl: 'classify.html'
})
export class ClassifyComponent {
    @Output() closeClassify = new EventEmitter < any > ();

    constructor(
        private global: GlobalService,
        private http: HttpService,
        private app: App
    ) {

    }


    goFolderPage(e, type) {
        GlobalService.consoleLog("选择文件夹类型：" + type);
        if(!this.global.deviceSelected) {
            this.global.createGlobalToast(this, {
                message: Lang.L('WORDc89b0da1')
			})          
			e && e.stopPropagation && e.stopPropagation();  
        } else {
            GlobalService.consoleLog('type' +type)
            this.app.getRootNav().push(ClassifyListPage, {
                type: type
            })
            // .then(() => {
            //     this.closeClassify.emit();
            // });  
        }
    }
}
