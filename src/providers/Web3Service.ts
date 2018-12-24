import { Injectable } from '@angular/core';
// import { HttpService } from './HttpService';
import { GlobalService } from './GlobalService';
// import * as Web3 from 'web3';
import { Http } from '@angular/http';
import { Util } from './Util';
import { Buffer } from 'safe-buffer';
import * as sha from 'sha.js'
// import { randomBytes } from 'crypto-browserify'
import * as Wallet from 'ethereumjs-wallet';
import * as Secp from 'secp256k1';
import * as EthereumTx from 'ethereumjs-tx';

declare var Web3;

@Injectable()
export class Web3Service {
    httpProvider: string = 'https://mainnet.infura.io/c8RAsorlCxJ19nYpNPZX'; //以太坊接入点
    httpProviderTest: string = 'http://ethereum.yqtc.co:8527';
    httpProviderChain: string = 'http://139.199.180.239:7004';
    httpProviderMvpChain: string = 'https://provider.uchain.yqtc.com:443';
    httpProviderTestMvpChain: string = 'http://35.200.79.17:8544';
    
    contract = null;
    web3: any;

    constructor(
        private http: Http,
        private util: Util,
        private global: GlobalService,

    ) {
        this.initweb3();
        // this.initContract();
    }
    //web3初始化
    initweb3() {
        this.web3 = new Web3();
        this.changeChainProvider();
    }

    //初始化合约
    initContract(contractAddr) {
        GlobalService.consoleLog("开始加载abi文件");
        if (this.contract) {
            return new Promise((resolve, reject) => {
                resolve(this.contract);
            })
        } else {
            return this.http.get('assets/data/abi.json')
                .toPromise()
                .then((data) => {
                    let abi = data.json();
                    GlobalService.consoleLog("abi文件加载成功" + JSON.stringify(abi));
                    this.contract = this.web3.eth.contract(abi).at(contractAddr);
                    return this.contract;
                })
                .catch(e => {
                    GlobalService.consoleLog(e.stack)
                })
        }

    }

    getBatchAmount(userAddr:any, contractAddr:any = "", pending = true) {
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        if(chainType === 'ERC20') {
            return this.getWalletNum(userAddr, contractAddr);
        } else {
            return this.getWeb3WalletNum(userAddr, pending);
        }
    }

    //获取钱包余额
    getWalletNum(userAddr:any, contractAddr) {
        return this.initContract(contractAddr)
            .then(res => {
                var walletArr:any = [];
                GlobalService.consoleLog('userAddr ' +userAddr.length)
                for (let i = 0, len = userAddr.length; i < len; i++) {
                    let value = this.contract.balanceOf(userAddr[i]);
                    GlobalService.consoleLog("余额查询结果:" + JSON.stringify(value));
                    value = this.util.cutFloat(this.web3.fromWei(value), 2);
                    // if(value > 1e9) {
                    //     GlobalService.consoleLog("余额特别大");
                    //     value = Number(value).toExponential(2);
                    // } else {
                    //     value = value.toFixed(2);
                    // }
                    walletArr.push(value)
                }
                return walletArr;
            }).catch(e => {
                GlobalService.consoleLog("请求错误");
            })
    }

    getWeb3WalletNum(userAddr:any, pending = true) {
        let self = this
        return new Promise((resolve, reject) => {
            var walletArr = new Array(userAddr.length);
            var count = userAddr.length;
            var flag = false;
            setTimeout(() => {
                if(!flag) {
                    reject(walletArr);
                }
            }, 5000)
            try {
                for (let i = 0, len = userAddr.length; i < len; i++) {
                    let value = self.web3.eth.getBalance(userAddr[i], pending ? 'pending' : 'latest');
                    value = this.util.cutFloat(this.web3.fromWei(value), 2);
                    GlobalService.consoleLog(`钱包${userAddr[i]}的余额是${value}`);
                    walletArr[i] = value;
                }
                flag = true;
                resolve(walletArr);                
            } catch(e) {
                GlobalService.consoleLog("获取余额错误");
                reject(walletArr);
            }
        });
    }

    decryptPrivateKey(keystore, password) {
        let flag = true, privKey = null, publicKey = null;
        try {
            let wallet = Wallet.fromV3(keystore, password, true)
            privKey = wallet.getPrivateKey();   
            publicKey = wallet.getPublicKey();         
        } catch(e) {
            flag = false;
        }
        return {
            flag: flag, 
            privKey: privKey,
            publicKey: publicKey
        };
    } 

    createWalletFromPrivkey(password, key, callback) {
        let wallet = Wallet.fromPrivateKey(key);
        let keystore = wallet.toV3(password, {
            n: 1024
        });
        let filename = wallet.getV3Filename();
        callback && callback(keystore, filename);
    }

    computeSha256Hash(str) {
        const sha256 = sha('sha256');
        const msgHash = sha256.update(str, 'utf8').digest('hex');
        return msgHash;
    }

    sign(msg, privKey) {
        const msgHash = this.computeSha256Hash(msg);
        const msgHashBuffer = this.strToBuffer(msgHash, 'hex');
        let signatureBuf = Secp.sign(msgHashBuffer, privKey).signature;
        let signature = this.bufferToStr(signatureBuf, 'hex');
        return signature;
    }

    modifyWallet(old_passwd, new_passwd, keystore) {
        GlobalService.consoleLog("校验初始密码，试图解析出私钥");
        return new Promise((resolve, reject) => {
            GlobalService.consoleLog(keystore)
            GlobalService.consoleLog(old_passwd)
            let ret = this.decryptPrivateKey(keystore, old_passwd);
            if (!ret.flag) {
                reject({
                    err_no: -1,
                    err_msg: "密码错误"
                });
            } else {
                let privKey = ret.privKey;
                let publicKey = ret.publicKey;
                GlobalService.consoleLog("成功解析出私钥" + privKey);
                GlobalService.consoleLog("成功解析出公钥" + publicKey);
                this.createWalletFromPrivkey(new_passwd, privKey, (ks, filename) => {
                    let keyhash = this.computeSha256Hash(keystore);
                    resolve({
                        keystore: ks,
                        keyhash: keyhash
                    })
                })
            }            
        })
    }

    strToBase64(str) {
        let strBase64 = new Buffer(str, "hex").toString('base64');
        return strBase64;
    }

    base64ToStr(base64) {
        let str = new Buffer(base64, "base64").toString("hex");
        return str;
    }

    strToBuffer(str, type) {
        GlobalService.consoleLog(str + '即将转成buffer对象');
        if (type === 'hex') {
            return Buffer.from(str, 'hex');
        } else {
            return Buffer.from(str);
        }
    }

    floatMultiple(f1, f2) {
        let m1 = new this.web3.BigNumber(f1),
            m2 = new this.web3.BigNumber(f2);
        return m1.mul(m2);
    }

    bufferToStr(buf, type) {
        if (type) {
            return buf.toString(type);
        } else {
            return buf.toString();
        }
    }

    getTransTx(contractAddr, from, to, amount, gasPrice, privateKey) {
        return this.initContract(contractAddr)
            .then(res => {
                let txHash = this.computeTransferTx(from, GlobalService.getUbbeyContract(), 'transfer', [to, amount], gasPrice, privateKey);
                return txHash;
            })
            .catch(e => {
                GlobalService.consoleLog(e.stack);
            })
    }

    transfer(contractAddr, from, to, amount, gasPrice, privateKey, callback){
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        try {
            if(chainType === 'ERC20'){
                this.transferCoin(contractAddr, from, to, amount, gasPrice, privateKey, callback);
            }else{
                this.transferUbbey(from, to, amount, gasPrice, privateKey, callback)
            }            
        } catch(e) {
            GlobalService.consoleLog(e);
            callback && callback({
                message: "Transfer error"
            }, -1);
        }
    }
    transferUbbey(from, to, value, gasPrice, privateKey, callback){
        let tx = this.generateUbbeyTx(from, to, value, gasPrice, privateKey)
        const serializedTx = tx.serialize();
        this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), callback); //调起合约
    }

    transferCoin(contractAddr, from, to, amount, gasPrice, privateKey, callback) {
        let tx = this.generateTx(from, GlobalService.getUbbeyContract(), 'transfer', [to, amount], gasPrice, privateKey);
        const serializedTx = tx.serialize();
        this.web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), callback); //调起合约
    }

    convertFloat2Hex(f) {
        const getHex = i => ('00' + i.toString(16)).slice(-2);

        var view = new DataView(new ArrayBuffer(4)),
            result;

        view.setFloat32(0, 0.0205022);

        result = Array
            .apply(null, { length: 4 })
            .map((_, i) => getHex(view.getUint8(i)))
            .join('');

        return '0x' + result;
    }

    convert10to16(n) {
        let m = new this.web3.BigNumber(n);
        return '0x' + n.toString(16);
    }

    generateUbbeyTx(
        from,
        to,
        value,
        gasPrice,
        privateKey, //账户私钥，用于签名
    ) {
        // var destdata = this.contract.transfer.getData.apply(thisobj, params);
        var nonce = this.web3.eth.getTransactionCount(from, 'pending'); //获取用户钱包地址的nonce
        GlobalService.consoleLog("Nonce为" + nonce);
        let gasLimit = this.web3.eth.estimateGas({
             "from"      : from,       
             "nonce"     : nonce, 
             "to"        : to,   
        })
        const txParams = {
            nonce: nonce,
            gasLimit: gasLimit,
            gasPrice: this.convert10to16(gasPrice),
            to: to,
            value: this.convert10to16(value),
            chainId: GlobalService.ENV === 'dev' ? 102 : 101 //EIP 155 chainId - mainnet: 1, ropsten: 3
        };
        GlobalService.consoleLog("转账参数：" + JSON.stringify(txParams));
        const tx = new EthereumTx(txParams);
        let privateKeyBuffer = Buffer.from(privateKey, 'hex');
        tx.sign(privateKeyBuffer);
        return tx;
    }

    generateTx(
        from,
        to,
        funcname,
        params,
        gasPrice,
        privateKey, //账户私钥，用于签名
    ) {
        var thisobj = this.contract[funcname]; //从目标合约对象中提取函数
        var destdata = thisobj.getData.apply(thisobj, params); //将参数封装成合约参数形式
        // var destdata = this.contract.transfer.getData.apply(thisobj, params);
        var nonce = this.web3.eth.getTransactionCount(from, 'pending'); //获取用户钱包地址的nounce
        GlobalService.consoleLog("Nonce为" + nonce);
        GlobalService.consoleLog("params为" + JSON.stringify(params));
        let gasLimit = this.web3.eth.estimateGas({
             "from"      : from,       
             "nonce"     : nonce, 
             "to"        : to,     
             "data"      : destdata
        })
        const txParams = {
            nonce: nonce,
            gasLimit: gasLimit,
            gasPrice: this.convert10to16(gasPrice),
            to: to,
            value: 0x00,
            data: destdata,
            chainId: GlobalService.ENV === 'prod' ? 1 : 11984 //EIP 155 chainId - mainnet: 1, ropsten: 3
        };
        GlobalService.consoleLog("转账参数：" + JSON.stringify(txParams));
        const tx = new EthereumTx(txParams);
        let privateKeyBuffer = Buffer.from(privateKey, 'hex');
        tx.sign(privateKeyBuffer);
        return tx;
    }

    /*
        计算合约参数
     */
    computeTransferTx(
        from,
        to,
        funcname,
        params,
        gasPrice,
        privateKey, //账户私钥，用于签名
    ) {
        let tx = this.generateTx(from, to, funcname, params, gasPrice, privateKey);
        let hash = tx.hash();
        let hexHash = '0x' + this.bufferToStr(hash, 'hex');
        GlobalService.consoleLog("hash转成十六进制以后" + hexHash);
        return hexHash;
    }

    /*切换环境*/
    changeChainProvider(){
        let provider = '';
        let chainType = this.global.chainSelectArray[this.global.chainSelectIndex];
        if(chainType == 'ERC20') {
            provider = GlobalService.ENV === 'dev' ? this.httpProviderTest : this.httpProvider;
        } else {
            provider = GlobalService.ENV === 'dev' ? this.httpProviderTestMvpChain : this.httpProviderMvpChain;
        } 
        let web3Provider = new this.web3.providers.HttpProvider(provider)
        this.web3.setProvider(web3Provider);
    }
}
