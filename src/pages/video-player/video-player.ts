import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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

	videoUrl: string = "";
	imageUrl: string = "";
	isShowTitle = true;
	video: any = null;
	loadedProgress = 0;
	playedProgress = 0;
	currentTime = '--:--:--';
	totalTime = '--:--:--';
	playBtn = true;
	duration = 0;
	current = 0;
	loading = true;
	name = "";

	constructor(public navCtrl: NavController, public navParams: NavParams) {
	}

	setTime(num) {
		num = ~~num;
		let seconds = ('00' + (num % 60)).slice(-2),
			minutes = ('00' + Math.floor(num / 60)).slice(-2),
			hours = ('00' + Math.floor(num / 3600)).slice(-2);
		return [hours, minutes, seconds].join(':');
	}

	toggleShowTitle() {
		this.isShowTitle = !this.isShowTitle;
	}

	onDrag(e) {
		console.log("ttt")
		console.log(e);
	}

	test(e) {
		console.log("ttt")
		console.log(e);
	}

	onDrag1(e) {
		console.log("sss")
		console.log(e)
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad VideoPlayerPage');
		this.videoUrl = this.navParams.get('videoUrl');
		this.imageUrl = this.navParams.get('imageUrl');
		this.name = this.navParams.get('name');
		setTimeout(() => {
			this.isShowTitle = false;
		}, 2000);

		// let video = document.getElementById('video');
		let video = this.videoEl.nativeElement;
		video.removeAttribute('controls');
		this.video = video;
		video.addEventListener('loadedmetadata', (res) => {
			console.log("Metadata:" + JSON.stringify(res))
		})

		video.addEventListener('loadeddata', (res) => {
			console.log("Loadeddata:" + JSON.stringify(res))
		})

		video.addEventListener('canplay', (res) => {
			console.log("Canplay:" + JSON.stringify(res))
			console.log(this.video.currentTime, this.video.duration)
			this.currentTime = this.setTime(this.video.currentTime);
			this.totalTime = this.setTime(this.video.duration);
			this.duration = this.video.duration;
			this.current = this.video.currentTime;
		})

		video.addEventListener('canplaythrough', (res) => {
			console.log("Video can play through...");
			this.loading = false;
		})


		video.addEventListener('progress', (res) => {
			console.log("Progress:" + JSON.stringify(res))
		})

		video.addEventListener('seeking', (res) => {
			console.log("Seeking:" + JSON.stringify(res))
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

		let controller = this.controllerEl.nativeElement;
		let controllerStart = 0;
		let totalWidth = 0;
		controller.addEventListener('touchstart', (e) => {
			controllerStart = e.touches[0].clientX;
			console.log("按下按钮..." + controllerStart)
		})

		controller.addEventListener('touchmove', (e) => {
			if (!this.video.duration) {
				return false;
			}
			let gap = (e.touches[0].clientX - controllerStart);
			if (!totalWidth) {
				totalWidth = e.target.parentNode.clientWidth;
			}
			console.log(this.playedProgress, e.touches[0].clientX, controllerStart, totalWidth)
			this.playedProgress = Math.max(0, Math.min(100, this.playedProgress + gap / totalWidth));
			console.log("拖动距离：" + this.playedProgress);
		})

		controller.addEventListener('touchend', (e) => {
			console.log("松手.......")
			if (!this.video.duration) {
				return false;
			}
			this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.duration * this.playedProgress / 100));
			this.currentTime = this.setTime(this.video.currentTime);
		})
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
