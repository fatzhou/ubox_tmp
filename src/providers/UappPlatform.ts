import { Injectable } from '@angular/core';
// import { StatusBar } from '@ionic-native/status-bar';
import { AppsInterface } from './AppsInterface';
import { AppsInstalled } from './AppsInstalled';
import { GlobalService } from './GlobalService';
import { File } from '@ionic-native/file';

declare var cordova;
declare var window;
let httpd: any      = null;
let UAPPROOT:string  = "";

@Injectable()
export class UappPlatform {
    private inAppBrowserRef:any;
    private static _this;


    constructor(private api: AppsInterface,
        private global: GlobalService,
        private file: File,
        private appsInstalled: AppsInstalled) {
        UappPlatform._this = this;
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
        self.inAppBrowserRef.addEventListener('loadstart', UappPlatform.prototype.loadStartCallBack.bind(self));
        self.inAppBrowserRef.addEventListener('loadstop', UappPlatform.prototype.loadStopCallBack.bind(self));
        self.inAppBrowserRef.addEventListener('loaderror', UappPlatform.prototype.loadErrorCallBack.bind(self));
        self.inAppBrowserRef.addEventListener('message', UappPlatform.prototype.execMessageCallback.bind(self));
        self.inAppBrowserRef.addEventListener('exit', UappPlatform.prototype.loadErrorCallBack.bind(self));
        setTimeout(self.showbrowser.bind(self), 100, uappUrl);
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

    loadStopCallBack() {
        console.log("loadStopCallBack called");

        if (this.inAppBrowserRef != undefined) {
            let root = "file://" + UAPPROOT;
            console.log("文件存储目录：" + root);
            return this.file.checkFile(root, "uapp.js")
            .then(res => {
                console.log("公共库文件已存在");
                return true;
            }, res => {
                console.log("公共库文件不存在，需要拷贝");
                let promises = [
                    this.file.copyFile(cordova.file.applicationDirectory + "www/uapp/", "uapp.js", root, "uapp.js"),
                    this.file.copyFile(cordova.file.applicationDirectory + "www/uapp/", "uapp.css", root, "uapp.css")
                ];
                return Promise.all(promises);                
            })
            .then(res => {
                console.log("公共库拷贝完成，显示网页...");
                this.inAppBrowserRef.insertCSS({file: "/uapp.css"}, console.log);
                this.inAppBrowserRef.executeScript({file: "/uapp.js"}, console.log);
                //加载完毕。。。。
                this.inAppBrowserRef.show();
            })
            .catch(e => {
                console.log("公共库文件拷贝失败:" + e.stack);
            })
        }            
        console.log("loadStopCallBack called done");
    }

    execMessageCallback(params) {
        console.log("===execMessageCallback=========" + JSON.stringify(params));
        let args = params.data;
        let exportedfunc = null;
        if(!args.service && this.api[args.execute]){
            exportedfunc = this.api[args.execute];
        } else {
            console.log("!!!!----方法["+ args.execute + "] 暂不支持---暂不支持---!!!!!!!!");
            return
        }

        if (!!exportedfunc) {
            exportedfunc.apply(this.api, args.arrargs).then((ret)=> {
                let code = "_exec_result('" + args.callbackId + "', true, " + JSON.stringify(ret) + ");";
                console.log("exec_result code:==" + code);
                this.inAppBrowserRef.executeScript({code: code}, (params) => {
                    console.log("executeScript result:" + JSON.stringify(params));
                });
            }).catch((err)=>{
                let code = "_exec_result('" + args.callbackId + "', false, " + JSON.stringify(err) + ");";
                console.log("执行出错");
                console.log("exec_error_result code:==" + code);
                this.inAppBrowserRef.executeScript({code: code}, (params) => {
                    console.log("executeScript result:" + JSON.stringify(params));
                });
            });
        }
    }

    loadErrorCallBack(params) {
        console.log("loadErrorCallBack called:" + JSON.stringify(params));
        this.inAppBrowserRef.close();
        this.inAppBrowserRef = undefined;
    }


}
