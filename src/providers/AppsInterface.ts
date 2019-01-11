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

	echo(str) {
		return new Promise((resolv, reject)=>{
			this.file.listDir(this.global.fileSavePath, '.').then((entries)=>{
				resolv(JSON.stringify(entries));
			}).catch(()=>{
				resolv(JSON.stringify("eeeeeeor"));
			})
		})
	}

	public createDir(rootFolder) {
		let self = this;
		self.file.createDir(this.global.fileSavePath, "www", false).then(
			()=>{
				console.log("createDir UAPPROOT:[" + rootFolder + "]success");
			}
			).catch(()=>{
				console.log("createDir UAPPROOT:[" + rootFolder + "] failed, maybe it already exist.");
			}
		);
	}

}
