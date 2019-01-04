import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the ConnectionPopupComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'connection-popup',
  templateUrl: 'connection-popup.html'
})
export class ConnectionPopupComponent {
  @Input() connectionStatus:string;
  @Output() closeNetworkPopup = new EventEmitter < any > ();

  status:any;
  buttonText:string;

  constructor(private global: GlobalService) {
  	this.status = {
  		"remote": {
  			name: this.global.L('RemoteNetwork'),
  			desc: this.global.L('RemoteNetworkDesc'),
  		},
  		"local": {
  			name: this.global.L('LocalNetwork'),
  			desc: this.global.L('LocalNetworkDesc'),  			
  		},
  		"error": {
  			name: this.global.L('ConnectionError'),
  			desc: this.global.L('ConnectionErrorDesc'),  	  			
  		},
  		"connecting": {
  			name: this.global.L('Connecting'),
  			desc: this.global.L('ConnectingDesc'), 
  		}
  	}
  	this.buttonText = this.global.L("PermissionBtn");
  }

  closePopup() {
  	this.closeNetworkPopup.emit(false);
  }
}
