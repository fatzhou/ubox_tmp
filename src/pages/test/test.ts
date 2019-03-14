import { Component, NgZone } from "@angular/core";
import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from "@ionic-native/file";
import { HttpService } from '../../providers/HttpService';
import { GlobalService } from '../../providers/GlobalService';
/**
 * Generated class for the TestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova;
declare var FileTransfer;
@IonicPage()
@Component({
	selector: 'page-test',
	templateUrl: 'test.html',
})
export class TestPage {
	total = 0;
	loaded = 0;
	downloading:boolean = false;
	uploading = false;
	uploadTotal = 0;
	uploadLoaded = 0;
	fileTransfer;
	uploadTransfer;
	uploadSpeed = 0;
	downloadSpeed = 0;
	constructor(public navCtrl: NavController,
		private file: File,
		private zone: NgZone,
		private http: HttpService,
		private global: GlobalService,
		public navParams: NavParams) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad TestPage');
		console.log("盒子信息：" + JSON.stringify(this.global.deviceSelected))
	}

	uploadResume() {
		if(this.uploading) {
			console.log("暂停上传..")
			this.uploading = false;
			this.uploadTransfer.pause();
		} else {
			console.log("恢复上传...");
			this.uploading = true;
			if(this.uploadTotal) {
				this.uploadTransfer.resume();
			} else {
				this.upload();
			}
		}
	}

	resume() {
		if(this.downloading) {
			console.log("暂停下载..")
			this.downloading = false;
			this.fileTransfer.pause();
		} else {
			console.log("恢复下载...");
			this.downloading = true;
			if(this.total) {
				this.fileTransfer.resume();
			} else {
				this.download();
			}
		}
	}

	upload() {
		console.log("upload-1")
		let url = this.global.getBoxApi('uploadFileBreaking');
		let fileURL = cordova.file.externalDataDirectory + "qq.exe";
		let self = this
		this.uploadTransfer = new FileTransfer(
			fileURL,
			url,
			function(entry) {
				console.log("complete entry:" + JSON.stringify(entry));
				self.uploading = false;
				self.uploadLoaded = entry.rangend || 0;
			},
			function(error) {
				console.log("upload error source " + error.source);
				console.log("upload error target " + error.target);
				self.uploading = false;
				// 1 = FileTransferError.FILE_NOT_FOUND_ERR
				// 2 = FileTransferError.INVALID_URL_ERR
				// 3 = FileTransferError.CONNECTION_ERR
				// 4 = FileTransferError.ABORT_ERR
				// 5 = FileTransferError.NOT_MODIFIED_ERR
				console.log("upload error code " + error.code);
			},
			{
				headers: {
					cookie: this.http.getCookieString(url)
					// add custom headers if needed
				},
				chunkedMode: true,
				params: {
					path: "/",
					name: "qq.exe",
					transfer: 'chunked',
					offset: this.uploadLoaded
				}
			},
			false
		);
		let start = Date.now();
		this.uploadTransfer.onprogress = (prog) => {
			let now = Date.now();
			if(now - start < 100 && prog.loaded < prog.total) {
				return false;
			}
			// console.log("进度更新：" + prog.loaded + "," + prog.total)
			this.zone.run(()=> {
				this.uploadSpeed = Math.ceil((prog.loaded - this.uploadLoaded) / (now - start) * .1 + this.uploadSpeed * .9);
				start = now;
				this.uploadLoaded = prog.loaded;
				this.uploadTotal = prog.total;
			})
			return true;
		}
		console.log("从开始处传输:" + this.uploadLoaded);
		this.uploadTransfer.upload();
	}

	download() {
		let url = "http://dldir1.qq.com/qqfile/qq/QQ8.4/18380/QQ8.4.exe";
		let fileURL = cordova.file.externalDataDirectory + "qq.exe";
		let self = this
		this.fileTransfer = new FileTransfer(
			url,
			fileURL,
			function(entry) {
				console.log("download complete: " + JSON.stringify(entry));
				self.downloading = false;
			},
			function(error) {
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				self.downloading = false;
				// 1 = FileTransferError.FILE_NOT_FOUND_ERR
				// 2 = FileTransferError.INVALID_URL_ERR
				// 3 = FileTransferError.CONNECTION_ERR
				// 4 = FileTransferError.ABORT_ERR
				// 5 = FileTransferError.NOT_MODIFIED_ERR
				console.log("upload error code " + error.code);
			},
			{
				headers: {
					// add custom headers if needed
					cookie: this.http.getCookieString(url)
				}
			},
			false
		);
		let start = 0;
		this.fileTransfer.onprogress = (prog) => {
			let now = Date.now()
			if(now - start < 100 && prog.loaded < prog.total) {
				return false;
			}
			// console.log("进度更新：" + prog.loaded)
			this.zone.run(()=> {
				this.downloadSpeed = Math.ceil((prog.loaded - this.loaded) / (now - start) * .1 + this.downloadSpeed * .9);
				start = now;
				this.loaded = prog.loaded;
				this.total = prog.total;
			})
			return true;
		}
		this.fileTransfer.download();
	}
}
