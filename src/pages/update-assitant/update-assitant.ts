import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';
import { Lang } from '../../providers/Language';
import { CheckUpdate } from '../../providers/CheckUpdate';

/**
 * Generated class for the UpdageAssitantPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
  selector: 'page-update-assitant',
  templateUrl: 'update-assitant.html',
})
export class UpdateAssitantPage {
	appNewstVersion:string = '';
	appVersion:string = '';
	romNewestVersion:string = '';
    boxUpdateInfo:any;

	showDialog = false;
	currentVersion = '';
	showAction = false;
	toVersion = '';
	head = '';
	info = '';
	btnText = '';
	closeBtn = false;
	action:any;

  constructor(public navCtrl: NavController, 
                public http: HttpService,
  			  public global: GlobalService,
              private checkUpdate: CheckUpdate,
  			  public util: Util,
  			  public navParams: NavParams) {
  }

    ionViewDidLoad() {
        console.log('ionViewDidLoad UpdageAssitantPage');
        this.appVersion = GlobalService.AppVersion;
        let AppVersionDescription = GlobalService.AppVersionDescription;
        this.appNewstVersion = this.util.compareVersion(AppVersionDescription.version, this.appVersion) ? AppVersionDescription.version : '';
        console.log(this.global.deviceSelected)
    }

    updateApp() {
        console.log(`当前版本：${this.appVersion}, 最新版本${this.appNewstVersion}, ${GlobalService.AppVersionDescription.version}`);
        if(this.appNewstVersion) {
            //存在可用的更新
            GlobalService.consoleLog('提示用户升级app');
            this.currentVersion = this.appVersion;
            this.toVersion = this.appNewstVersion;
            this.info = GlobalService.AppVersionDescription.content[GlobalService.applang];
            this.head = this.global.NewVersionHead[GlobalService.applang];
            this.btnText = this.global.L('Update');
            this.action = ()=>{this.util.updateAppIndeed(this)};
            this.showDialog = true; //提示用户升级box
            this.showAction = true;
            this.closeBtn = true;
            GlobalService.DownloadPath['android'] = GlobalService.AppVersionDescription.downloadUrl;
        } else {
            this.global.createGlobalToast(this, {
            	message: this.global.L('WORD73de1e81')
            })
        }
    }

    closeNotice() {
        this.showDialog = false;
    }

    updateBoxIndeed() {
        this.updateCallback();
        //升级到指定版本
        return this.checkUpdate.updateRomIndeed(this.boxUpdateInfo.dstVer, this.boxUpdateInfo.signature, ()=>{
            this.romNewestVersion = "";
            console.log("升级成功,重新连接盒子");
            this.util.loginAndCheckBox(this, true)
            .then(res => {
                //登陆成功
            })
        }, ()=>{
            console.log("升级失败");
        });
    }

    updateBox() {
        this.global.createGlobalLoading(this, {
            message: Lang.L("getRomUpdate")
        });
        this.checkUpdate.updateRom({
            dialog: true
        })
        .then((res:any) => {
            if(res.type === 'optional') {
                this.romNewestVersion = res.data.dstVer;
                GlobalService.consoleLog("即将升级到版本:" + res.data.dstVer);
                let version = res.data.dstVer;
                let boxVersionDescription = GlobalService.BoxVersionDescription;
                if (!boxVersionDescription[version]) {
                    console.error("盒子版本" + version + "未配置");
                    this.showDialog = false;
                    throw new Error("Version not configed");
                }     
                this.boxUpdateInfo = res.data;
                this.toVersion = version;               
                this.info = boxVersionDescription[version][GlobalService.applang];
                this.head = this.global.NewVersionHead[GlobalService.applang];
                this.btnText = this.global.L('Update');
                this.action = this.updateBoxIndeed.bind(this);
                this.closeBtn = true;
                this.showDialog = true;                
            } else if(res.type === 'newest') {
                this.global.createGlobalToast(this, {
                    message: Lang.L('NewestVersion')
                })
            } else if(res.type === 'force') {
                this.romNewestVersion = res.data.dstVer;
                this.updateCallback();
                this.checkUpdate._checkUpdateStatus(()=>{
                    //升级成功
                    this.romNewestVersion = "";
                    this.util.loginAndCheckBox(this, true)
                }, ()=>{
                    console.log("升级失败");
                })
            }
        }, res => {
            this.global.createGlobalToast(this, {
                message: Lang.L('NewestVersion')
            })              
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            this.global.closeGlobalLoading(this);
        })
    }

    updateCallback() {
        //正在升级, 取消盒子的连接
        this.global.deviceSelected = null;
        this.global.boxUserInfo = {}; 
    }

}
