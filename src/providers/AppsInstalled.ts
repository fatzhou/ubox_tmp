import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { GlobalService } from '../providers/GlobalService';
import { HttpService } from '../providers/HttpService';
import xml2js from 'xml2js';
import { HTTP } from '@ionic-native/http/ngx';
import { IfObservable } from 'rxjs/observable/IfObservable';
import { Md5 } from "ts-md5/dist/md5";
// import { Zip } from '@ionic-native/zip/ngx';

/*
  Generated class for the AppsInstalledProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
declare var zip;

@Injectable()
export class AppsInstalled {
	uappDir;
	constructor(private file: File,
		private global: GlobalService,
		private nativeHttp: HTTP,
		private http: HttpService,
		// private zip: Zip
	) {
		GlobalService.consoleLog('Hello AppsInstalledProvider Provider');
		//this.uappDir = this.global.fileSavePath + "www/uapp/";
	}

	/**
	 * [checkAppInstalled 检查bundleid对应的包是否存在]
	 * @param {[type]} id [bundleid]
	 */
	checkAppInstalled(id) {
		return this.file.checkDir(this.uappDir, id)
			.then(res => {
				//uapp存在
				return true;
			})
			.catch(res => {
				return false;
			})
	}

	createDir(fileSystem, folder) {
		return this.file.createDir(fileSystem, folder, false)
			.then(res => {
				GlobalService.consoleLog("成功创建文件夹" + folder);
				return true;
			})
			.catch(e => {
				GlobalService.consoleLog("文件夹" + folder + "已存在，无需创建");
				return true;
			})
	}

	/**
	 * [installUapp 安装uapp]
	 * @param {[string]} id  [uapp的bundleid]
	 * @param {[string]} xml [uapp的xml下载地址]
     * @param {[boolean]} box [uapp的xml下载地址]
	 * @param {[function]} progress [uapp的进度跟踪函数]
	 * ]
	 */
	installUapp(info, progress) {
		if (!this.uappDir) {
			console.error("Uappdir not initialized...");
			this.uappDir = this.global.fileSavePath + "www/uapp/";
		}
		GlobalService.consoleLog("安装目录:" + this.uappDir);
		GlobalService.consoleLog("安装参数:" + JSON.stringify(info));
		let xmlMd5 = "";
		//通知进度更新
		progress({
			process: 'start'
		});
		//安装文件夹确保存在
		return this.createDir(this.global.fileSavePath, 'www')
			.then(res => {
				GlobalService.consoleLog("开始检查文件夹uapp...");
				//uapp文件夹确保存在
				return this.createDir(this.global.fileSavePath + "www/", "uapp");
			})
			.then(res => {
				GlobalService.consoleLog("开始应用文件夹" + info.id + "_tmp");
				//创建应用目录
				return this.createDir(this.uappDir, info.id + "_tmp");
			})
			.then(res => {
				progress({
					process: 'folderCreated'
				})
				GlobalService.consoleLog("下载xml地址:" + info.xml);
				//下载xml
				return new Promise((resolve, reject) => {
					this.http.get(info.xml, {}, false, {}, {}, true)
						.then(res => {
							GlobalService.consoleLog("xml下载完毕");
							let parser = new xml2js.Parser({
								trim: true,
								explicitArray: true
							});
							if (info.box) {
								xmlMd5 = Md5.hashStr(res).toString();
							}
							parser.parseString(res, function (err, result) {
								if (err) {
									GlobalService.consoleLog("xml解析出错");
									reject();
								} else {
									GlobalService.consoleLog("xml已成功解析:" + JSON.stringify(result))
									resolve(result);
								}
							})
						})
						.catch(e => {
							GlobalService.consoleLog("下载xml错误....");
							reject();
						})
				});
			})
			.then((r: any) => {
				progress({
					process: 'xmlDownloaded'
				})
				let uapp = r.uapp;
				//计算前缀
				let prefix = info.xml.replace(/([^\/]+)$/, '');
				GlobalService.consoleLog("计算下载路径的前缀：" + prefix);
				let promises = [];
				let taskId = '';
				if (info.box) {
					GlobalService.consoleLog("应用需关联盒子，启动盒子下载任务:" + prefix + uapp.box[0].packageurl[0]);
					//通知box下载
					let url = this.global.getBoxApi('downloadUapp');
					promises.push(this.http.post(url, {
						bundleid: info.id,
						xml_url: info.xml,
						xml_md5: xmlMd5,
					})
						.then(res => {
							if (res.err_no === 0) {
								taskId = res.taskid;
								return this.checkBoxDownloadInterval(taskId, progress);
							} else {
								throw new Error('Box download error...' + JSON.stringify(res));
							}
						})
						.then(res => {
							GlobalService.consoleLog("盒子下载成功，即将安装.....");
							return this.http.post(this.global.getBoxApi('installUapp'), {
								taskid: taskId,
								bundleid: info.id
							})
						})
						.then(res => {
							progress({
								process: 'boxAppInstalled'
							})
							if (res.err_no === 0) {
								return res;
							} else {
								throw new Error('Failed to install apps in box');
							}
						})
						.catch(e => {
							throw new Error("Box downloading error....");
						}));
				}
				let www = uapp.www[0];
				let url = prefix + www.packageurl[0],
					md5 = www.md5[0];
				let fileName = url.replace(/.*\/([^\/]+)$/, "$1");
				let zipPath = this.uappDir + info.id + "_tmp/" + fileName;
				GlobalService.consoleLog("下载zip文件到本地:" + zipPath);
				promises.push(new Promise((resolve, reject) => {
					this.nativeHttp.downloadFile(url, {}, {}, zipPath)
						.then(res => {
							//TODO: 检查md5是否正确
							if (0) {
								//md5不正确
								reject();
							} else {
								GlobalService.consoleLog("下载zip包完成：" + JSON.stringify(res))
								let path1 = zipPath;
								let path2 = zipPath.replace(/[^\/]+$/, "");
								GlobalService.consoleLog("第一个参数" + path1)
								GlobalService.consoleLog("第二个参数" + path2)
								zip.unzip(path1, path2, () => {
									GlobalService.consoleLog("安装包解压完毕");
									//删除安装包
									this.file.removeFile(this.uappDir + info.id + "_tmp/", fileName);
									progress({
										process: 'pkgZipped'
									})
									//解压完毕
									resolve();
								}, (progress) => {
									GlobalService.consoleLog('Unzipping, ');
									// GlobalService.consoleLog('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%');
								})
								/*
								this.zip.unzip(path1, path2, (progress) => {
									GlobalService.consoleLog('Unzipping, ');
									// GlobalService.consoleLog('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%');
								})
								.then(() => {
									GlobalService.consoleLog("安装包解压完毕");
									//删除安装包
									this.file.removeFile(this.uappDir + info.id + "_tmp/", fileName);
									progress({
										process: 'pkgZipped'
									})
									//解压完毕
									resolve();
								    
								}, (data) => {
									//进度提示
									GlobalService.consoleLog("解压完成进度:" + JSON.stringify(data));
								})  */
							}
						})
						.catch(e => {
							GlobalService.consoleLog("下载失败zip:" + e.stack);
							reject(e);
						})
				}));
				return Promise.all(promises);
			})
			.then(res => {
				progress({
					process: 'installFinished'
				})
				//盒子已安装完毕，重命名文件夹
				return this.file.checkDir(this.uappDir, info.id)
					.then(res => {
						GlobalService.consoleLog(JSON.stringify(res))
						GlobalService.consoleLog("应用" + info.id + "文件夹已存在，需要先删除..." + this.uappDir);
						//存在
						return this.file.removeRecursively(this.uappDir, info.id);
					}, res => {
						GlobalService.consoleLog("应用文件夹" + info.id + "不存在，可直接moveDir")
						return true;
					})
					.then(res => {
						GlobalService.consoleLog("开始移动文件夹.....");
						return this.file.moveDir(this.uappDir, info.id + "_tmp", this.uappDir, info.id);
					})
					.catch(e => {
						GlobalService.consoleLog("移动文件夹出错.." + JSON.stringify(e) + (e && e.stack));
						throw new Error('Move file error....');
					})
			})
			.then(res => {
				GlobalService.consoleLog("应用安装成功...");
				this.uappInstalled[info.id] = {
					id: info.id,
					version: info.version,
					localUrl: "/" + info.id + "/index.html",
					title: info.title,
					type: info.type,
					box: info.box
				};
				//更新本地数据
				return this.setInstalledApps(this.uappInstalled);
			})
			.then(res => {
				progress({
					process: "finished"
				})
			})
			.catch(e => {
				GlobalService.consoleLog("安装过程出错。。。" + e);
				this.global.createGlobalToast(this, {
					message: this.global.Lf('InstallError', info.title)
				})
				this.uninstallUapp(info);
				throw new Error('Install failed...');
			})
	}

	uninstallUapp(item) {
		//删除uapp
		let url = this.global.getBoxApi('uninstallUapp');

		delete this.uappInstalled[item.id];
		this.setInstalledApps(this.uappInstalled)
			.then(res => {
				item.progress = undefined;
				this.global.createGlobalToast(this, {
					message: this.global.Lf('UappUninstalled', item.title)
				})
				//记录删除成功
				if (item.box) {
					return this.http.post(url, {
						bundleid: item.id
					})
				} else {
					return {
						err_no: 0
					}
				}
			})
			.then((res: any) => {
				//删除本地文件
				return this.file.removeRecursively(this.uappDir, item.id);
			})
			.catch(e => {
				GlobalService.consoleLog("应用卸载失败.." + JSON.stringify(e));
			})
	}

	setInstalledApps(apps) {
		GlobalService.consoleLog("即将保存应用列表到文件中");
		return this.file.checkFile(this.uappDir, 'appmanifest.json')
			.then(res => {
				GlobalService.consoleLog("appmanifest.json文件已存在");
				//有安装的应用
				return res;
			}, res => {
				GlobalService.consoleLog("appmanifest.json文件不存在，要先创建");
				//无任何应用
				return this.file.createFile(this.uappDir, 'appmanifest.json', true)
			})
			.then(res => {
				return this.file.writeFile(this.uappDir, 'appmanifest.json', JSON.stringify(apps), { replace: true })
			})
	}

	getInstalledApps() {
		if (!this.uappDir) {
			console.error("Uappdir not initialized...");
			this.uappDir = this.global.fileSavePath + "www/uapp/";
		}
		GlobalService.consoleLog("开始获取已安装应用列表......" + this.uappDir);
		return this.file.readAsBinaryString(this.uappDir, 'appmanifest.json')
			.then(res => {
				GlobalService.consoleLog("已安装以下应用：" + res);
				try {
					this.uappInstalled = JSON.parse(res);
				} catch (r) {
					this.uappInstalled = {};
				}
				//有安装的应用
				return this.uappInstalled;
			}, res => {
				GlobalService.consoleLog("尚未安装任何应用");
				this.uappInstalled = {};
				//无任何应用
				return this.uappInstalled;
			})
	}

	checkBoxDownloadInterval(taskId, progress) {
		let url = this.global.getBoxApi('checkUappProgress');
		return new Promise((resolve, reject) => {
			let interval = null;
			let closeInterval = () => {
				if (interval) {
					clearInterval(interval);
					interval = null;
				}
			}
			let fail = () => {
				closeInterval();
				reject();
			}
			interval = setInterval(() => {
				this.http.post(url, {
					taskid: taskId
				})
					.then((res: any) => {
						if (res.err_no === 0) {
							if (res.status === 3) {
								//下载成功
								closeInterval();
								resolve(true);
							} else if (res.status === 1) {
								//下载中
								progress({
									process: 'boxDownloading',
									finish: res.finish,
									total: res.total
								})
							} else {
								GlobalService.consoleLog("盒子进度异常，reject");
								fail();
							}
						} else {
							fail();
						}
					})
					.catch(e => {
						fail();
					})
			}, 2000)
		})
	}

	public uappInstalled = {};
}
