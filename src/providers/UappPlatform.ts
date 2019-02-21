import { Injectable } from '@angular/core';
// import { StatusBar } from '@ionic-native/status-bar';
// import { AppsInterface } from './AppsInterface';
import { AppsInstalled } from './AppsInstalled';
import { GlobalService } from './GlobalService';
import { File } from '@ionic-native/file';
import { HttpService } from '../providers/HttpService';

declare var cordova;
declare var window;
let httpd: any      = null;
let UAPPROOT:string  = "";

@Injectable()
export class UappPlatform {
    private inAppBrowserRef:any;
    private static _this;
    private api = {};

    constructor(
        private global: GlobalService,
		private file: File,
		private http: HttpService,
        private appsInstalled: AppsInstalled) {
        UappPlatform._this = this;
    }

    registerApi(method, obj, func) {
        this.api[method] = func.bind(obj);
    }

    public closeApp() {
        return this.inAppBrowserRef.close();
    }

    public openApp(id) {
        let self = this;

        if(!window.cordova) {
            console.log("网页无法打开");
            return false;
        }

        if(!UAPPROOT) {
            // UAPPROOT = "uapp/";
            UAPPROOT = (this.global.fileSavePath + "www/uapp/").replace("file://", "");
        }
        console.log("openapp:" + id);

        if(!this.appsInstalled.uappInstalled[id].localUrl) {
            this.global.createGlobalToast(this, {
                message: "UAPP '" + id + "' not exist."
            });
            return;
        }

        if (!httpd){
            httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
            console.log("httpd:" + JSON.stringify(httpd));
            self.startServer(UAPPROOT);
            setTimeout(self.openApp.bind(self), 1000, id);
            return;
        }
        httpd.getURL((url)=> {
            if (url.length > 0) {
                let uappStr  = this.appsInstalled.uappInstalled[id].localUrl;
                let uappUrl  = url + (url[url.length-1]=='/' ? uappStr.substr(1) : uappStr);
                console.log("httpd服务正在运行: uappurl=" + uappUrl);
                setTimeout(self.openbrowser.bind(self), 100, uappUrl);
            } else{
                console.log('httpd没有启动，请稍候重启');
            }
        });
        console.log("done openapp:" + id);
    }

    public openbrowser(uappUrl){
        console.log("===openbrowser===");
        let self = this;
        let target  = "_blank";
        let options = "location=no, hidden=yes, beforeload=yes";
        self.inAppBrowserRef = cordova.InAppBrowser.open(uappUrl, target, options);
        
        
        // this.setCookies()
        // .then(res => {
            self.inAppBrowserRef.addEventListener('loadstart', UappPlatform.prototype.loadStartCallBack.bind(self));
            self.inAppBrowserRef.addEventListener('loadstop', UappPlatform.prototype.loadStopCallBack.bind(self, uappUrl));
            self.inAppBrowserRef.addEventListener('loaderror', UappPlatform.prototype.loadErrorCallBack.bind(self));
            self.inAppBrowserRef.addEventListener('message', UappPlatform.prototype.execMessageCallback.bind(self));
            self.inAppBrowserRef.addEventListener('exit', UappPlatform.prototype.loadErrorCallBack.bind(self));
        // })
        // setTimeout(this.showbrowser.bind(this), 100, uappUrl);	
	
	}
	
	private setCookies() {
        if(this.global.platformName === 'ios') {
            return new Promise((resolve, reject) => {
                resolve();
            });
        } else {
            let promises = [];
            console.log("Setcookie11111.......");
            promises.push(new Promise((resolve, reject) => {
                let centerUrl = GlobalService.centerApiHost[GlobalService.ENV];
                let cookie = this.http.getCookieString(centerUrl);
                console.log("即将写入中心cookie:" + cookie);
                this.inAppBrowserRef.setCookies({
                    url: centerUrl,
                    cookie: cookie
                }, () => {
                    console.log("成功写入中心cookie:" + cookie);
                    resolve();
                })
            }))
    
            if(this.global.deviceSelected) {
                promises.push(new Promise((resolve, reject) => {
                    let boxUrl = "http://" + this.global.deviceSelected.URLBase;
                    let cookie = this.http.getCookieString(boxUrl);
                    console.log("即将写入盒子" + boxUrl + "cookie:" + cookie);
                    this.inAppBrowserRef.setCookies({
                        url: boxUrl,
                        cookie: cookie
                    }, () => {
                        console.log("成功写入盒子cookie:" + cookie);
                        resolve();
                    })	
                }));	
            }
            console.log(promises.length);
            return Promise.all(promises)
        }
	}

    public showbrowser(uappUrl){
        console.log("===showbrowser===");
        let self    = this;
        self.inAppBrowserRef.show()
    }

    private startServer(wwwroot) {
        console.log("startServer at root:" + wwwroot);
        let self = this;
        if (httpd) {
            // before start, check whether its up or not
            httpd.getURL(function (url) {
                if (url.length > 0) {
                    console.log("server is up: <a href='" + url + "' target='_blank'>" + url + "</a>");
                } else {
                    /* wwwroot is the root dir of web server, it can be absolute or relative path
                    * if a relative path is given, it will be relative to cordova assets/www/ in APK.
                    * "", by default, it will point to cordova assets/www/, it's good to use 'htdocs' for 'www/htdocs'
                    * if a absolute path is given, it will access file system.
                    * "/", set the root dir as the www root, it maybe a security issue, but very powerful to browse all dir
                    */
                    httpd.startServer({
                        'www_root': wwwroot,
                        'port': 8081,
                        'localhost_only': false
                    }, function (url) {
                        // if server is up, it will return the url of http://<server ip>:port/
                        // the ip is the active network connection
                        // if no wifi or no cell, "127.0.0.1" will be returned.
                        console.log("server is started: <a href='" + url + "' target='_blank'>" + url + "</a>");
                        }, function (error) {
                        console.log('failed to start server: ' + error);
                        //console.log('httpd启动失败，10秒后尝试重启');
                        //setTimeout(()=>{UappPlatform.prototype.startServer.bind(self)(wwwroot);}, 10000);
                    });
                }
            });
        } else {
            alert('CorHttpd plugin not available/ready.');
        }
    }

    private stopServer() {
        if (httpd) {
            // call this API to stop web server
            httpd.stopServer(function () {
                console.log('server is stopped.');
            }, function (error) {
                console.log('failed to stop server' + error);
            });
        } else {
                alert('CorHttpd plugin not available/ready.');
        }
    }


    loadStartCallBack() {
        console.log("loading please wait ...");
    }

    loadStopCallBack(uappUrl) {
        console.log("loadStopCallBack called");

        if (this.inAppBrowserRef != undefined) {
            let root = "file://" + UAPPROOT;
            console.error("文件存储目录：" + root);
            //加载完毕。。。。
        //android下需要种cookie, ios下会自动携带cookie
        // if(this.global.platformName === 'android') {
        //     this.setCookies()
        //     .then(res => {
        //         console.log("cookie写入成功，即将打开浏览器.......");
        //         setTimeout(this.showbrowser.bind(this), 100, uappUrl);
        //     })			
        // } else {
        //     setTimeout(this.showbrowser.bind(this), 100, uappUrl);
        // }
            this.setCookies()
            // return Promise.resolve(1)
            .then(res => {
                return this.file.checkFile(root, "uapp.js")
                // setTimeout(this.showbrowser.bind(this), 100, uappUrl);
            })
            .then(res => {
                console.log("公共库文件已存在");
                return true;
            }, res => {
                console.log("公共库文件不存在，需要拷贝");
                let promises = [
                    this.file.copyFile(cordova.file.applicationDirectory + "www/uapp/", "uapp.js", root, "uapp.js"),
                    this.file.copyFile(cordova.file.applicationDirectory + "www/uapp/", "uapp.css", root, "uapp.css")
                ];
                console.log("公共库文件不存在，需要拷贝 999")
                return Promise.all(promises);                
            })
            .then(res => {
                console.log("公共库拷贝完成，显示网页1...");
                this.inAppBrowserRef.insertCSS({file: "/uapp.css"}, console.log);
                console.log(1333322)
                this.inAppBrowserRef.executeScript({file: "/uapp.js"}, console.log);
                console.log(233)
                //this.inAppBrowserRef.show();
            })
            .catch(e => {
                console.log("公共库文件拷贝失败:" + JSON.stringify(e));
            })
        }            
        console.log("loadStopCallBack called done");
    }

    execMessageCallback(params) {
        console.log("===execMessageCallback=========" + JSON.stringify(params));
        let args = params.data;
        let exportedfunc = null;
        console.log(JSON.stringify(this.api))
        if(!args.service && this.api[args.execute]){
            exportedfunc = this.api[args.execute];
        } else {
            console.log("!!!!----方法["+ args.execute + "] 暂不支持---暂不支持---!!!!!!!!");
            return
        }

        return new Promise((resolve, reject) => {
            if (!!exportedfunc) {
                exportedfunc.apply(this.api, args.arrargs).then((ret)=> {
                    let code = "_exec_result('" + args.callbackId + "', true, " + JSON.stringify(ret) + ");";
                    console.log("exec_result code:==" + code);
                    this.inAppBrowserRef.executeScript({code: code}, (params) => {
                        console.log("executeScript result:" + JSON.stringify(params));
                        resolve(params);
                    });
                }).catch((err)=>{
                    let code = "_exec_result('" + args.callbackId + "', false, " + JSON.stringify(err) + ");";
                    console.log("执行出错");
                    console.log("exec_error_result code:==" + code);
                    this.inAppBrowserRef.executeScript({code: code}, (params) => {
                        console.log("executeScript result:" + JSON.stringify(params));
                        resolve(params);
                    });
                });
            } else {
                console.log("方法不存在");
                reject({});
            }
        })

    }

    loadErrorCallBack(params) {
        console.log("loadErrorCallBack called:" + JSON.stringify(params));
        this.inAppBrowserRef.close();
        this.inAppBrowserRef = undefined;
    }


}
