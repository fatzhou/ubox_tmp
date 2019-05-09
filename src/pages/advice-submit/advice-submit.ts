import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';
import { Buffer } from 'safe-buffer';
// import * as FormData from 'form-data';

/**
 * Generated class for the AdviceSubmitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-advice-submit',
  templateUrl: 'advice-submit.html',
})

export class AdviceSubmitPage {
    problemCategory = "1";
    updatedPhotos = [];
    problemDetail:string = "";
    contactEmail:string = "";
    systemLogNeeded:boolean = false;
    isShowInfo: boolean = false;
    constructor(public navCtrl: NavController, 
        private global: GlobalService,
        private http: HttpService,
        private util: Util,
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        // console.log('ionViewDidLoad AdviceSubmitPage');
    }

    inputFileChange($event) {
        // console.log($event.target.files[0])
        let files = $event.target.files;
        for(let i = 0, len = files.length; i < len; i++) {
            this.updatedPhotos.push({
                url: URL.createObjectURL(files[i]),
                file: files[i]
            });              
        }
        // var reader = new FileReader();
        // reader.onload = (e:any) => {
        //     console.log("文件读取完毕")
        //     this.updatedPhotos.push(reader.result);
        //     console.log(this.updatedPhotos.length)
        // }
        // reader.readAsDataURL($event.target.files[0]);
    }

    submitDataInForm(uuid, now) {
        return new Promise((resolve, reject) => {
            var data = new FormData();
            data.append("contact_email", this.contactEmail);
            data.append("category", this.problemCategory);
            data.append("detail",  this.problemDetail);
            data.append("uuid", uuid);
            data.append("timestamp", now); 
            this.updatedPhotos.forEach(item => {
                // console.log("上传文件........")
                data.append("file", item.file);
            })
            let url = GlobalService.centerApi['uploadLogAnalyser'].url;
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    // console.log(this.responseText);
                    let response = {};
                    try {
                        response = JSON.parse(this.responseText);
                        resolve(response);
                    } catch(e) {
                        reject();
                    }
                }
            });

            xhr.open("POST", url);
            //xhr.setRequestHeader('Cookie', this.http.getCookieString(url));
            xhr.send(data);            
        })
    }

    reportFeedback() {
        //检查邮箱
        let emailCheck = Util.validator.email(this.contactEmail);
        let message = "";
        if(!this.problemDetail) {
            message = this.global.L('ProblemDetailEmpty');
        } else if(emailCheck) {
            message = ["", this.global.L('ContactEmailEmpty'), this.global.L('ContactEmailIlledge')][emailCheck];
        } 

        if(message) {
            this.global.createGlobalToast(this, {
                message: message
            })
            return false;            
        }
        let deviceID = "";
        let now = Date.now();
        this.util.getDeviceID()
        .then((uuid:string) => {
            // let url = GlobalService.centerApi['uploadLogAnalyser'].url;
            deviceID = uuid + "_" + now;
            // return  this.http.post(url, {
            //     uuid: uuid,
            //     category: +this.problemCategory,
            //     detail: this.problemDetail,
            //     contact_email: this.contactEmail,
            //     timestamp: Date.now()
            // })            
            return this.submitDataInForm(deviceID, now)
        })
        .then((res:any) => {
            if(res.err_no === 0) {
                if(this.systemLogNeeded) {
                    let boxUrl = this.global.getBoxApi('reportLog');
                    boxUrl = boxUrl.replace(/\:(\d+)/g, ':37869');
                    let now = Date.now();
                    return this.http.post(boxUrl, {
                        uuid: deviceID,
                        start_timestamp: now - 24 * 3600 * 1000,
                        end_timestamp: now
                    })         
                    .then(data => {
                        if(data.err_no === 0) {
                            return 0;
                        } else {
                            return data.err_no;
                        }
                    })           
                } else {
                    return Promise.resolve(res.err_no);
                }
            } else {
                return Promise.resolve(res.err_no);
            }
        })
        .then(res => {
            if(res === 0) {
                //上传成功
                this.global.createGlobalToast(this, {
                    message: this.global.L("FeedbackSucceeded")
                });
                this.navCtrl.pop();                 
            } else {
                this.http.handleSuccess("", {
                    err_no: res
                }, true);
            }
        })
        .catch(e => {
            this.global.createGlobalToast(this, {
                message: this.global.L("SystemError")
            })
        })
    }

    removePhoto(photo) {
        this.updatedPhotos = this.updatedPhotos.filter(item => {
            return item.url != photo.url
        });
    }

    toggleShowInfo(action = null) {
        if(action) {
            this.isShowInfo = false;
        } else {
            this.isShowInfo = !this.isShowInfo;
        }
    }
}
