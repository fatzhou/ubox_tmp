import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { HttpService } from './HttpService';
import { Lang } from './Language';
import { Util } from './Util';

@Injectable()
export class CheckUpdate {
    status:string = "normal";
    upgradeFlag: string = "normal"; //"normal", "doing"

	constructor(private global: GlobalService,
                private util: Util,
                private http: HttpService) {

	}

    stopUpgrade() {
        this.upgradeFlag = "normal";
    }

    //查询是否存在可用的升级
    checkIfNewestVersion(onStartDownloading, onDownloadingProgress, onFinishDownloading) {
        let dstVer = '',
            signature = '',
            taskId = '';

        this.global.createGlobalLoading(this, {
            message: this.global.L("CheckUpdatingAvailable")
        });
        let url = this.global.getBoxApi('checkUpdate130');
        url = this.setUpdateRomUrl(url);
        let start = Date.now();
        return this.http.post(url, {})
        .then(res => {
            if(res.err_no === 0) {
                //查询可用升级成功
                return res;
            } else {
                throw new Error("Error when get available update:  " + JSON.stringify(res));
            }
        })
        .then((res:any) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if(res.force === 1) {
                        this.global.closeGlobalLoading(this);
                        //可选升级
                        this.global.createGlobalAlert(this, {
                            title: Lang.L('updateDetected'),
                            message: Lang.Lf('updateTips', res.dstVer),
                            buttons: [
                                {
                                    text: Lang.L("Update"),
                                    handler: data => {
                                        GlobalService.consoleLog("升级固件:" + res.data.dstVer + "," + res.data.signature);
                                        resolve(res);
                                    }
                                }, 
                                {
                                    text: Lang.L("Cancel"),
                                    handler: data => {
                                        // reject();
                                        GlobalService.consoleLog("用户拒绝升级");
                                        reject(res);
                                    }
                                },                           
                            ]
                        })
                    } else if(res.force === 0 ) {
                        this.global.closeGlobalLoading(this);
                        //强制升级
                        resolve(res);
                    } else if(res.force === 2) {
                        setTimeout(() => {
                            this.global.closeGlobalLoading(this);
                            //不需要升级
                            this.global.createGlobalToast(this, {
                                message: this.global.L('NewestVersion')
                            });
                            reject(res);                        
                        }, 1500)
                    }                    
                }, 3000 - (Date.now() - start));
            })                
        })
        .then((res:any) => {
            this.upgradeFlag = "doing";
            //用户要求升级
            console.log("开始下载安装包...");
            // this.global.createGlobalLoading(this, {
            //     message: this.global.L("DownloadingPackages")
            // })
            dstVer = res.dstVer;
            signature = res.signature;
            onStartDownloading();
            let url = this.global.getBoxApi('downloadPackage130');
            return this.http.post(url, {
                signature: res.signature,
                dstVer: res.dstVer
            })
            .then(res => {
                if(res.err_no === 0) {
                    taskId = res.taskid;
                    return new Promise((resolve, reject) => {
                        let interval = null;
                        let failure = () => {
                            clearInterval(interval);
                            interval = null;
                            reject("Download result error.....")
                        }
                        //轮询查看进度
                        interval = setInterval(() => {
                            if(this.upgradeFlag === 'normal') {
                                this.global.createGlobalToast(this, {
                                    message: this.global.L('UpgradeStopped')
                                })
                                failure();
                            }
                            let progressUrl = this.global.getBoxApi('downloadPackageProgress130');
                            this.http.post(progressUrl, {
                                taskid: taskId
                            })
                            .then(res => {
                                if(res.err_no === 0) {
                                    if(res.status === 3) {
                                        clearInterval(interval);
                                        interval = null;
                                        onDownloadingProgress(res.finish, res.total);
                                        //下载完成
                                        resolve(res);
                                    } else if(res.status === 1) {
                                        //正在下载
                                        onDownloadingProgress(res.finish, res.total);
                                    } else {
                                        //下载失败
                                        failure();
                                    }
                                } else {
                                    failure();
                                }
                            })
                        }, 500);
                    })                    
                } else {
                    throw new Error('Error when downloading...' + JSON.stringify(res))
                }
            })
        }, res => {
            this.global.closeGlobalLoading(this);
            //不存在升级或者用户拒绝升级
            console.log("升级过程结束");
            throw new Error("Upgrade refused or no available upgrade...");
        })
        .then((res:any) => {
            if(res.err_no === 0) {
                onFinishDownloading();
                //下载完成
                this.global.closeGlobalLoading(this);
                this.global.createGlobalLoading(this, {
                    message: this.global.L('InstallingPackages')
                })
                //下载安装包完毕
                let url = this.global.getBoxApi('installPackage130');
                return this.http.post(url, {
                    signature: signature,
                    dstVer: dstVer,
                    taskid: taskId
                })
            } else {
                throw new Error('Error when downloading..' + JSON.stringify(res));
            }
        })
        .then((res:any) => {
            if(res.err_no === 0) {
                //安装成功
                return new Promise((resolve, reject) => {
                    this._checkUpdateStatus(resolve, reject);
                })                  
            } else {
                throw new Error('Error when installing...' + JSON.stringify(res));
            }
        })    
        .catch(e => {
            console.log("未能正常升级:" + JSON.stringify(e));
            setTimeout(() => {
                this.global.closeGlobalLoading(this);  
            }, 5000 - (Date.now() - start))      
        })
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
        GlobalService.consoleLog("升级时boxId " + boxId + "status" + this.status);
        this.status = 'updating';
        var interval = setInterval(()=>{
            if(this.status === 'normal') {
                clearInterval(interval);
                interval = null;
                return false;
            }
            this.http.post(updateUrl, {}, false)
            .then(res => {
                console.log("升级状态查询接口返回:" + JSON.stringify(res))
                if(res.err_no === 0) {
                    //忽略1604错误
                    if(res.status === 0) {
                        this.status = "normal";
                        clearInterval(interval);
                        interval = null;                        
                        //查询当前版本号
                        this.util.getBoxVersion(boxId)
                        .then(version => {
                            GlobalService.consoleLog("检查更新成功后版本号为：" + version);
                            this.global.closeGlobalLoading(this); 

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
                        this.status = 'normal';
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
        }, 2000);
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
                        this.global.createGlobalLoading(this, {
                            message: Lang.L("romUpdatingTips")
                        });
                        resolve({
                            type: "force",
                            data: res
                        });
                        // this._checkUpdateStatus(resolve, reject);
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
        // this.global.createGlobalLoading(this, {
        //     message: Lang.L("romUpdatingTips")
        // });
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