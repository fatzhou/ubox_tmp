import { Injectable } from '@angular/core';
// import { StatusBar } from '@ionic-native/status-bar';
import { File } from '@ionic-native/file';
import { GlobalService } from './GlobalService';

declare var cordova;
let httpd: any      = null;
let UAPROOT:string  = "";


@Injectable()
export class UapPlatform {
  private inAppBrowserRef:any;

  private static uap_installed = {
    'pvr':{
      name:       'pvr',
      remote_url: '',
      local_url:  '/pvr/index.html',
    },
  };

  private static _this;
  private static exportJsApi = {
    'echo':function(str){
      return new Promise((resolv, reject)=>{
        UapPlatform._this.file.listDir(cordova.file.dataDirectory, '.').then((entryes)=>{
          resolv(JSON.stringify(entryes));
        }).catch(()=>{
          resolv(JSON.stringify("eeeeeeor"));
        })
      })
    }
  };

  constructor(private file:File,
              private global: GlobalService) {
    UapPlatform._this = this;
  }

  public createDir(){
    let self = this;
    self.file.createDir(cordova.file.externalDataDirectory, "www", false).then(
      ()=>{
        console.log("createDir UAPROOT:[" + UAPROOT + "]success");
      }
    ).catch(
      ()=>{
        console.log("createDir UAPROOT:[" + UAPROOT + "] failed, maybe it already exist.");
      }
    )
  }

  public openapp(uapname) {
    let self = this;

    if (this.global.platformName == "android"){
      UAPROOT = cordova.file.externalDataDirectory + "www/uapp/";
      UAPROOT = UAPROOT.replace('file://', "");
      self.createDir();
    } else {
      UAPROOT = "uap";
    }
    console.log("openapp:" + uapname);

    if(!UapPlatform.uap_installed[uapname].local_url){
      alert("UAPP '" + uapname + "' not exist.");
      return;
    }

    if (!httpd){
      httpd = ( cordova && cordova.plugins && cordova.plugins.CorHttpd ) ? cordova.plugins.CorHttpd : null;
      console.log("cordova:" + JSON.stringify(cordova));
      console.log("cordova.plugins:" + JSON.stringify(cordova.plugins));
      console.log("httpd:" + JSON.stringify(httpd));
      UapPlatform.prototype.startServer.bind(self)(UAPROOT);
      setTimeout(UapPlatform.prototype.openapp.bind(self), 1000, uapname);
      return;
    }
    httpd.getURL((url)=> {
      if (url.length > 0) {
        let uapstr  = UapPlatform.uap_installed[uapname].local_url;
        let uapurl  = url + (url[url.length-1]=='/' ? uapstr.substr(1) : uapstr);//'https://www.baidu.com/';//
        console.log("httpd服务正在运行: uapurl=" + uapurl);
        setTimeout(self.openbrowser.bind(self), 100, uapurl);
      }else{
        console.log('httpd没有启动，请稍候重启');
      }
    });
    console.log("done openapp:" + uapname);
  }

  public openbrowser(uapurl){
    console.log("===openbrowser===");
    let self = this;
    let target  = "_blank";
    let options = "location=no, hidden=yes, beforeload=yes";
    self.inAppBrowserRef = cordova.InAppBrowser.open(uapurl, target, options);
    self.inAppBrowserRef.addEventListener('loadstart', UapPlatform.prototype.loadStartCallBack.bind(self));
    self.inAppBrowserRef.addEventListener('loadstop', UapPlatform.prototype.loadStopCallBack.bind(self));
    self.inAppBrowserRef.addEventListener('loaderror', UapPlatform.prototype.loadErrorCallBack.bind(self));
    self.inAppBrowserRef.addEventListener('message', UapPlatform.prototype.execMessageCallback.bind(self));
    self.inAppBrowserRef.addEventListener('exit', UapPlatform.prototype.loadErrorCallBack.bind(self));
    setTimeout(self.showbrowser.bind(self), 100, uapurl);
  }

  public showbrowser(uapurl){
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
            //setTimeout(()=>{UapPlatform.prototype.startServer.bind(self)(wwwroot);}, 10000);
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
      this.inAppBrowserRef.insertCSS({file: "/uapp.css"}, console.log);
      this.inAppBrowserRef.executeScript({file: "/uapp.js"}, console.log);
      this.inAppBrowserRef.show();

      console.log("loadStopCallBack called done");
    }
  }

  execMessageCallback(params) {
    console.log("===execMessageCallback=========" + JSON.stringify(params));
    let args = params.data;
    let exportedfunc = null;
    if(!args.service && UapPlatform.exportJsApi[args.execute]){
      exportedfunc = UapPlatform.exportJsApi[args.execute];
    }else{
      console.log("!!!!----方法["+ args.execute + "] 暂不支持---暂不支持---!!!!!!!!");
      return
    }

    if (!!exportedfunc){
      exportedfunc.apply(null, args.arrargs).then((ret)=> {
        let code = "_exec_result('" + args.callbackId + "', true, " + JSON.stringify(ret) + ");";
        console.log("exec_result code:==" + code);
        this.inAppBrowserRef.executeScript({code: code}, (params) => {
          console.log("executeScript result:" + JSON.stringify(params));
        });
      }).catch((err)=>{
        let code = "_exec_result('" + args.callbackId + "', false, " + JSON.stringify(err) + ");";
        console.log("执行出错");
        console.log("exec_result code:==" + code);
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
