import { Component, EventEmitter, Output } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { ClassifyListPage } from '../../pages/classify-list/classify-list';
import { Lang } from "../../providers/Language";
import { DeviceListPage } from '../../pages/device-list/device-list';
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

    text: string;
    @Output() closeClassify = new EventEmitter < any > ();

    constructor(
        private global: GlobalService,
        private http: HttpService,
        private app: App
    ) {
        console.log('Hello ClassifyComponent Component');
        this.text = 'Hello World';
    }


    goFolderPage(type) {
        GlobalService.consoleLog("选择文件夹类型：" + type);
        if(!this.global.deviceSelected) {
            this.global.createGlobalAlert(this, {
                title: Lang.L('WORD2a0b753a'),
                message: Lang.L('WORDc89b0da1'),
                buttons: [
                    {
                        text: Lang.L('WORD688d7511'),
                        handler: data => {
                        }
                    },
                    {
                        text: Lang.L('WORD0cde60d1'),
                        handler: data => {
                            GlobalService.consoleLog('Cancel clicked');
                            this.app.getRootNav().push(DeviceListPage, {
                                refresh: false
                            })
                            .then(() => {
                                this.closeClassify.emit();
                            });
                        }
                    },
                ]
            })            
        } else {
            GlobalService.consoleLog('type' +type)
            this.app.getRootNav().push(ClassifyListPage, {
                type: type
            })
            .then(() => {
                this.closeClassify.emit();
            });  
        }
    }

}
