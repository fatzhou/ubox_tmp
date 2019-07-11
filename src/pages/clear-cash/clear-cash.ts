import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { File } from '@ionic-native/file';
import { DirectoryEntry, Entry } from "@ionic-native/file";

/**
 * Generated class for the ClearCashPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var window;
@IonicPage()
@Component({
	selector: 'page-clear-cash',
	templateUrl: 'clear-cash.html',
})
export class ClearCashPage {
	imageCache = 0;
	docCache = 0;
	videoCache = 0;

	constructor(public navCtrl: NavController,
		private global: GlobalService,
		private file: File,
		public navParams: NavParams) {
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ClearCashPage');
		//获取缓存文件夹大小
		this.getFolderSize(this.global.fileSavePath, this.global.PhotoSubPath)
			.then((res: number) => {
				this.imageCache = res;
				this.global.photoMap = {};
			})

		this.getFolderSize(this.global.fileSavePath, this.global.DocSubPath)
			.then((res: number) => {
				this.docCache = res;
			})

		this.getFolderSize(this.global.fileSavePath, this.global.VideoSubPath)
			.then((res: number) => {
				this.videoCache = res;
			})
	}

	getFolderSize(root, folder) {
		let urlResolve = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
		return new Promise((resolve, reject) => {
			urlResolve(root + folder, (fileEntry) => {
				console.log("文件夹查询成功....." + folder);
				this._getSize(fileEntry)
					.then(size => {
						console.log("size计算成功..." + size)
						resolve(size);
					})
					.catch(e => {
						reject(0);
					})
			})
		})
	}

	_getSize(entry) {
		if (entry.isFile) {
			return new Promise<number>((resolve, reject) => {
				entry.getMetadata(f => resolve(f.size), error => reject(error))
			});
		}

		if (entry.isDirectory) {
			return new Promise<number>((resolve, reject) => {
				const directoryReader = (entry as DirectoryEntry).createReader();
				directoryReader.readEntries((entries: Entry[]) => {
					Promise.all(entries.map(e => this._getSize(e))).then((size: number[]) => {
						const dirSize = size.reduce((prev, current) => prev + current, 0);
						resolve(dirSize);
					}).catch(err => reject(err));
				},
					(error) => reject(error));
			})
		}
	}

	clearFiles(type) {
		let folder = this.global.PhotoSubPath;
		if (type == 'video') {
			folder = this.global.VideoSubPath;
		} else if (type == 'doc') {
			folder = this.global.DocSubPath;
		} else if (type == 'music') {
			folder = this.global.MusicSubPath;
		}
		this.file.listDir(this.global.fileSavePath, folder)
			.then((res: any) => {
				console.log("目录下所有文件：" + JSON.stringify(res))

				Promise.all(res.map(item => {
					if (item.isFile) {
						return this.file.removeFile(this.global.fileSavePath + folder, item.name);
					} else {
						return Promise.resolve(0);
					}
				}))
					.then(res => {
						console.log("清楚完成...")
						if (type == 'video') {
							this.videoCache = 0;
						} else if (type == 'doc') {
							this.docCache = 0;
						} else if (type == 'image') {
							this.imageCache = 0;
						}
					})
			})
	}

}
