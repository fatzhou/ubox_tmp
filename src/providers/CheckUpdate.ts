import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
import { Lang } from './Language';
import { Util } from './Util';

@Injectable()
export class CheckUpdate {
    status:string = "normal";

	constructor(private global: GlobalService,
                private util: Util,
                private http: HttpService) {

	}

    //检查盒子版本是否匹配
    checkVersionMatch(versionControl) {
        if(!this.global.deviceSelected || !versionControl || !versionControl[GlobalService.AppVersion]) {
            GlobalService.consoleLog("没有连接盒子或者版本号错误！" + !!this.global.deviceSelected);
            return -1;
        }
        //读取app配置
        let currentVersionConfig = versionControl[GlobalService.AppVersion].versionList;
        //当前盒子版本号
        let currentBoxVersion = this.transVersion(this.global.deviceSelected.version);
        let versionCheckArr = [], versionList = [];
        for(let i = 0, len = currentVersionConfig.length; i < len ; i++){
            versionList = currentVersionConfig[i].version.split("-");
            versionCheckArr.push(this.transVersion(versionList[0]) || -1);
            versionCheckArr.push(this.transVersion(versionList[1]) || -1);
        }
        let versionMatchResult =  this.checkRange(currentBoxVersion, versionCheckArr);
        return versionMatchResult;
    }

    //转换版本号
    transVersion(version) {
        if(!version) {
            return -1;
        }
        let verList = version.split(".");
        let verNumber = 0;
        verNumber = verList[0] * 10000 + verList[1] * 100 + verList[2] * 1;
        return verNumber || -1;
    }

    //检查版本是否在app允许的范围内
    checkRange(version, checkArr){
        for(let i = checkArr.length - 2; i >= 0; i -= 2 ) {
            GlobalService.consoleLog(version + "," + checkArr[i] + "," + checkArr[i + 1])

            if((version > checkArr[i] || checkArr[i] === -1) && (version < checkArr[i + 1] || checkArr[i + 1] === -1)) {
                return i / 2;
            }       
        }
        return -1;
    }

    //修改url端口，升级端口为当前端口+1
    setUpdateRomUrl(url) {
        return url.replace(/:(\d+)\//, function(str, port) {return ":" + (+port + 1) + "/" });
    }

    _checkUpdateStatus(resolve, reject) {
        let updateUrl = this.setUpdateRomUrl(this.global.getBoxApi('checkRomUpdateStatus'));
        //轮询检查升级状态
        let deviceVersion = this.global.deviceSelected.version;
        let boxId = this.global.deviceSelected.boxId;
        GlobalService.consoleLog("升级时boxId " + boxId);
        var interval = setInterval(()=>{
            if(this.status === 'normal') {
                return false;
            }
            this.http.post(updateUrl, {}, false)
            .then(res => {
                if(res.err_no === 0) {
                    //忽略1604错误
                    if(res.status === 0) {
                        this.status = "normal";
                        //查询当前版本号
                        this.util.getBoxVersion(boxId)
                        .then(version => {
                            GlobalService.consoleLog("检查更新成功后版本号为：" + version);
                            this.global.closeGlobalLoading(this); 
                            clearInterval(interval);
                            interval = null;
                            if(deviceVersion == this.global.deviceSelected.version) {
                                console.error("升级失败，却返回升级成功！");
                                this.global.createGlobalToast(this, {
                                    message: Lang.L("updateRomError")
                                });
                                reject(res);                                 
                            } else {
                                this.global.createGlobalToast(this, {
                                    message: Lang.L("uploadFinished")
                                });
                                // this.version = dstVer;
                                this.global.deviceSelected.version = version;  
                                let device = this.global.foundDeviceList.filter(item => item.boxId === boxId);
                                device.version = version;
                                // resolve('updated', res);                              
                                resolve({
                                    type: 'updated',
                                    data: res
                                })
                            }
                        })
                        .catch(e => {
                            GlobalService.consoleLog("处理版本号错误：" + e.stack);
                            this.global.closeGlobalLoading(this); 
                            clearInterval(interval);
                            interval = null;
                            this.global.createGlobalToast(this, {
                                message: Lang.L("updateRomError")
                            });
                            reject()
                        })
                    } else if(res.status === 1 || res.status === 1604) {
                        GlobalService.consoleLog("正在升级中");
                    } else {
                        throw new Error("升级失败：" + JSON.stringify(res));
                    }
                } 
            })
            .catch(e => {
                GlobalService.consoleLog("catch报错了");
                GlobalService.consoleLog(e.stack);
                this.global.closeGlobalLoading(this);
                clearInterval(interval);
                interval = null;
                this.global.createGlobalToast(this, {
                    message: Lang.L("updateRomError")
                });
                reject({
                    type: 'error',
                    data: e
                }); 
            })
        }, 600);
    }

    //查询是否存在固件升级
    updateRom(options) {
        GlobalService.consoleLog(Lang.L("getRomUpdate"));
        return new Promise((resolve, reject) => {
            var url = this.setUpdateRomUrl(this.global.getBoxApi('checkRomUpdate'));
            this.http.post(url, {}, false)
            .then((res:any) => {
                this.global.closeGlobalLoading(this);
                GlobalService.consoleLog("res.err_no------"+res.err_no);
                if(res.err_no === 0) {
                    if(res.force === 1) {
                        this.status = "updating";
                        resolve({
                            type: 'optional',
                            data: res
                        });
                    } else if(res.force === 2) {
                        // resolve('newest', res);
                        resolve({
                            type: 'newest',
                            data: res
                        })
                    } else if(res.force === 0) {
                        GlobalService.consoleLog("强制升级");
                        this.status = "updating";
                        this.global.createGlobalLoading(this, {
                            message: Lang.L("romUpdatingTips")
                        });
                        this._checkUpdateStatus(resolve, reject);
                    }
                } else {  
                    reject(res);          
                }
            })  
            .catch(e => {
                GlobalService.consoleLog("升级查询出错:" + e);
            })          
        })
     
    }

    //升级固件到指定版本
    updateRomIndeed(dstVer, signature, resolve, reject) {
        this.global.createGlobalLoading(this, {
            message: Lang.L("romUpdatingTips")
        });
        var url = this.setUpdateRomUrl(this.global.getBoxApi('updateRom'));
        this.http.post(url, {
            dstVer: dstVer, 
            signature: signature
        })
        .then(res => {
            if(res.err_no === 0) {
                this._checkUpdateStatus(resolve, reject);
            } else {
                reject('Failure');
            }
        })        
    }
}