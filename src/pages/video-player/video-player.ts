import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Events, Nav, Platform, Tabs } from 'ionic-angular';
import { Util } from '../../providers/Util';

/**
 * Generated class for the VideoPlayerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-video-player',
	templateUrl: 'video-player.html',
})
export class VideoPlayerPage {
	@ViewChild('controller') controllerEl: ElementRef;
	@ViewChild('video') videoEl: ElementRef;
	// @ViewChild('canvas') canvasEl: ElementRef;

	videoUrl: string = "";
	imageUrl: string = "";
	isShowTitle = true;
	video: any = null;
	// canvas: any = null;
	// ctx: any = null;
	loadedProgress = 0;
	playedProgress = 0;
	currentTime = '--:--:--';
	totalTime = '--:--:--';
	playBtn = true;
	duration = 0;
	current = 0;
	loading = true;
	name = "";
	scale = 1.0;
	controllerStart = 0;
	totalWidth = 0;
	maxVideoWidth = 'auto';
	maxVideoHeight = 'auto';

	constructor(public navCtrl: NavController,
		private platform: Platform,
		private util: Util,
		private screenOrientation: ScreenOrientation,
		public navParams: NavParams) {
	}

	setTime(num) {
		num = ~~num;
		let seconds = ('00' + (num % 60)).slice(-2),
			minutes = ('00' + (Math.floor(num / 60) % 60)).slice(-2),
			hours = ('00' + Math.floor(num / 3600)).slice(-2);
		return [hours, minutes, seconds].join(':');
	}

	toggleShowTitle() {
		console.log("切换是否显示标题～！！！" + !this.isShowTitle);
		this.isShowTitle = !this.isShowTitle;
	}

	setVideoEvent() {
		console.log("开始绑定video事件.......");
		// let video = document.getElementById('video');
		let video = this.videoEl.nativeElement;
		// video.removeAttribute('controls');
		this.video = video;
		// let canvas = this.canvasEl.nativeElement;
		// this.canvas = canvas;
		// this.ctx = this.canvas.getContext('2d');
		// this.canvas.width = window.innerWidth;
		// this.canvas.height = window.innerHeight;
		// this.ctx.fillStyle = 'rgb(0, 0, 0)';
		// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		video.addEventListener('loadedmetadata', (res) => {
			console.log("Metadata:" + JSON.stringify(res))
		})

		video.addEventListener('loadeddata', (res) => {
			console.log("Loadeddata:" + JSON.stringify(res))
		})

		video.addEventListener('canplay', (res) => {
			console.log("Canplay:" + this.video.duration)
			this.currentTime = this.setTime(this.video.currentTime);
			this.totalTime = this.setTime(this.video.duration);
			this.duration = this.video.duration;
			this.current = this.video.currentTime;
		})

		video.addEventListener('canplaythrough', (res) => {
			// let canvas = this.canvas;
			this.loading = false;
			console.log("loading:" + this.loading);
			console.log("Video can play through..." + this.video.videoWidth + "," + this.video.videoHeight);
			// if (this.video.videoWidth / this.video.videoHeight > window.innerWidth / window.innerHeight) {
			// 	this.maxVideoHeight = '100%';
			// } else {
			// 	this.maxVideoWidth = "100%";
			// }
			// this.scale = Math.min(
			// 	canvas.width / this.video.videoWidth,
			// 	canvas.height / this.video.videoHeight);
			// this.updateCanvas();
		})

		video.addEventListener('timeupdate', (res) => {
			console.log("Timeupdate:" + JSON.stringify(res))
			this.duration = this.video.duration;
			this.current = this.video.currentTime;
			this.playedProgress = this.current / this.duration * 100 || 0;
			this.currentTime = this.setTime(this.video.currentTime);
			this.totalTime = this.setTime(this.video.duration);
		})

		video.addEventListener('play', (res) => {
			console.log("Play:" + JSON.stringify(res))
			this.playBtn = false;
		})

		video.addEventListener('pause', (res) => {
			console.log("Pause:" + JSON.stringify(res))
			this.playBtn = true;

		})
	}

	onTouchStart(e) {
		this.controllerStart = e.touches[0].clientX;
		console.log("按下按钮..." + this.controllerStart)
	}

	onTouchMove(e) {
		// if (!this.video.duration) {
		// 	return false;
		// }
		let gap = (e.touches[0].clientX - this.controllerStart);
		if (!this.totalWidth) {
			this.totalWidth = e.target.parentNode.clientWidth;
		}
		console.log(this.playedProgress, gap, this.totalWidth, 100 * gap / this.totalWidth)
		this.playedProgress = Math.max(0, Math.min(100, this.playedProgress + 100 * gap / this.totalWidth));
		this.controllerStart = e.touches[0].clientX;
		console.log("拖动距离：" + this.playedProgress);
	}

	onTouchEnd(e) {
		console.log("松手.......")
		if (!this.video.duration) {
			return false;
		}
		this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.duration * this.playedProgress / 100));
		this.currentTime = this.setTime(this.video.currentTime);
	}

	setControllerEvent() {
		// let controller = this.controllerEl.nativeElement;
		// let controllerStart = 0;
		// let totalWidth = 0;

		// console.log("我是controller", controller);
		// controller.addEventListener('touchstart', (e) => {
		// 	controllerStart = e.touches[0].clientX;
		// 	console.log("按下按钮..." + controllerStart)
		// })

		// controller.addEventListener('touchmove', (e) => {
		// 	if (!this.video.duration) {
		// 		return false;
		// 	}
		// 	let gap = (e.touches[0].clientX - controllerStart);
		// 	if (!totalWidth) {
		// 		totalWidth = e.target.parentNode.clientWidth;
		// 	}
		// 	console.log(this.playedProgress, e.touches[0].clientX, controllerStart, totalWidth)
		// 	this.playedProgress = Math.max(0, Math.min(100, this.playedProgress + gap / totalWidth));
		// 	console.log("拖动距离：" + this.playedProgress);
		// })

		// controller.addEventListener('touchend', (e) => {
		// 	console.log("松手.......")
		// 	if (!this.video.duration) {
		// 		return false;
		// 	}
		// 	this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.duration * this.playedProgress / 100));
		// 	this.currentTime = this.setTime(this.video.currentTime);
		// })
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad VideoPlayerPage');
		this.videoUrl = this.navParams.get('videoUrl');
		console.log("当前播放视频为:" + this.videoUrl);
		this.imageUrl = this.navParams.get('imageUrl');
		this.name = this.navParams.get('name');

		this.util.setStatusBarDisplay(false);

		setTimeout(() => {
			this.isShowTitle = false;
		}, 2000);

		setTimeout(() => {
			this.setVideoEvent();
			this.setControllerEvent();
		}, 200);

		setTimeout(() => {
			this.loading = false;
		}, 10000)


		if (this.platform.is('cordova')) {
			this.screenOrientation.unlock();
			// this.screenOrientation.onChange().subscribe(
			// 	() => {
			// 		console.log("Orientation Changed");
			// 		if (this.video.videoWidth / this.video.videoHeight > window.innerWidth / window.innerHeight) {
			// 			this.maxVideoHeight = '100%';
			// 			this.maxVideoWidth = 'auto';
			// 		} else {
			// 			this.maxVideoWidth = "100%";
			// 			this.maxVideoHeight = 'auto';
			// 		}
			// 	}
			// );
		}
	}

	ionViewWillLeave() {
		if (this.platform.is('cordova')) {
			this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
			this.util.setStatusBarDisplay(true)
		}
	}

	updateCanvas() {
		// this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// var scale = this.scale;
		// var vidH = this.video.videoHeight;
		// var vidW = this.video.videoWidth;
		// var top = this.canvas.height / 2 - (vidH / 2) * scale;
		// var left = this.canvas.width / 2 - (vidW / 2) * scale;
		// this.ctx.drawImage(this.video, left, top, vidW * scale, vidH * scale);

		// requestAnimationFrame(this.updateCanvas.bind(this));
	}

	playVideo($event) {
		console.log("===========")

		console.log("切换play状态");
		if (this.video.paused || this.video.ended) {
			if (this.video.ended) {
				this.video.currentTime = 0;
			}
			console.log("开始播放")
			this.video.play();
		} else {
			console.log("开始暂停")
			this.video.pause();
		}

		$event.stopPropagation();
	}

	gotoStart() {
		this.video.currentTime = 0;
		this.currentTime = '00:00:00';
	}

	goBack() {
		this.navCtrl.pop();
	}

}
