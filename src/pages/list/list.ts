import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';
import { ChangeDetectorRef } from '@angular/core';
import { FileManager } from '../../providers/FileManager';

import { HttpService } from '../../providers/HttpService';
import { Events, App } from 'ionic-angular';
// import { FileTransport, FileUploadOptions, FileTransportObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file/ngx';
import { ToastController } from 'ionic-angular';
import { Lang } from "../../providers/Language";
import { TaskListPage } from '../task-list/task-list';
import { Md5 } from 'ts-md5/dist/md5';
import { Platform } from 'ionic-angular';
import { FileTransport } from '../../providers/FileTransport';
import { PreviewImagePage } from '../preview-image/preview-image';
import { PreviewOtherPage } from '../preview-other/preview-other';
import { BtSetDiskPage } from '../../pages/bt-set-disk/bt-set-disk'
import { Storage } from '@ionic/storage';
import { FileDetailPage } from '../../pages/file-detail/file-detail'
import { DeviceGuidancePage } from '../../pages/device-guidance/device-guidance'
import { DeviceManagePage } from '../../pages/device-manage/device-manage'
import { MenuController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { SuperTabsController } from 'ionic2-super-tabs/dist/providers/super-tabs-controller';
import { VideoPlayerPage } from '../video-player/video-player';

// import { AddFileComponent } from '../../components/add-file/add-file';
// import { Util } from '../../providers/Util';
/**
 * Generated class for the ListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var cordova;
@Component({
	selector: 'page-list',
	templateUrl: 'list.html',
})
export class ListPage {
	showFileSelect: Boolean = false;
	pageTitle: any = Lang.L('DirAllFiles');
	currPath: any = "/";
	allFileList: any = []; //总文件数组
	fileList: any = []; //显示文件数组
	// pageFileList: any = []; //显示的缩略图文件列表
	dataAcquired: any = false;
	allBtnsShow: Boolean = false;
	selectedFiles: any = [];
	canDownload: Boolean = true;
	canDelete: Boolean = true;
	canRename: Boolean = true;
	canMove: Boolean = true;
	canDetail: Boolean = true;
	selectAllStatus: Boolean = false;
	showEng: any = GlobalService.applang;
	showTitle: any = [];
	isRefresh: boolean = false;
	// @ViewChild(AddFileComponent) addfile: AddFileComponent;
	pageNo: number = 1;
	pageSize: number = 10;
	detailInfo: any = null;
	isShowDetail: boolean = false;
	hideAddBtn: boolean = false;
	// tasklistlen:number = 0;
	// fileSavePath:string = '';
	isShowType: boolean = false;
	// static _this;
	type0List: any = [];
	type1List: any = [];
	isShowType0List: boolean = true;
	isShowType1List: boolean = true;
	isShowBox: boolean = false;
	isShowClassifyNav: boolean = false;
	// isShowAside: boolean = false;
	disks: any = [];
	isMainDisk: boolean = false;
	isShowPageTitle: boolean = false;
	isShowWarningBox: boolean = false;
	isShowWarningBoxClass: boolean = false;
	copyPhotoInfo: any = {};
	isLoadingData: boolean = true;
	currDiskUuid: any = '';
	constructor(public navCtrl: NavController,
		public global: GlobalService,
		private cd: ChangeDetectorRef,
		public util: Util,
		public http: HttpService,
		private events: Events,
		private toastCtrl: ToastController,
		private platform: Platform,
		private file: File,
		private zone: NgZone,
		private storage: Storage,
		private fileManager: FileManager,
		private transfer: FileTransport,
		private app: App,
		private menuCtrl: MenuController,
		public navParams: NavParams,
		private tabsController: SuperTabsController) {

		this.updateFilesEvent = this.updateFilesEvent.bind(this);
		this.moveFilesEvent = this.moveFilesEvent.bind(this);
		this.moveChangeList = this.moveChangeList.bind(this);
		this.connectionChangeCallback = this.connectionChangeCallback.bind(this);
		this.onTaskFailure = this.onTaskFailure.bind(this);

		// ListPage._this = this;
		// this.events.subscribe('file:updated', this.updateFilesEvent);
		this.events.subscribe('image:move', this.moveFilesEvent);
		this.events.subscribe('list:change', this.moveChangeList);
		this.events.subscribe('connection:change', this.connectionChangeCallback);
		events.subscribe('upload:failure', this.onTaskFailure);
		events.subscribe('download:failure', this.onTaskFailure);

		GlobalService.consoleLog("List constructor...")
		events.subscribe('close:box', (res) => {
			this.isShowBox = res;
		})
	}
	onTaskFailure(task) {
		GlobalService.consoleLog("!!文件上传或下载失败!!" + task.action + '   ' + task.taskId);
		//删除任务以及上传器
		// this.global.fileHandler[taskId] = undefined;
		// let index = -1;
		// let name = "";
		// let taskInList = this.global.fileTaskList.forEach((item, ind) => {
		//     GlobalService.consoleLog(item.taskId);
		//     if(item.taskId === taskId) {
		//         name = item.name;
		//         index = ind;
		//         return false;
		//     }
		// })
		// GlobalService.consoleLog("待暂停的索引：" + index);
		task.pausing = "paused";
		this.global.fileHandler[task.taskId].pause();
		task.speed = 0;
		// if(index !== -1) {
		//     GlobalService.consoleLog("删除索引：" + index);
		//     this.global.fileTaskList.splice(index, 1);
		// }
		// this.fileUploader.uploader.clearCache();
		// this.global.createGlobalToast(this, {
		// 	message: Lang.Lf('UploadFileNotExist', task.name)
		// })
	}

	ngOnDestory() {
		// this.events.unsubscribe('file:updated', this.updateFilesEvent);
		this.events.unsubscribe('image:move', this.moveFilesEvent);
		this.events.unsubscribe('list:change', this.moveChangeList);
		this.events.unsubscribe('connection:change', this.connectionChangeCallback);
	}

	ionViewWillEnter() {
		GlobalService.consoleLog('list ionViewWillEnter');
	}

	ionViewDidEnter() {
		GlobalService.consoleLog("ionViewDidEnter ListPage");
		this.global.tabIndex = 0;

		if (this.platform.is('cordova')) {
			if (!this.fileManager.readPermitted && this.global.centerUserInfo.bind_box_count > 0) {
				// this.isShowBox = true;
				this.fileManager.getPermission()
					.then(res => {
						this.getFileInfo();
					}, () => {
						this.isShowBox = true; //true
					})
			}
		}

		this.global.currPath = this.currPath;
		// if(this.currPath == '/') {
		//     setTimeout(()=>{
		//         this.hideAddBtn = false;
		//         GlobalService.consoleLog('this.hideAddBtn222 ' + this.hideAddBtn);
		//     },100)
		// } else {
		//     this.hideAddBtn = false;
		//     GlobalService.consoleLog('this.hideAddBtn2222 ' + this.hideAddBtn);
		// }
		this.isMainDisk = this.global.currDiskUuid == '' || this.global.currDiskUuid == this.global.mainSelectDiskUuid;
		this.initDiskInfo();
		if (this.currPath == '/' && this.isMainDisk) {
			this.events.unsubscribe('list:refresh');
			this.events.subscribe('list:refresh', this.refreshFilesEvent.bind(this));
			this.events.subscribe('warning:change', this.changeWarningStatus.bind(this));
		}
		this.currDiskUuid = this.global.currDiskUuid;
		GlobalService.consoleLog('this.global.currDiskUuid' + this.global.currDiskUuid);
		GlobalService.consoleLog("this.isMainDisk" + this.isMainDisk);
		this.copyPhotoInfo = {
			name: this.global.L("PhotoBackup"),
			size: 0,
			type: 1,
			path: "/Backup/" + this.global.centerUserInfo.uname + ".backup/" + this.global.deviceID + ".backup",
			displayTime: this.util.getDisplayTime(new Date().getTime()),
			fileStyle: 'folder',
			selected: false,
			thumbnail: "",
			index: 0,
			copyPath: 'main'
		};
		return true;
	}

	refreshFileList(infiniteScroll) {
		this.listFiles(() => {
			setTimeout(() => {
				infiniteScroll.complete();
			}, 500);
		})
	}

	connectionChangeCallback() {
		GlobalService.consoleLog('刷新列表');
		this.listFiles();
	}

	initDiskInfo() {
		this.isShowPageTitle = !(this.isMainDisk && this.currPath == '/');
		if (this.global.diskInfo.disks) {
			this.disks = this.global.diskInfo.disks.filter(item => {
				return item.position != 'base';
			});
			try {
				this.cd.detectChanges();
			} catch (e) {
				GlobalService.consoleLog("List initDiskInfo dectchanges:" + e.message);
			}
		}
	}
	ionViewDidLeave() {
		// this.hideAddBtn = true;
		//保存缩略图map到缓存
		this.showFileSelect = false;
		this.isShowClassifyNav = false;
		this.isShowBox = false;
		this.storage.set('thumbnailMap', JSON.stringify(this.global.thumbnailMap));
		// this.events.unsubscribe('file:updated', this.updateFilesEvent)
		// // events.unsubscribe('image:move');
		// this.events.unsubscribe('image:move', this.moveFilesEvent);
	}

	ionViewDidLoad() {
		GlobalService.consoleLog('ionViewDidLoad ListPage');
		this.isLoadingData = true;

		this.initPage();
		this.events.unsubscribe(this.currPath + ":succeed");
		this.events.subscribe(this.currPath + ':succeed', this.listUploadFiles.bind(this));

		this.currDiskUuid = this.global.currDiskUuid;
		this.listFiles();
		GlobalService.consoleLog("this.currPath" + this.currPath);
		return true;
	}

	listUploadFiles(task: any = null) {
		if (!task || this.currDiskUuid == task.diskUuid) {
			this.listFiles();
		}
	}

	refreshFilesEvent() {
		GlobalService.consoleLog("Refresh file list..." + this.global.currPath);
		this.global.currPath = '/';
		this.initDiskInfo();
		if (this.global.diskInfo.disks) {
			this.global.diskInfo.disks.map((item) => {
				if (item.position == 'base') {
					this.global.currDiskUuid = item.uuid;
				}
			});
		}
		this.isMainDisk = this.global.currDiskUuid == this.global.mainSelectDiskUuid;
		this.currDiskUuid = this.global.currDiskUuid;
		if (this.global.centerUserInfo.bind_box_count == 0) {
			this.isMainDisk = true;
		}
		this.listFiles();
		this.util.getWalletList()
			.catch(e => {
				GlobalService.consoleLog(e);
			})
	}

	changeWarningStatus() {
		let status = this.http.getNetworkStatus();
		GlobalService.consoleLog("list页网络状态更新：" + JSON.stringify(status));
		this.zone.run(() => {
			if (status.uboxNetworking && status.centerNetworking) {
				this.global.isShowWarningBar = false;
				this.isShowWarningBox = false;
				//连接网路欧
				this.util.setStatusBar('green');
			} else {
				this.global.isShowWarningBar = true;
				this.isShowWarningBox = true;
				this.util.setStatusBar('red');
			}
		});
	}

	updateFilesEvent() {
		GlobalService.consoleLog("文件更新，刷新列表:");
		this.listFiles();
		this.initDiskInfo();

	}

	moveFilesEvent() {
		GlobalService.consoleLog("文件移动成功，更新数据 list" + this.selectedFiles.length);

		for (let i = 0; i < this.selectedFiles.length; i++) {
			this.moveFile(this.currPath.replace(/\/$/g, '') + "/", this.selectedFiles[i].name, this.global.currPath.replace(/\/$/g, '') + "/", this.selectedFiles[i].name, "move");
		}
		this.selectedFiles = [];
		this.initDiskInfo();
	}

	moveChangeList(selectedFile) {
		let index0 = this.type0List.findIndex(item => {
			return item.name == selectedFile.name
		});
		let index1 = this.type1List.findIndex(item => {
			return item.name == selectedFile.name
		});
		GlobalService.consoleLog('返回移动的元素的索引');
		this.type0List.splice(index0, 1);
		this.type1List.splice(index1, 1);
		this.events.publish(this.global.currPath + ':succeed');
		this.initDiskInfo();
	}

	setShowType(isShow) {
		this.isShowType = isShow;
	}

	pretify(name) {
		if (name.length < 22) {
			return name;
		} else {
			return name.slice(0, 12) + '...' + name.slice(-8);
		}
	}

	hasThumbnail(type) {
		if (type === 'image' || type == 'video') {
			return true;
		}
		return false;
	}

	//勾选文件
	setSelectedFiles(file) {
		GlobalService.consoleLog("选择了文件:" + JSON.stringify(file));
		// var index = file.index;
		//反选
		// this.fileList[index].selected = !this.fileList[index].selected;
		file.selected = !file.selected;
		//判断当前是否被选中
		if (file.selected) {
			GlobalService.consoleLog("文件未被选中，直接加入选中列表");
			//选中，添加到选中列表
			this.selectedFiles.push(file);
			GlobalService.consoleLog(this.selectedFiles);
		} else {
			//未选中，需要从列表中删除
			for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
				if (file.name === this.selectedFiles[i].name) {
					this.selectedFiles.splice(i, 1);
					break;
				}
			}
		}
		this.setBtnsStatus();
	}

	setBtnsStatus() {
		var ifContainFixedContent = this.checkFixedContent();
		//只要选中至少1个文件，就可删除
		this.canDelete = ifContainFixedContent && this.selectedFiles.length > 0;
		//用户仅选择一个文件时，可以重命名
		this.canRename = ifContainFixedContent && this.selectedFiles.length === 1;
		this.canDetail = ifContainFixedContent && this.selectedFiles.length === 1;
		this.canMove = ifContainFixedContent && this.selectedFiles.length > 0;
		this.selectAllStatus = this.selectedFiles.length == (this.type0List.length + this.type1List.length);
		//用户选择的文件中不包含文件夹时，可以下载
		this.canDownload = ifContainFixedContent && this.selectedFiles.length > 0 && this.selectedFiles.filter((item) => item.type === 1).length === 0;
		GlobalService.consoleLog("当前delete, rename, download的状态分别为:" + [this.canDelete, this.canRename, this.canDownload].join(","));
	}

	clearStatus() {
		this.canDownload = false;
		this.canDelete = false;
		this.canDetail = false;
		this.canMove = false;
		this.canRename = false;
		this.selectedFiles = [];
		this.allBtnsShow = false;
		this.showFileSelect = false;
		this.selectAllStatus = false;
		// this.selectAllStatus = false;
		for (let i = 0, len = this.type0List.length; i < len; i++) {
			this.type0List[i].selected = false;
		}
		for (let i = 0, len = this.type1List.length; i < len; i++) {
			this.type1List[i].selected = false;
		}
		GlobalService.consoleLog("按钮显示状态：" + this.allBtnsShow);
	}

	listFiles(callback = null) {
		if (this.util.isDiskInfoReady()) {
			//Case 1: diskInfo已经初始化，直接展示
			GlobalService.consoleLog("diskInfo已经初始化，可以加载列表数据...");
			this._listFiles(callback);
		} else {
			//Case 2:  diskInfo没有初始化，猜测是盒子暂未连接，故尝试从缓存拿数据
			GlobalService.consoleLog("diskInfo没有初始化，猜测是盒子暂未连接，故先尝试从缓存拿数据...");
			///// Step 1. 获取磁盘信息
			this.util.getDiskStatus()
				///// Step 2. 获取磁盘信息成功
				.then((res: any) => {
					this.isMainDisk = this.global.currDiskUuid == this.global.mainSelectDiskUuid;
					this.currDiskUuid = this.global.currDiskUuid;
					if (!res) {
						return Promise.reject(null);
					}
					let resSrc = res.iscached ? '缓存' : '网络';
					GlobalService.consoleLog(`从[${resSrc}]拿diskInfo成功,可以加载列表数据... currDiskUuid=${this.global.currDiskUuid}`);
					this._listFiles(callback);
				})
				///// Step 3. 获取磁盘数据异常
				.catch((res) => {
					GlobalService.consoleLog('从[缓存&网络]拿数据失败:' + JSON.stringify(res));
					let solution = "TOFEED";
					switch (solution) {
						case "TOFEED":
							GlobalService.consoleLog("从网络及缓存拿数据都失败，500ms后判断是否直接跳入feed流页面做最后补救");
							setTimeout(() => {
								if (this.util.isDiskInfoReady()) {
									GlobalService.consoleLog("等待500ms过程中，磁盘信息已就绪，不需跳入feed流页面做最后补救");
									this._listFiles(callback);
								} else {
									GlobalService.consoleLog("等待500ms之后，磁盘信息还未就绪，需要跳入feed流页面做最后补救");
									this.tabsController.slideTo(1, "boxtabs");
								}
							}, 500);
							break;
						case "RETRY":
							GlobalService.consoleLog("从网络及缓存拿数据都失败，500ms后判断是否直接跳入feed流页面做最后补救");
							setTimeout(() => {
								if (this.util.isDiskInfoReady()) {
									GlobalService.consoleLog("等待500ms过程中，磁盘信息已就绪，不需跳入feed流页面做最后补救");
									this._listFiles(callback);
								} else {
									GlobalService.consoleLog("等待500ms之后，磁盘信息还未就绪，重试刷新列表");
									this.listFiles(callback);
								}
							}, 500);
							break;
					}
				})
		}
	}

	_listFiles(callback = null) {
		// this.global.createGlobalLoading(this, {delayshowtime:500});
		GlobalService.consoleLog("开始加载列表数据...");

		var url = this.global.getBoxApi("listFolder");
		this.currDiskUuid = this.currDiskUuid || this.global.currDiskUuid;
		GlobalService.consoleLog('请求参数this.currPath=' + this.currPath + '请求参数this.currDiskUuid=' + this.currDiskUuid);
		return this.http.postWithStorage(url, {
			path: this.currPath,
			disk_uuid: this.currDiskUuid
		}, false, {}, {
				storageName: 'FileStorage' + Md5.hashStr(this.currPath + this.currDiskUuid).toString(),
			})
			.then((res: any) => {
				this.global.closeGlobalLoading(this);
				this.dataAcquired = true;
				console.log("=====收到数据=======");
				callback && callback();
				if (res.err_no === 0) {
					res.list = res.list || [];
					var list = [];
					var index = 0;
					// this.type0List = [];
					// this.type1List = [];
					let type0List = [],
						type1List = [];
					if (res.list && res.list.length > 0) {
						res.list.filter((item) => {
							let name = item.name;
							// let name = item.naxme.replace(/\(\d+\)(\.[^\.]+)$/, "$1");
							let md5 = Md5.hashStr(this.currPath + "/" + name).toString();
							let file = {
								name: item.name,
								size: item.size,
								type: item.type,
								path: this.currPath,
								displayTime: this.util.getDisplayTime(item.modify_time * 1000),
								fileStyle: this.util.computeFileType(item.name, item.type),
								selected: false,
								thumbnail: this.global.thumbnailMap[md5] || "",
								index: index++
							};
							if (item.type == 1) {
								type0List.push(file);
							} else {
								type1List.push(file);
							}
						});
						list = type0List.concat(type1List);
						this.type0List = type0List;
						this.type1List = type1List;
					} else {
						this.type0List = [];
						this.type1List = [];
					}
					GlobalService.consoleLog('是否正在loading?' + this.isLoadingData);

					this.transfer.getThumbnail(list, false, this.currPath);
					this.zone.run(() => {
						this.allFileList = list;
						this.fileList = this.allFileList.slice(0, this.pageSize);
					})
					//获取缩略图
					this.clearStatus();
					this.isLoadingData = false;
				}
				return false;
			})
			.catch(e => {
				this.isLoadingData = false;
				this.global.closeGlobalLoading(this);
				callback && callback();
				// GlobalService.consoleLog("获取数据失败:" + JSON.stringify(e));
			})
	}

	handleThumbnailError(obj, e) {
		this.util.handleThumbnailError(obj);
		// GlobalService.consoleLog("缩略图加载出错, 设置为默认图......." + obj.thumbnail)
		// var md5 = Md5.hashStr(this.currPath.replace('\/$', '') + '/' + obj.name).toString();
		// this.global.thumbnailMap[md5] = '';
		// if(obj.thumbnail) {
		// 	this.file.removeFile(obj.thumbnail.replace(/\/[^\/]+$/g, '/'), obj.name);
		// }
		// var defaultPhoto = "./assets/img/image1.svg";
		// if(obj.fileStyle == 'image') {
		// 	obj.thumbnail = defaultPhoto;
		// } else {
		// 	obj.thumbnail = '';
		// }
		//存入全局缓存，将会导致该图片永不刷新
		// var md5 = Md5.hashStr(that.currPath.replace('\/$', '') + '/' + obj.name).toString();
		// that.global.thumbnailMap[md5] = defaultPhoto;
	}

	judgeBusy() {
		return this.global.fileTaskList.some(item => {
			return !item.finished && item.pausing != 'paused' && item.boxId == this.global.deviceSelected.boxId && item.bindUserHash == this.global.deviceSelected.bindUserHash && item.diskUuid == this.currDiskUuid;
		});
	}

	//预置目录检查：不允许用户删除该目录
	checkFixedContent() {
		var fixedContentCheck = this.selectedFiles.filter(item => {
			return item.name === 'Images' || item.name === 'Videos' || item.name === 'Documents' || item.name === 'Musics';
		})
		return fixedContentCheck.length === 0;
	}

	// 长按，显示按钮区域，并将当前文件加入选择list，同时需要更新底部导航栏状态
	showAllBtns() {
		this.allBtnsShow = true;
	}

	goBack() {
		this.navCtrl.pop();
	}

	cancelSelect() {
		GlobalService.consoleLog("重置状态");
		this.clearStatus();
	}

	selectAll() {
		GlobalService.consoleLog("用户触发全选，触发的操作是：" + this.selectAllStatus);
		this.selectedFiles = [];
		if (!this.selectAllStatus) {
			GlobalService.consoleLog("当前已经全选");
			for (let i = 0, len = this.type0List.length; i < len; i++) {
				this.type0List[i].selected = true;
				this.selectedFiles.push(this.type0List[i]);
			}
			for (let i = 0, len = this.type1List.length; i < len; i++) {
				this.type1List[i].selected = true;
				this.selectedFiles.push(this.type1List[i]);
			}
		} else {
			for (let i = 0, len = this.type0List.length; i < len; i++) {
				this.type0List[i].selected = false;
			}
			for (let i = 0, len = this.type1List.length; i < len; i++) {
				this.type1List[i].selected = false;
			}
			this.selectedFiles = [];
		}
		this.selectAllStatus = !this.selectAllStatus;
		this.setBtnsStatus();
	}

	downloadFileList() {
		if (!this.canDownload) {
			return false;
		}
		GlobalService.consoleLog("开始下载文件");
		if (!this.setSelectedFiles.length) {
			GlobalService.consoleLog("尚未选择文件，无法下载");
			return false;
		}
		this.global.createGlobalToast(this, {
			message: this.global.L('StartDownloading')
		})
		var flag = false;
		for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
			let selected = this.selectedFiles[i];
			let subFoldPath = {
				'image': this.global.PhotoSubPath,
				'video': this.global.VideoSubPath,
				'music': this.global.MusicSubPath
			}[selected.fileStyle] || this.global.DocSubPath;
			this.transfer.downloadFile({
				name: selected.name,
				fileStyle: selected.fileStyle,
				thumbnail: selected.thumbnail
			}, this.currPath.replace(/\/$/g, '') + "/" + selected.name, this.global.fileSavePath + subFoldPath + '/' + selected.name, true, {
					total: selected.size
				});
		}

		this.allBtnsShow = false;
		this.clearStatus();
	}

	deleteFile() {
		if (!this.canDelete) {
			return false;
		}
		if (!this.selectedFiles.length) {
			GlobalService.consoleLog("尚未选择文件，无法删除");
			return false;
		}
		GlobalService.consoleLog("开始删除文件");

		var path = [];
		for (var i = 0, len = this.selectedFiles.length; i < len; i++) {
			path.push(this.currPath.replace(/\/$/g, '') + "/" + this.selectedFiles[i].name);
		}
		var hasFolder = this.selectedFiles.filter(item => item.type === 1).length;
		var self = this;
		this.util.deleteFileDialog(path, hasFolder, () => {
			//完成删除回调
			this.listFiles();
			this.allBtnsShow = false;
			this.global.createGlobalToast(this, {
				message: Lang.L('WORD57a63e05')
			});
		})
		return true;
	}

	renameFile() {
		if (!this.canRename) {
			return false;
		}
		GlobalService.consoleLog("开始重命名文件");
		if (this.selectedFiles.length !== 1) {
			GlobalService.consoleLog("尚未选择文件，无法删除");
			return false;
		}
		var selectedFile = this.selectedFiles[0];
		var self = this;
		var sn = selectedFile.name;
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
					text: Lang.L('WORD85ceea04'),
					cssClass: 'order-3',
					handler: data => {
						GlobalService.consoleLog('Cancel clicked');
						// this.global.alertCtrl.dismiss();
						// this.handleBack();
					}
				},
				{
					text: Lang.L('WORD65abf33c'),
					cssClass: 'order-2',
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
						var selectedFile = this.selectedFiles[0];
						var prefix = this.currPath.replace(/\/$/g, '') + "/";
						var regex = /\.([^\.])+$/;
						var oName = this.selectedFiles[0].name;
						self.moveFile(prefix, oName, prefix, name, "rename");
						return true;
					}
				}
			]
		})
		return true;
	}

	moveFile(oldPath, oldName, newPath, newName, type = "rename") {
		GlobalService.consoleLog('list move   ssss' + this.selectedFiles.length)
		var selectedFile = this.selectedFiles[0];

		this.util.moveFile(oldPath, oldName, newPath, newName)
			.then((res) => {
				if (res) {
					GlobalService.consoleLog("重命名成功");
					this.listFiles();
					this.allBtnsShow = false;
					this.global.alertCtrl && this.global.alertCtrl.dismiss();
					let message = "";
					if (type === 'rename') {
						message = selectedFile.type === 1 ? Lang.L('RenameDirectorySuccess') : Lang.L('RenameFileSuccess');
					} else {
						message = selectedFile.type === 1 ? Lang.L('MoveDirectorySuccess') : Lang.L('MoveFileSuccess');
						this.moveChangeList(selectedFile);
					}
					this.global.createGlobalToast(this, {
						message: message
					});
					this.cancelSelect();
				}
			})
		return true;
	}

	initPage() {
		var type = this.navParams.get("type");
		var diskName = this.navParams.get("name") || '';
		var config = {
			'all': {
				title: Lang.L('DirAllFiles'),
				path: "/"
			},
			'image': {
				title: Lang.L('DirImages'),
				path: '/Images',
			},
			'video': {
				title: Lang.L('DirVideos'),
				path: '/Videos',
			},
			'music': {
				title: Lang.L('DirMusics'),
				path: '/Musics',
			},
			'document': {
				title: Lang.L('DirDocuments'),
				path: '/Documents',
			}
		};
		if (config[type]) {
			// this.pageTitle = config[type].title;
			this.pageTitle = config[type].title;
			this.currPath = config[type].path || '/';
		} else {
			var path = this.navParams.get('path') || '/';
			var myItem = "";
			for (var item in config) {
				if (config[item].path === path) {
					myItem = item;
					break;
				}
			}
			if (myItem) {
				// this.pageTitle = config[myItem].title;
				this.pageTitle = config[myItem].title;
			} else {
				this.showTitle = path.split("/");
				this.pageTitle = this.showTitle[this.showTitle.length - 1];
			}
			this.currPath = path;
		}
		if (diskName != '') {
			this.pageTitle = diskName;
		}
		this.global.currPath = this.currPath;
		this.dataAcquired = false;
		this.selectedFiles = [];
	}

	closeFileSelect() {
		GlobalService.consoleLog("关闭浮层");
		this.showFileSelect = false;
	}

	openFileSelect() {
		GlobalService.consoleLog("打开浮层");
		this.showFileSelect = true;
	}

	goFolderPage(param) {
		if (this.currPath == '/') {
			this.app.getRootNav().push(ListPage, {
				type: param.type,
				path: param.path
			});
		} else {
			this.navCtrl.push(ListPage, {
				type: param.type,
				path: param.path
			});
		}
	}

	goCopyFolder(file) {
		if (!this.allBtnsShow) {
			this.app.getRootNav().push(ListPage, {
				type: "",
				path: this.copyPhotoInfo.path.replace(/\/$/g, '')
			});
		}
	}
	goNextFolder(file) {
		if (this.allBtnsShow) {
			this.setSelectedFiles(file);
		} else {
			if (file.type === 1) {
				GlobalService.consoleLog("选择了文件夹，进入文件夹");
				this.app.getRootNav().push(ListPage, {
					type: "",
					path: this.currPath.replace(/\/$/g, '') + "/" + file.name
				});
			} else if (file.fileStyle == 'image') {
				let test = /(\.HEIC|\.webp)$/gi;
				if (test.test(file.name)) {
					this.app.getRootNav().push(PreviewOtherPage, {
						currPath: this.currPath,
						info: file
					});
				} else {
					let list = this.allFileList.filter(item => {
						return item.fileStyle == 'image' && !test.test(item.name)
					});
					let index = 0;
					for (let i = 0; i < list.length; i++) {
						if (list[i].name == file.name) {
							index = i;
							break;
						}
					}
					this.app.getRootNav().push(PreviewImagePage, {
						currPath: this.currPath,
						info: file,
						from: 'list',
						list: list,
						pageIndex: this.pageNo,
						pageSize: this.pageSize,
						count: list.length,
						index: index
					});
				}
			} else if (file.fileStyle == 'video' && file.name.endsWith('.mp4')) {
				console.log("文件信息：" + JSON.stringify(file))
				let url = this.global.getBoxApi('downloadFile');
				let path = url + this.http.toQueryString({
					fullpath: file.path.replace(/\/$/, '') + '/' + file.name,
					disk_uuid: this.currDiskUuid,
					token: this.http.getCookieString(url).replace('token=', '')
				})
				console.log("即将播放视频:" + path)
				this.app.getRootNav().push(VideoPlayerPage, {
					videoUrl: path,
					imageUrl: file.thumbnail,
					name: file.name
				})
				// this.util.openVideo("https://www.yqtc.co/iamtest/ubox/VID_20181119_170603.mp4");
				// this.util.openVideo(path);
			} else {
				GlobalService.consoleLog("查看文件详情：" + JSON.stringify(file))
				this.app.getRootNav().push(PreviewOtherPage, {
					currPath: this.currPath,
					info: file
				});
				GlobalService.consoleLog("选择了文件，打开文件");
			}
		}

	}

	addFileDone() {
		this.listFiles();
	}

	goTaskPage() {
		this.app.getRootNav().push(TaskListPage);
	}

	moveSingleFile() {
		if (!this.canMove) {
			this.global.selectFolderType = 'upload';
			return false;
		}
		this.global.selectFolderType = 'move';
		this.app.getRootNav().push(BtSetDiskPage)
	}

	closeTypeList() {
		if (this.isShowType) {
			this.events.publish('type-list:close', false);
		}
	}

	noPhoto() {
		GlobalService.consoleLog('没有拿到img');
		// photo.thumbnail = '';
	}

	toggleListStatus(status) {
		if (status == 0) {
			this.isShowType0List = !this.isShowType0List
		} else {
			this.isShowType1List = !this.isShowType1List
		}
	}

	getFileInfo() {
		// HomePage._this = this;
		if (this.fileManager.readPermitted) {
			if (!this.fileManager.photoLibraryReady) {
				this.fileManager.initFileList();
			}
			if (this.global.deviceSelected) {
				GlobalService.consoleLog(JSON.stringify(this.global.deviceSelected))
				let config = this.fileManager.resourceStorage['image'];
				GlobalService.consoleLog("图片配置：" + JSON.stringify(config));
				if (config.finished) {
					GlobalService.consoleLog("图片获取已完成，直接备份");
					setTimeout(() => {
						this.fileManager.startBackUp();
					}, 1000)
				} else if (this.platform.is('cordova')) {
					GlobalService.consoleLog("图片获取尚未完成，需要先拉配置");
					this.fileManager.getBackupInfo()
						.then(res => {
							this.fileManager.fetchAlbums('image')
						})
						.catch(e => {
							//不需要备份
						})
				}
			}
		}
	}


	goDetailPage(info) {
		this.app.getRootNav().push(FileDetailPage, {
			info: info
		})
	}



	toggleClassifyNav(isShow = null) {
		GlobalService.consoleLog("已点击......")
		if (isShow != null) {
			GlobalService.consoleLog("关闭下拉菜单");
			this.isShowClassifyNav = false;
		} else {
			GlobalService.consoleLog("打开下拉菜单");
			this.isShowClassifyNav = !this.isShowClassifyNav;
		}
	}

	toggleClassifyNav2() {
		GlobalService.consoleLog("打开菜单..." + this.isShowClassifyNav);
		this.isShowClassifyNav = !this.isShowClassifyNav;
	}



	displayMenu($event) {
		GlobalService.consoleLog("即将显示左侧菜单........");
		this.menuCtrl.open();
		if ($event.stopPropagation) {
			$event.stopPropagation();
		}
	}


	selectDisk(disk) {
		this.clearStatus();
		this.global.currDiskUuid = disk.uuid;
		this.global.currSelectDiskUuid = disk.uuid;
		this.currPath = '/';
		this.app.getRootNav().push(ListPage, {
			type: "",
			path: this.currPath,
			name: disk.label
		});
	}

	computeSize(size) {
		let showSize = (size / GlobalService.DISK_G_BITS).toFixed(0).replace('.', '') + "G"
		return showSize
	}

	closeWarningBox() {
		this.isShowWarningBox = false;
	}
}
