import { Component, ViewChild } from '@angular/core';
import {  NavController, NavParams, Slides } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DeviceListPage } from '../device-list/device-list';
import { LoginPage } from '../login/login';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from "../../providers/Language";
import { Util } from '../../providers/Util';

// import * as swiper from "swiper"
// declare var swiper;
/**
 * Generated class for the GuidancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-guidance',
  templateUrl: 'guidance.html',
})
export class GuidancePage {
  screenWidth: number;
  startX: number = 0;
  startY: number = 0;
  endX: number = 0;
  endY: number = 0;
  ratio: number = 2; //移动距离放大系数
  speed: number = 50;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    private global: GlobalService,

    // private fileManager: FileManager
    // public sliders: Slides
    // public slides: Slides
  ) {
  }

    ionViewDidLoad() {
        GlobalService.consoleLog('ionViewDidLoad GuidancePage');
        // this.screenWidth = document.documentElement.offsetWidth;
        this.screenWidth = document.documentElement.offsetWidth;
        this.onInit();
        // this.fileManager.initFileList();
    }
    changeSatus(){
        this.storage.set('Guidance', true);
        GlobalService.consoleLog("引导状态改变"+this.storage.get('Guidance'));
        document.body.addEventListener('touchmove', function (event) {
            event.returnValue = true;  
        }, false);
        if(this.global.networking && this.global.networkType != "wifi") {
            // this.global.useWebrtc = true;
            this.navCtrl.push(LoginPage);
        }else{
            this.navCtrl.push(DeviceListPage, {
                refresh: false
            });
        }
        
    }

    onInit(){
        var that = this;
        var ulDom = document.getElementById('swiper_box');
        ulDom.addEventListener('touchstart', function (event) {
            that.startX = event.targetTouches[0].pageX;
            that.startY = event.targetTouches[0].pageY;
        }, false)
        ulDom.addEventListener('touchmove', function (event:any) {
            // GlobalService.consoleLog('event'+event);
            var offsetX = (event.targetTouches[0].pageX - that.startX) * that.ratio;
            var targetLi = event.target;
            // var index = Array.prototype.indexOf.call(ulDom.children, targetLi);
            var index;
        //     var target:any = event.target || event.srcElement;
        //     if(target.nodeName.toLowerCase() != 'li' || target.nodeName.toLowerCase() != 'ul'){
        // 　 　　var parentLi = target.parentElement;
        //       index =Array.prototype.indexOf.call(parentLi.parentNode.children, parentLi);
        // 　　 }
        // GlobalService.consoleLog('eventpath'+event.path);
        // GlobalService.consoleLog('event.composedPath'+event.composedPath);
        // GlobalService.consoleLog('event.composedPath()'+event.composedPath());

            var targetList:any = event.path || (event.composedPath && event.composedPath());
            if(targetList.length > 0){
                for(let i = 0; i < targetList.length; i++){
                // GlobalService.consoleLog(targetList[i].localName)
                if( targetList[i].localName == 'li'){
                    // GlobalService.consoleLog(targetList[i])
                    var parentLi = targetList[i];
                    index =Array.prototype.indexOf.call(ulDom.children, parentLi);
                }
                }
            }
            ulDom.style['margin-left'] = -index * that.screenWidth + offsetX + 'px'
        }, false)
        ulDom.addEventListener('touchend', function (event:any) {
            // GlobalService.consoleLog('event'+event);
            var offsetX = (event.changedTouches[0].pageX - that.startX) * that.ratio;
            var targetLi = event.target;
            // var index = Array.prototype.indexOf.call(ulDom.children, targetLi);
            var index;
            var target:any = event.target || event.srcElement;
            // GlobalService.consoleLog('eventpath'+event.path);
            // GlobalService.consoleLog('event.composedPath'+event.composedPath);
            // GlobalService.consoleLog('event.composedPath()'+event.composedPath());
            var targetList:any = event.path || (event.composedPath && event.composedPath());
            if(targetList.length > 0){
                for(let i = 0; i < targetList.length; i++){
                // GlobalService.consoleLog(targetList[i].localName)
                if( targetList[i].localName == 'li'){
                    // GlobalService.consoleLog(targetList[i])
                    var parentLi = targetList[i];
                    index = Array.prototype.indexOf.call(ulDom.children, parentLi);
                }
                }
            }
            if (index == 0 && offsetX > 0) {
                that.animateCss(ulDom, {
                'margin-left': 0
                }, that.speed);
            } else if (index == ulDom.children.length - 1 && offsetX < 0) {
                that.animateCss(ulDom, {
                'margin-left': -index * that.screenWidth
                }, that.speed);
                that.removeClass();
                that.addClass(index);
            } else if (offsetX > 40) {
                that.animateCss(ulDom, {
                'margin-left': -(index - 1) * that.screenWidth
                }, that.speed);
                that.removeClass();
                that.addClass(index - 1);
            } else if (offsetX < -40) {
                that.animateCss(ulDom, {
                'margin-left': -(index + 1) * that.screenWidth
                }, that.speed)
                that.removeClass();
                that.addClass(index + 1);
            } else {
                that.animateCss(ulDom, {
                'margin-left': -index * that.screenWidth
                }, that.speed)
                that.removeClass();
                that.addClass(index);
            }
        }, false)
    }
  //获取元素样式
    getStyle(ele, attr) {
        return ele.currentStyle ? ele.currentStyle[attr] : window.getComputedStyle(ele, null)[attr];
    }
    animateCss(ele, attrs, time) {
        //判断透明度是否为undefined（兼容IE8-）
        if (this.getStyle(ele, 'opacity') == undefined) {
            ele.style.opacity = 1;
            ele.style.filter = 'alpha(opacity=100)';
        }
        //保存初始值
        var start = {};
        for (var key in attrs) {
            if (key == 'opacity') {
                start[key] = parseFloat(this.getStyle(ele, key)) * 100;
            } else {
                start[key] = parseInt(this.getStyle(ele, key));
            }
        }
        //将时间划分为100份
        let times = 30;
        let degTotal = 900;
        var space = time / times;
        let degStep = 900 / times;
        var deg = 0;
        //添加动画之前停止之前的动画
        clearInterval(ele.timer);
        //添加动画
        ele.timer = setInterval(function () {
            deg += degStep;
            for (var key in attrs) {
                //判断是否为不透明度
                var end = null; 
                if (key == 'opacity') {
                //计算变化量
                end = (attrs[key] * 100 - start[key]) * Math.sin((deg / 10) * Math.PI / 180);
                ele.style.opacity = (start[key] + end) / 100;
                ele.style.filter = 'alpha(opacity=' + (start[key] + end) + ')';
                } else {
                //计算变化量
                end = (attrs[key] - start[key]) * Math.sin((deg / 10) * Math.PI / 180);
                ele.style[key] = (start[key] + end) + 'px';
                }
            }
            //判断动画停止条件
            if (deg == degTotal) {
                clearInterval(ele.timer);
            }
        }, space)
    }

    removeClass(){
        var btnList = document.querySelectorAll(".swiper_button_btn");
        for(let i = 0; i < btnList.length; i++){
            if(btnList[i].classList.contains('active')){
                btnList[i].classList.remove('active');
            }
        }
    }
    addClass(index){
        var btnList = document.querySelectorAll(".swiper_button_btn");
        for(let i = 0; i < btnList.length; i++){
            if(index == i){
                btnList[i].classList.add('active');
            }
        }
    }
    
}
