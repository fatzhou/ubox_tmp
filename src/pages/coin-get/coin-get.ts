import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Clipboard } from '@ionic-native/clipboard';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { Util } from '../../providers/Util';
import { SocialSharing } from '@ionic-native/social-sharing';

/**
 * Generated class for the CoinGetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@Component({
    selector: 'page-coin-get',
    templateUrl: 'coin-get.html',
})
export class CoinGetPage {
    addr:string = "";
    qrcode:string = "";
    constructor(public navCtrl: NavController, 
            private clipboard: Clipboard,
            private global: GlobalService,
            public navParams: NavParams,
            private socialSharing: SocialSharing
        ) {
    }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad CoinGetPage');
        this.addr = this.navParams.get("address");
        GlobalService.consoleLog("钱包地址:" + this.addr)
        this.generateQrcode();
    }

    copyAddress() {
        GlobalService.consoleLog("复制地址到剪贴板");
        this.clipboard.copy(this.addr || GlobalService.getUbbeyContract())
        .then(res => {
            this.global.createGlobalToast(this, {
                message: Lang.L('CopySucceed')
            })
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
        })
    }

    generateQrcode() {
        this.qrcode = this.addr;
    }


    shareWalletAddr() {
        var onSuccess = function(result) {
            GlobalService.consoleLog("Share compl? " + JSON.stringify(result));
            GlobalService.consoleLog("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
            GlobalService.consoleLog("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };
        
        var onError = function(msg) {
            GlobalService.consoleLog("Sharing failed with message: " + JSON.stringify(msg));
        };
        var shareMessage = Lang.L('CopyInfoHead') + this.addr + Lang.L('CopyInfoFoot');
        this.socialSharing.share(shareMessage).then((result) => {
            // Success!
            onSuccess(result);
        }).catch((msg) => {
            // Error!
            onError(msg);
        });
    }
}
