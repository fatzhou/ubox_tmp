import { NavController, NavParams, Item } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { GlobalService } from '../../providers/GlobalService';
import { Lang } from '../../providers/Language';
import { FileOpener } from '@ionic-native/file-opener';
import { Util } from '../../providers/Util';
import { FileManager } from '../../providers/FileManager';
import { ItemSliding } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { Component, NgZone, Input, Output, EventEmitter} from '@angular/core';
import { Md5 } from "ts-md5/dist/md5";
import { FileTransport } from '../../providers/FileTransport';
/**
 * Generated class for the TaskComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'task',
  templateUrl: 'task.html'
})
export class TaskComponent {
    doingTaskList:any = [];
    doneTaskList:any = [];
    taskStatus:string = 'paused';
    fileTaskList:any  =[];
    allBtnsShow: Boolean = false;
    canDelete: Boolean = false;
    selectAllStatus: Boolean = false;
    selectFileNum: any = 0;
    showFileSelect: Boolean = false;
    deteleSingle: boolean = false;
    singleTask: any;
    showEng: any = GlobalService.applang;
    isDeleteType: any = 'android';
	isShowShadow: boolean = false;
	
	@Input() path: any;

    constructor(public navCtrl: NavController,
        private storage: Storage,
        private events: Events,
        private global: GlobalService,
        private platform: Platform,
        private fileOpener: FileOpener,
        private fileManager: FileManager,
		private util: Util,
		private zone: NgZone,
		private transfer: FileTransport,
        public navParams: NavParams) {
        let self = this;

		this.filterTaskList = this.filterTaskList.bind(this);

        // events.unsubscribe('file:updated');
        GlobalService.consoleLog("监听file:updated事件");
		events.subscribe('file:updated',this.filterTaskList)  
		events.subscribe('task:created',this.filterTaskList)  
		
		this.isDeleteType = this.global.platformName;
		this.filterTaskList();
    }
	
    ngOnDestory() {
		this.cancelSelect();
		this.events.unsubscribe('file:updated',this.filterTaskList)       
		this.events.unsubscribe('task:created',this.filterTaskList)       
    }
    
    filterTaskList() { 
		GlobalService.consoleLog("任务列表变更.......");
		let _that = this;
		_that.zone.run(() => {
			_that.fileTaskList = _that.global.fileTaskList.filter(item=> item.boxId == _that.global.deviceSelected.boxId && item.action == 'upload' && (item.path.replace(/\/[^\/]+$/g, '/')) == this.path.replace(/\/$/, '') + '/' && !item.finished && item.bindUserHash == _that.global.deviceSelected.bindUserHash ) || [];
			_that.doingTaskList = _that.fileTaskList.filter(item => item.finished === false) || [];
			// _that.doneTaskList = _that.fileTaskList.filter(item => item.finished === true) || [];
			// _that.doneTaskList = _that.doneTaskList.sort(function(a, b) {
			// 	return Number(b.finishedTime) - Number(a.finishedTime);
			// });
			_that.getThumbnail();
			_that.doingTaskList.reverse();
			GlobalService.consoleLog("任务列表过滤完毕....");			
		})

		// _that.cd.detectChanges();
        // this.doneTaskList.reverse();
	}
	
	handleThumbnailError(obj, e) {
		console.log("缩略图加载出错.......")
		obj.thumbnail = '';
		//存入全局缓存，将会导致该图片永不刷新
		// var md5 = Md5.hashStr(that.currPath.replace('\/$', '') + '/' + obj.name).toString();
		// that.global.thumbnailMap[md5] = defaultPhoto;
	}

    getThumbnail() {
        for(let i = 0, len = this.fileTaskList.length; i < len; i++) {
			let task = this.fileTaskList[i];
			let md5 = Md5.hashStr(task.path).toString();

            if((task.fileStyle === 'image' || (task.fileStyle == 'video' && task.finished == true)) && !task.thumbnail) {
				if(this.global.thumbnailMap[md5]) {
					task.thumbnail = this.global.thumbnailMap[md5];
					continue;
				}
                //图片上传下载需显示缩略图
                setTimeout(()=>{
                    GlobalService.consoleLog("获取缩略图：" + task.localPath + "***" + task.path + "***" + task.name);
					return this.transfer.getFileLocalOrRemote(task.path.replace(/\/[^\/]+$/, ""), task.name, this.global.fileSavePath + this.global.ThumbnailSubPath + "/", md5 + ".png", this.global.ThumbnailSubPath, 'thumbnail')
					.then(res => {
						if(res) {
							task.thumbnail = res;
							this.global.thumbnailMap[md5] = res;			
						}
					})

					// this.fileManager.getThumbnail(task.localPath, task.path)
                    // .then(res => {
					// 	console.log("获取缩略图成功：" + res)
					// 	if(res) {
					// 		task.thumbnail = res;
					// 		this.global.thumbnailMap[md5] = res;
					// 	}
                    // })
                    // .catch(e => {

                    // })                    
                }, i * 100);
            }
        }        
    }

    computeLoading(task) {
        if(task.loaded === 0) {
            return 0;
        } else {
            return Math.ceil(task.loaded * 100 / task.total);
        }
    }

    pretify(name) {
        if(name.length < 22) {
            return name;
        } else {
            return name.slice(0, 12) + '...' + name.slice(-8);
        }
    }

    startTask(task) {
        task.pausing = 'doing';
        let handler = this.global.fileHandler[task.taskId];
        if(handler) {
            GlobalService.consoleLog("taskId存在，直接恢复");
            handler.resume();  
        } else {
            GlobalService.consoleLog("taskId失效，重新创建任务:" + task.taskId);
            if(task.action === 'upload') {
                this.events.publish('create:upload', task);
            } else {
                this.events.publish('create:download', task);
            }
        }
        this.checkStatus();
        this.checkTaskList(task, "start");
    }

    checkTaskList(task, pausing) {
        var status = pausing === 'start' ? 'doing' : 'waiting';
        var maxLen = task.action == 'upload' ? this.global.fileMaxUpload : this.global.fileMaxDownload;
        var filterTask = this.fileTaskList.filter(item => item.action === task.action && item.pausing === status && item.taskId !== task.taskId && item.finished === false);
        if(pausing === 'start') {
            if(filterTask.length > maxLen - 1) {
                this.pauseTask(filterTask[0], 'waiting', 'uncheck');
            }            
        } else if(pausing === 'pause') {
            if(filterTask.length > 0) {
                this.startTask(filterTask[0]);
            }          
        }
    }

    checkStatus(){
        let pausedTask = this.fileTaskList.filter(item => item.pausing === 'paused' && item.finished == false);
        if(pausedTask.length > 0){
            this.taskStatus = 'doing';
        }else{
            this.taskStatus = 'pause';
        }
    }

    pauseTask(task, status, checked) {
        task.pausing = status || 'paused';
        let handler = this.global.fileHandler[task.taskId];
        if(handler){
            handler.pause();
            task.speed = 0;
        }
        this.checkStatus();
        if(checked === 'check'){
            this.checkTaskList(task, "pause");
        }
    }

    toggleStatus(task) {
        if(task.pausing === 'paused' || task.pausing === 'waiting') {
            this.startTask(task);
        } else {
            this.pauseTask(task, 'paused','check');
        }
    }

    openFile(task) {
        if(this.allBtnsShow) {
            this.toggleTask(task);
        } else {
            this.util.openFile(task.localPath);
        }
    }
    //取消选择
    clearStatus() {
        this.allBtnsShow = false;
    }
    //长按，显示按钮区域，并将当前文件加入选择list，同时需要更新底部导航栏状态
    showAllBtns(info) {
        this.allBtnsShow = true;
        if(info) {
            this.setSelectedFiles(info);            
        }
    }
    //点击，选中或取消
    toggleTask(info) {
        this.cancalDelete();
        if(this.allBtnsShow) {
            this.setSelectedFiles(info);
        } 
    }
    //勾选文件
    setSelectedFiles(file) {
        GlobalService.consoleLog("选择了文件:" + JSON.stringify(file));
        var taskId = file.taskId;
        //反选
        file.selected = !file.selected;
        this.setBtnsStatus();
    }
    setBtnsStatus() {
        let doingTask = this.doingTaskList.filter(item => item.selected === true);
        let doneTask = this.doneTaskList.filter(item => item.selected === true);
        let len = doingTask.length + doneTask.length;
        this.selectFileNum = len;
        //只要选中至少1个文件，就可删除
        this.canDelete = len > 0;
    }
    cancelSelect() {
        GlobalService.consoleLog("重置状态");
        this.clearStatus();
        this.doingTaskList.map(item => item.selected = false);
        this.doneTaskList.map(item => item.selected = false);
        this.global.fileTaskList.map(item => item.selected = false);
        this.selectAllStatus = false;
        this.singleTask = null;
        this.deteleSingle = false;
    }

    selectAll() {
        GlobalService.consoleLog("用户触发全选，触发的操作是：" + this.selectAllStatus);
    
        for(let i = 0, len = this.fileTaskList.length; i < len; i++) {
            this.fileTaskList[i].selected = !this.selectAllStatus;
        }            

        this.selectAllStatus = !this.selectAllStatus;
        this.setBtnsStatus();
    }
    deleteFile() {
        if(!this.canDelete) {
            return false;
        }
        var self = this;
        this.global.createGlobalAlert(this, {
            title: Lang.L('WORD5627ad0c1'),
            message: Lang.L('WORD5627ad0c2'),
            // enableBackdropDismiss: false,
            buttons: [
                {
                    text: Lang.L('WORD0e46988a'),
                    handler: data => {
                        self.deleteFileIndeed();
                        self.setBtnsStatus();
                        return true;
                    }
                },
                {
                    text: Lang.L('WORD85ceea04'),
                    handler: data => {
                        GlobalService.consoleLog('Cancel clicked');
                    }
                },
            ]
        });
        return true;
    }
    deleteFileIndeed() {
        let deleteFileList;
        if(this.deteleSingle == false) {
            deleteFileList = this.fileTaskList.filter(item => item.selected === true);
        } else {
            deleteFileList = [this.singleTask];
        }
        if(!deleteFileList.length) {
            GlobalService.consoleLog("没有可删除的任务");
            return false;
        }
        for(let i = 0 , len = deleteFileList.length ; i < len;i++){
            let deleteTaskId = deleteFileList[i].taskId;
            let index = this.global.fileTaskList.indexOf(deleteFileList[i]);
            this.global.fileTaskList.splice(index, 1);
            let handler = this.global.fileHandler[deleteTaskId];
            if(handler) {
                handler.pause();
                delete this.global.fileHandler[deleteTaskId];
            }
        }
        this.events.publish('taskList:changed');
        this.filterTaskList();
        this.clearStatus();
        this.singleTask = null;
        this.deteleSingle = false;
        this.isShowShadow = false;
    }

    showAndroidDeleteBox(task) {
        if(this.isDeleteType == 'android') {
            this.singleTask = task;
            this.isShowShadow = true;
        } else {
            this.singleTask = null;
        }
    }

    deleteSingleTask(task) {
        this.deteleSingle = true;
        this.singleTask = task;
        this.deleteFileIndeed();
        this.setBtnsStatus();
    }

    cancalDelete() {
        this.isShowShadow = false;
        this.singleTask = null;
    }
}
