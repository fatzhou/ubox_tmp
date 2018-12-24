import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from "../../providers/GlobalService";
import { Util } from '../../providers/Util';
// import { FileManager } from '../../providers/FileManager';

/**
 * Generated class for the AboutUsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-about-us',
  templateUrl: 'about-us.html',
})
export class AboutUsPage {

  appVersion: any = GlobalService.AppVersion;
  constructor(public navCtrl: NavController, 
  			  private global: GlobalService,
          // private fileManager: FileManager,
  			  public navParams: NavParams) {
  	
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad AboutUsPage');
    // this.fileManager.initFileList();
  }

}
