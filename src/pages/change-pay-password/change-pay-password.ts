import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from "../../providers/Language";
import { Web3Service } from "../../providers/Web3Service";
import { Events } from 'ionic-angular';

/**
 * Generated class for the ChangePayPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-change-pay-password',
  templateUrl: 'change-pay-password.html',
})
export class ChangePayPasswordPage {
    passwd1: any = "";
    passwd2: any = "";
    passwd3: any = "";
    pError1: Boolean = false;
    pErrorText1: String = "";
    pError2: Boolean = false;
    pErrorText2: String = "";
    pError3: Boolean = false;
    pErrorText3: String = "";
    keystore: string = "";
    addr: string = "";

    constructor(public navCtrl: NavController,
        private http: HttpService,
        private global: GlobalService,
        private web3: Web3Service,
        private events: Events,
        public navParams: NavParams) {}

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad RegisterPage');
        this.keystore = this.keystore || this.navParams.get("keystore");
        this.addr = this.navParams.get("addr");
    }

    doChange() {
        this.pError1 = this.pError2 = this.pError3 = false;
        this.pErrorText1 = this.pErrorText2 = this.pErrorText3 = "";
        var pError1 = this.passwd1 === '';

        if (pError1) {
            this.pError1 = true;
            this.pErrorText1 = this.global.L("PayPasswordRequired");
            GlobalService.consoleLog(this.pErrorText1);
            return false;
        }
        var pError2 = Util.validator.passwd(this.passwd2);
        if (pError2) {
            this.pError2 = true;
            this.pErrorText2 = ["", Lang.L("PayPasswordCannotEmpty"), Lang.L('PasswordRuleDesc')][pError2];
            return false;
        }
        if (this.passwd3 !== this.passwd2) {
            this.pError3 = true;
            this.pErrorText3 = Lang.L('WORDaa3d0f8d');
            return false;
        }

        let keystore = this.keystore;
        this.web3.modifyWallet(this.passwd1, this.passwd2, this.keystore)
        .then((res:any) => {
            let url = '';
            if(this.global.deviceSelected) {
                url = this.global.getBoxApi('changePayPassword');
            } else {
                url = GlobalService.centerApi['changeKeystore'].url;
            }
            GlobalService.consoleLog(this.keystore + res.keystore)
            this.keystore = JSON.stringify(res.keystore);
            GlobalService.consoleLog(res.keyhash)
            return this.http.post(url, {
                old_ks_hash: res.keyhash,
                new_ks: JSON.stringify(res.keystore),
                addr: this.addr,
                type: this.global.chainSelectArray[this.global.chainSelectIndex] == 'ERC20' ? 0 : 1
            })
        })
        .then(res => {
            if(res.err_no === 0) {
                //需更新本地存储的keystore
                this.events.publish("change-wallet", {
                    keystore: this.keystore,
                    addr: this.addr
                })
                this.global.createGlobalToast(this, {
                    message: Lang.L('ChangePasswordSucceed')
                })        
                setTimeout(()=>{
                    this.navCtrl.pop();
                }, 500);        
            }
        })
        .catch(error => {
            GlobalService.consoleLog(error)
            this.keystore = keystore;
            this.global.createGlobalToast(this, {
                message: Lang.L('EnterRightPassword')
            })            
        })
    }

    

}
