import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { GlobalService } from './GlobalService';

/*
  Generated class for the AppsInstalledProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppsInterface {

	constructor(private global: GlobalService,
				private file: File) {
		console.log('Hello AppsInstalledProvider Provider');
	}

	test(str) {
		return new Promise((resolv, reject)=>{
			console.log("Start test......");
			this.file.listDir(this.global.fileSavePath, '.').then((entries)=>{
				resolv(JSON.stringify(entries));
			}).catch((e)=>{
				console.log(e.stack)
				resolv(JSON.stringify("eeeeeeor"));
			})
		})
	}
}
