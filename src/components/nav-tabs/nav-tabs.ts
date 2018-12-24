import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the NavTabsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'nav-tabs',
  templateUrl: 'nav-tabs.html'
})
export class NavTabsComponent {
  @Input() focusTab: string;
  @Output() slideOtherTab = new EventEmitter<any>();
  constructor() {
    GlobalService.consoleLog('Hello NavTabsComponent Component');
    GlobalService.consoleLog(this.focusTab + "ddddd")
  }

  slideTabs(tabName) {
    GlobalService.consoleLog(tabName)
  	if(this.focusTab === tabName) {
  		return false;
  	}
  	this.slideOtherTab.emit(tabName);
  	return true;
  }

}
