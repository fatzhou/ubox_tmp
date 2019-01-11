import { Injectable } from '@angular/core';

/*
  Generated class for the AppsInstalledProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppsInstalled {

	constructor() {
		console.log('Hello AppsInstalledProvider Provider');
	}

	public static uappInstalled = {
		'pvr':{
			name:       'pvr',
			remote_url: '',
			local_url:  '/pvr/index.html',
		},
	};

}
