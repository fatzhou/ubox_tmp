import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Util } from '../../providers/Util';
import { GlobalService } from '../../providers/GlobalService';
/**
 * Generated class for the CoinTransactionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-coin-transaction',
  templateUrl: 'coin-transaction.html',
})
export class CoinTransactionPage {
  txhash: string;
  from: string;
  to: string;
  value:any;
  gas: any = '--';
  time: any;
  displayStatus: string;
  amount;
  chainType:string;

  constructor(public navCtrl: NavController, 
              private util: Util,
              private global: GlobalService,
              public navParams: NavParams) {
  }

  ionViewDidLoad() {
    GlobalService.consoleLog('ionViewDidLoad CoinTransactionPage');
    this.chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
    let tx = this.navParams.get('tx');
    if(tx) {
      this.txhash = tx.txhash;
      this.displayStatus = tx.displayStatus;
      this.from = tx.from;
      this.to = tx.to;
      this.value = tx.value;
      GlobalService.consoleLog("tx.gas_ubbey_used"+tx.gas_ubbey_used);
      this.gas = `${tx.gas_used} ETH (${this.global.L("About")}${tx.gas_ubbey_used} UBBEY)`; 
      if(this.chainType !== 'ERC20') {
        this.gas = `${tx.gas_ubbey_used} UBBEY`; 
      }
      this.amount = tx.value;
      if(tx.timestamp != 0){
        this.time = Util.getLocalTime(tx.timestamp, '/');
      } else {
        this.time = '';
      }
      
    }
  }

  goEtherScan() {
    let url;
    if(this.chainType !== 'ERC20') {
      url = GlobalService.ubbeyscanPath[GlobalService.ENV] + this.txhash;
    } else{
      url = 'https://etherscan.com/tx/' + this.txhash;
    }
    this.util.openUrl(url);
  }

  
}
