import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { HttpService } from '../../providers/HttpService';
import { Util } from '../../providers/Util';

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
    problemCategory = 1;
    updatedPhotos = [];
    problemDetail:string = "";
    contactEmail:string = "";
    systemLogNeeded:boolean = false;
    constructor(public navCtrl: NavController, 
        private global: GlobalService,
        private http: HttpService,
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad AdviceSubmitPage');
    }

    inputFileChange($event) {
        var reader = new FileReader();
        reader.onload = (e:any) => {
        console.log("文件读取完毕")
        this.updatedPhotos.push(reader.result);
        console.log(this.updatedPhotos.length)
        }
        reader.readAsDataURL($event.target.files[0]);
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

        let url = this.global.getBoxApi('reportLog');
        url = url.replace(/\:(\d+)/g, ':37869');
        let params:any = {
            category: +this.problemCategory,
            detail: this.problemDetail,
            contact_email: this.contactEmail,
            if_upload: this.systemLogNeeded ? 1 : 0
        };
        this.http.post(url, params)
        .then(res => {
            if(res.err_no === 0) {
                //上传成功
                this.global.createGlobalToast(this, {
                    message: this.global.L("FeedbackSucceeded")
                });
                this.navCtrl.pop();
            }
        })
    }

}
