import { Component, Output, Input, EventEmitter } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { Lang } from "../../providers/Language";
import { FileTransport } from '../../providers/FileTransport';
import { FileDownloader } from '../../providers/FileDownloader';
import { BtSetDiskPage } from '../../pages/bt-set-disk/bt-set-disk';

/**
 * Generated class for the FileDetailComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'file-detail',
	templateUrl: 'file-detail.html'
})

export class FileDetailComponent {
	owner: string = '';
	modifier: string = '';
	static _this: any;
	@Output() closeDetailBox = new EventEmitter<any>();
	@Input() info: any;
	@Input() path: any;
	@Input() citePage: any;
	@Output() goPop = new EventEmitter<any>();
	@Output() goDetailPage = new EventEmitter<any>();
	constructor(
		private global: GlobalService,
		private util: Util,
		public navCtrl: NavController,
		private events: Events,
		private transfer: FileTransport,
		private downloader: FileDownloader,
	) {
		// GlobalService.consoleLog('Hello FileDetailComponent Component');
		FileDetailComponent._this = this;
		this.initData();
		//events.unsubscribe('image:move');
		events.unsubscribe('image:move', FileDetailComponent.moveFile);
		events.subscribe('image:move', FileDetailComponent.moveFile);
	}

	static moveFile() {
		let _this = FileDetailComponent._this;
		_this.moveFile(_this.path.replace(/\/$/g, '') + "/", _this.info.name, _this.global.currPath.replace(/\/$/g, '') + "/", _this.info.name, "move");
		_this.path = _this.global.currPath;
		if (_this.global.selectFolderType == 'move') {
			_this.events.publish('list:change', _this.info);
		}
		_this.global.selectFolderType = "upload";
	}

	initData() {
		this.modifier = this.owner = this.global.boxUserInfo.username || this.global.centerUserInfo.uname || '';
	}

	closeBox() {
		this.closeDetailBox.emit();
	}

	goImgDetailPage() {
		this.goDetailPage.emit();
	}

	deleteFile() {
		var path = [];
		path.push(this.path.replace(/\/$/g, '') + "/" + this.info.name);
		var hasFolder = 0;
		var self = this;
		// GlobalService.consoleLog("path" + JSON.stringify(path))
		this.util.deleteFileDialog(path, hasFolder, () => {
			//完成删除回调
			this.global.createGlobalToast(this, {
				message: Lang.L('WORD57a63e05')
			});
			setTimeout(() => {
				this.closeBox();
				this.events.publish(this.global.currPath + ':succeed');
				this.events.publish('classify:updated');
				this.goPop.emit();
			}, 500)
		})
	}


	renameFile() {
		var selectedFile = this.info;
		var self = this;
		var sn = selectedFile.name;
		if (selectedFile.fileStyle == 'folder' && (selectedFile.name == 'Images' || selectedFile.name == 'Musics' || selectedFile.name == 'Documents' || selectedFile.name == 'Videos')) {
			this.global.selectFolderType = 'upload';
			this.global.createGlobalToast(this, {
				message: Lang.L('CannotRename')
			})
			return false;
		}
		this.global.createGlobalAlert(this, {
			title: Lang.L('WORDae3092c3'),
			// message: selectedFile.type === 1 ? Lang.Lf('WillRenameDirectory', sn) : Lang.Lf('WillRenameFile', sn),
			inputs: [{
				name: 'newName',
				type: 'text',
				value: selectedFile.name,
				placeholder: selectedFile.type === 1 ? Lang.L('PlsInputYourDirectoryName') : Lang.L('PlsInputYourFileName')
			},],
			// enableBackdropDismiss: false,
			buttons: [
			{
				text: Lang.L('WORD65abf33c'),
				handler: data => {
					var name = data.newName.replace(/(^\s+|\s+$)/g, '');
					if (!name) {
						this.global.createGlobalToast(this, {
							message: Lang.L('WORD0f8908c2'),
							position: 'bottom'
						});
						return false;
					}
					if (name.length > 60) {
						this.global.createGlobalToast(this, {
							message: Lang.L('WORDTestLen'),
							position: 'bottom'
						})
						return false;
					}
					// if(this.testName.test(name)){
					name = name.replace(/[\／|*?<>]/g, '');
					// }
					GlobalService.consoleLog("重命名文件：" + name + "长度为" + name.length);
					var selectedFile = this.info;
					var prefix = this.path.replace(/\/$/g, '') + "/";
					var oName = this.info.name;
					self.moveFile(prefix, oName, prefix, name, "rename");
					return true;
				}
			},
			{
				text: Lang.L('WORD85ceea04'),
				handler: data => {
					GlobalService.consoleLog('Cancel clicked');
					// this.global.alertCtrl.dismiss();
					// this.handleBack();
				}
			},
			]
		})
		return true;
	}

	moveFile(oldPath, oldName, newPath, newName, type = "rename") {
		var selectedFile = this.info;
		this.util.moveFile(oldPath, oldName, newPath, newName)
			.then((res) => {
				if (res) {
					GlobalService.consoleLog("重命名成功");
					this.events.publish(this.global.currPath + ':succeed');
					this.global.alertCtrl && this.global.alertCtrl.dismiss();
					let message = "";
					this.info.name = newName;
					if (this.info.fileStyle == 'image') {
						this.events.publish("image:update", this.info.name);
					} else if (this.info.fileStyle != 'folder') {
						this.events.publish("fileName:update", this.info.name);
					}
					if (type === 'rename') {
						message = selectedFile.type === 1 ? Lang.L('RenameDirectorySuccess') : Lang.L('RenameFileSuccess');
					} else {
						message = selectedFile.type === 1 ? Lang.L('MoveDirectorySuccess') : Lang.L('MoveFileSuccess');
					}
					this.global.createGlobalToast(this, {
						message: message
					});
					this.global.selectFolderType = 'upload';
					this.closeBox();
					this.events.publish(this.global.currPath + ':succeed');
				}
			})
		return true;
	}

	moveFilePath() {
		// if(this.info.fileStyle == 'folder') {
		//     this.global.selectFolderType = 'upload';
		//     this.global.createGlobalToast(this, {
		//         message: Lang.L('CannotMove')
		//     })
		//     return false;
		// }
		// this.global.selectFolderType = 'move';
		this.navCtrl.push(BtSetDiskPage);
	}

	shareFile() {
		this.global.createGlobalToast(this, {
			message: Lang.L('NoShares')
		})
		return false;
	}

	downloadFile() {
		// GlobalService.consoleLog('this.path ' + this.path);
		this.closeBox();
		this.global.createGlobalToast(this, {
			message: this.global.L('StartDownloading')
		})
		let subFoldPath = {
			'image': this.global.PhotoSubPath,
			'video': this.global.VideoSubPath,
			'music': this.global.MusicSubPath
		}[this.info.fileStyle] || this.global.DocSubPath;
		this.transfer.downloadFile({
			name: this.info.name,
			fileStyle: this.info.fileStyle,
			thumbnail: this.info.thumbnail
		}, this.path.replace(/\/$/g, '') + "/" + this.info.name, this.global.fileSavePath + subFoldPath + '/' + this.info.name);
	}
}
