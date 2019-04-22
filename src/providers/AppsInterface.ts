import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { GlobalService } from './GlobalService';
import { UappPlatform } from './UappPlatform';
declare var cordova;
/*
  Generated class for the AppsInstalledProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AppsInterface {

    constructor(private global: GlobalService,
                private uapp: UappPlatform,
				private file: File) {
        console.log('Hello AppsInterfacedProvider Provider');
        this.uapp.registerApi('closeUapp', this, this.closeUapp);
		this.uapp.registerApi('getInfo', this, this.getInfo);
		this.uapp.registerApi('log', this, this.log);
	}

	getInfo() {
		let boxInfo = null;
		if(this.global.deviceSelected) {
			boxInfo = {
				ip: this.global.deviceSelected.URLBase,
				boxId: this.global.deviceSelected.boxId,
				platform: this.global.platformName
			}
		}
		return Promise.resolve({
			userInfo: {
				username: this.global.centerUserInfo.uname
			},
			boxInfo: boxInfo
		})
	}

    closeUapp() {
        console.log("即将关闭浏览器...");
        // cordova.InAppBrowser.close();
        return Promise.resolve(this.uapp.closeApp());
	}

	log(text) {
        console.log("浏览器日志： " + text);
        // cordova.InAppBrowser.close();
        // return Promise.resolve(this.uapp.closeApp());
    }
}
