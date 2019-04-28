import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
import { Platform } from 'ionic-angular';
import { PhotoLibrary, LibraryItem } from '@ionic-native/photo-library';
import { File, FileEntry } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Storage } from '@ionic/storage';
import { FileUploader } from './FileUploader';
import { HttpService } from './HttpService';
import { Util } from './Util';
import { Md5 } from "ts-md5/dist/md5";
import { Events } from 'ionic-angular';
import { FileTransport } from "./FileTransport";
declare var cordova;
declare var window;

@Injectable()
export class FileManager {
	photoLibraryReady = false;
	readPermitted = false;
	backupId = 0; //当前备份ID
	autoBackupSwitch = true; //是否自动备份

	resourceStorage = {
		"image": {
			read: false,
			write: false,
			name: 'localPictureLibrary',
			album: 'localAlbum',
			finished: false
		},
		"video": {
			read: false,
			write: false,
			name: 'localVideoLibrary',
			album: '',
			finished: false
		},
		"audio":  {
			read: false,
			write: false,
			name: 'localAudioLibrary',
			finished: false
		},
		"document":  {
			read: false,
			write: false,
			name: 'localDocumentLibrary',
			finished: false		
		}
	};

	constructor(
		private global: GlobalService,
		private http: HttpService,
		private platform: Platform,
		private file: File,
		private util: Util,
		private storage: Storage,
		private events: Events,
		private fileOpener: FileOpener,
		private transfer: FileTransport,
		private fileUploader: FileUploader,
		private photoLibrary: PhotoLibrary
	) {
	}

	initFileList() {
		this.getPermission()
		.then(res => {
			if(this.platform.is('android')) {
				this.getLocalFiles('image');
				this.getLocalFiles('video');
				this.getLocalFiles('document');
				this.getLocalFiles('audio');				
			} else {
				this.getLocalFiles('image');
				this.getLocalFiles('video');
			}
		})
		.catch(e => {
			console.log("未获取到权限");
		})
	}

	getLocalFiles(type) {
		let config = this.resourceStorage[type];
		let name = config.name;
		if(this.global[name] && this.global[name].length > 0) {
			return Promise.resolve(this.global[name]);
		} else {
			//读取缓存文件
			return this.searchLocalFiles(type);		
		}
	}

	getOriginUrl(info) {
        if(this.platform.is('android')) {
            let id = info.id;
            return 'file://' + id.split(';')[1];                
        } else {
            return 'file://' + info.filePath;
        }	    		
	}

	getNativeUrl(info) {
	    return new Promise((resolve, reject) => {
	        if(this.platform.is('android')) {
	            let id = info.id;
	            resolve('file://' + id.split(';')[1]);                
	        } else {
	        	GlobalService.consoleLog("iOS下载：" + JSON.stringify(info));
	            //iOS有点蛋疼，先要下载到本地
            	let subFolder = info.mimeType.indexOf('video') > -1 ? this.global.VideoSubPath : this.global.PhotoSubPath;
            	let folderPath = this.global.fileSavePath + subFolder + "/";
            	let fileName = info.fileName;
            	let contentType = info.mimeType;
            	this.writeFileToDiskIOS(info, this.global.fileSavePath, subFolder, fileName, (path)=>{
	            	console.log("文件已写入本地:" + path);
	            	resolve(path);            		
            	}, (res) => {
            		console.log("文件写入本地失败");
            		reject(res);
            	})
	            // return cordova.plugins.photoLibrary.getLibraryItemBinary(info, (blob) => {
	            // 	console.log("获取文件成功,准备写入blob");
	            // 	//写文件
	            // 	let subFolder = info.mimeType.indexOf('video') > -1 ? this.global.VideoSubPath : this.global.PhotoSubPath;
	            // 	let folderPath = this.global.fileSavePath + subFolder + "/";
	            // 	let fileName = info.fileName;
	            // 	let contentType = info.mimeType;
	            // 	this.writeImageFileByBlob(this.global.fileSavePath, subFolder, fileName, contentType, blob, () => {
	            // 		console.log("文件已写入本地");
	            // 		this.file.checkDir(this.global.fileSavePath, subFolder)
	            // 		.then(res => {
	            // 			resolve(folderPath + fileName);
	            // 		})
	            // 	}, (res) => {
	            // 		console.log("文件写入本地失败");
	            // 		reject(res);
	            // 	}) 
	            // }, (res) => {
	            // 	console.log("获取文件失败：" + JSON.stringify(res));
	            // 	reject(res);
	            // }, {

	            // })
	        }	    	
	    })

	}

	// getResources(type) {
	// 	return new Promise((resolve, reject) => {
	// 		let flag = this.platform.is('android') ? (type === 'image' ? this.photoLibraryReady : this.scanDiskReady) : this.photoLibraryReady;
	// 		if(flag) {
	// 			resolve(this.global.localPictureLibrary);
	// 		} else if(this.readPermitted) {
	// 			this.global.createGlobalLoading(this, {
	// 				content: "正在搜索中...."
	// 			})
	// 			this.photoLibraryMap["photoLibrary"] = ()=>{
	// 				this.global.closeGlobalLoading(this);
	// 				resolve(this.global.localPictureLibrary);
	// 			};
	// 		} else {
	// 			//没有权限
	// 			reject();
	// 		}			
	// 	})
	// }

	/**
	 * [classifiedPhotoLibrary 对图片/视频和相册进行关联]
	 * @param {[type]} type [类型，分别为image和video]
	 */
	classifiedPhotoLibrary(type) {
		let keyInGlobal = 'localPictureLibrary',
            keyInGlobalAlbum = 'photos',
            albumShow = 'photoShow',
            clasifiedFlag = 'albumPhotoClassified';
        if(type !== 'image') {
            keyInGlobal = 'localVideoLibrary',
            keyInGlobalAlbum = 'videos',
            albumShow = 'videoShow'; 
            clasifiedFlag = 'albumVideoClassified';           
        }
        GlobalService.consoleLog(`相册数${this.global.localAlbum.length}，图片数${this.global.localPictureLibrary.length}，视频数${this.global.localVideoLibrary.length}`);
        // if (this.global.localAlbums.length) {
        if(!this.global[clasifiedFlag]) {
        	let dataSource = this.global[keyInGlobal];
        	let albums = this.global.localAlbum;
        	albums.push({
                title: this.global.L('UnArchieved'),
                id: "photo-not-archieved",        		
        	})
        	//初始化相册数组
        	albums.map(item => {
        		item[keyInGlobalAlbum] = [];
        	})
        	let albumsCount = albums.length;
        	try {
	            //遍历，查找所有可以归档到相册的图片
	            for(let i = 0, len = dataSource.length; i < len; i++) {
	            	let flag = false;
	            	if(!dataSource[i].albumIds.length) {
	            		//未关联相册，直接放入归档文件夹
	            		albums[albumsCount - 1][keyInGlobalAlbum].push(dataSource[i]);
	            	} else {
	            		//从已有相册遍历
		            	for(let j = 0, leng = albumsCount; j < leng; j++) {
		            		if(dataSource[i].albumIds.indexOf(albums[j].id) > -1) {
		            			flag = true;
		            			//命中
		            			albums[j][keyInGlobalAlbum].push(dataSource[i]);
		            			break;
		            		}
		            	}
		            	if(!flag) {
		            		albums[albumsCount - 1][keyInGlobalAlbum].push(dataSource[i]);
		            	}            		
	            	}
	            }
        	} catch(e) {
        		GlobalService.consoleLog(e)
        		GlobalService.consoleLog(JSON.stringify(e))
        	}

            //计算相册是否应该显示
            albums.map(item => {
            	item[albumShow] = item[keyInGlobalAlbum].length > 0;
            })
            GlobalService.consoleLog("总相册数据：" + JSON.stringify(albums))
            //图片/视频是否已经经过分类
            this.global[clasifiedFlag] = true;       
        }
	}
 
	// 搜索本地文件
	searchLocalFiles(type) {
		GlobalService.consoleLog("开始搜索........." + type);
		let library = [];
		let config = this.resourceStorage[type];
		if(config.write) {
			//已经刷新过一次，此时直接返回
			return Promise.resolve({
				err_no: 0,
				err_msg: 'ok',
			});
		} else {
			//文件搜索
			return this.fetchAlbums(type)		
			.then(() => {
				GlobalService.consoleLog("获取相册成功.......");
				return new Promise((resolve, reject) => {
					GlobalService.consoleLog("开始获取数据........" + JSON.stringify(this.photoLibrary));
					this.photoLibrary.getLibrary({ 
						thumbnailWidth: GlobalService.THUMBNAIL_WIDTH, 
						thumbnailHeight: GlobalService.THUMBNAIL_HEIGHT, 
						includeAlbumData: true,
						itemsInChunk: 20,
						quality: 1,
						mediaType: type,
						includeVideos: type != 'image',
						includeImages: type === 'image'
						/*, chunkTimeSec: 0.3*/ 
					}).subscribe({
						next: (chunk) => {
							// GlobalService.consoleLog("收到chunk数据:" + chunk.length);
							// GlobalService.consoleLog("是否需要video:" + withVideo)
							// GlobalService.consoleLog("Chunk数据：" + JSON.stringify(chunk));
							this.photoLibraryReady = true;
							if(this.global.platformName === 'android') {
								// GlobalService.consoleLog("过滤大小为0的文件");
								library = library.filter(item => item.size > 0);
							}
							library = library.concat(chunk);
							if(config.read === false) {
								this.global[config.name] = library;
							}
						},
						error: (err) => {
							GlobalService.consoleLog("居然会出错:" + JSON.stringify(err))
							this.photoLibraryReady = true;
						},
						complete: () => {
							// GlobalService.consoleLog('completed....+++.....' + type + "*****" + JSON.stringify(library));
							//如果之前加载过缓存，此时需要更新缓存
							if(config.read === true) {
								this.global[config.name] = library;
							}
							//匹配相册
							this.matchAlbums(config, library);
							config.finished = true;
							//文档需计算文件名
							if(type === 'document') {
								this.computeFileNameByPath(config, library);
							} else if(type === 'image') {
								this.startBackUp();
							}

							//ios没有size

							//写入缓存
							// this.storage.set(config.name, JSON.stringify(this.global[config.name]))
							// .then(res => {
							// 	config.write = true;
							// })
							resolve({
								err_no: 0,
								err_msg: 'ok',
							})
						}
					});			
				})
			})
			.catch(e => {
				GlobalService.consoleLog("搜索图片异常：" + JSON.stringify(e))
				return Promise.reject({
					err_no: -1,
					err_msg: 'Search error...',
				});
			})				
		}
	}

	computeFileNameByPath(config, library) {
		library.forEach(item => {
			let path = item.id.split(';')[1];
			item.fileName = path.match(/([^\/]+)$/g)[0];
		})
	}

	matchAlbums(config, library) {
		if(config.album) {
			//需整理相册
			let albums = this.global[config.album];
			let unArchieveAlbum = {
                title: this.global.L("UnArchieved"),
                id: "photo-not-archieved",   
                content: []
        	};

        	for(let i = 0, len = library.length; i < len; i++) {
        		let flag = false, albumIds = library[i].albumIds;
        		for(let j = 0, leng = albums.length; j < leng; j++) {
        			if(albumIds.indexOf(albums[j].id) > -1) {
        				albums[j].content.push(library[i]);
        				flag = true;
        				break;
        			}
        		}
    			if(!flag) {
    				unArchieveAlbum.content.push(library[i]);
    			}
        	}
			albums.push(unArchieveAlbum);
            //计算相册是否应该显示
            albums.forEach(item => {
            	item.show = item.content.length > 0;
            })		

            // GlobalService.consoleLog("相册数据------" + JSON.stringify(albums));						
		}		
	}

	/**
	 * [getPermission 申请权限]
	 */
	getPermission() {
		return new Promise((resolve, reject) => {
			if(this.readPermitted === true) {
				GlobalService.consoleLog("权限已批准");
				resolve();
			} else {
				return this.photoLibrary.requestAuthorization({read: true})
				.then(res => {
					GlobalService.consoleLog("申请权限结果:" + JSON.stringify(res));
					this.readPermitted = true;
					//申请权限成功
					resolve();
				}, res => {
					GlobalService.consoleLog("申请权限失败");
					this.readPermitted = false;
					//申请权限失败
					reject('Permison denied.');
				})
			}
		})
	}

	/**
	 * [searchLocalMusicsAndDocs 搜索手机上的音乐，仅支持android]
	 * @param {Function} sync    [是否需要即时同步给页面]
	 */
	// searchLocalMusicsAndDocs(sync) {
	// 	let start = Date.now();
	// 	let root = this.global.fileRootPath;
	// 	GlobalService.consoleLog("开始扫描文件");
	// 	this.breadthFirstSearch(root, sync, (data)=>{
	// 		GlobalService.consoleLog("广度遍历总计耗时：" + (Date.now() - start));
	// 		this.scanDiskReady = true;
	// 		if(data.musicFileList.length || data.videoFileList.length || data.docFileList.length) {
	// 			this.storage.set("localScanLibrary", JSON.stringify({
	// 				data: {
	// 					musics: data.musicFileList,
	// 					videos: data.videoFileList,
	// 					docs: data.docFileList
	// 				},
	// 				time: Date.now()
	// 			}));					
	// 		}
	// 	})
	// }

	writeImageFileByBlob(folderPath, subFolder, fileName, contentType, blob, callback = null, errorCallback = null) {
      	console.log("Starting to write the file :" + folderPath + "***" + fileName);
      	folderPath = folderPath.replace(/\/$/, '') + '/';
      	let urlResolve = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
      	urlResolve(folderPath, (fileSystem) => {
      		fileSystem.getDirectory(subFolder, { create: true }, (dir) => {
	      		console.log("文件夹解析成功：" + subFolder);
	      		dir.getFile(fileName, {create: true}, (file) => {		     			
	              	file.createWriter((fileWriter) => {
	              		let folder = folderPath + subFolder + "/";
	                  	console.log("Writing content to folder:" + (folder + fileName));
	                  	fileWriter.write(blob);
	                  	this.file.checkFile(folder, fileName)
	                  	.then(res => {
	                  		console.log("新生成的文件已确认存在:" + JSON.stringify(res));
	                  		if(res) {
	                  			callback && callback(folder + fileName);
	                  		}
	                  	})
	                  	.catch(e => {
	                  		console.log("checkFile error:" + (e.stack || e.message));
	                  		console.log(JSON.stringify(e))
	                  	})
	              	}, () => {
	                  	console.log('Unable to save file in path '+ folderPath);
	                  	errorCallback && errorCallback();
	              	});
	      		}, (res) => {
	      			console.log("getFile失败了啊" + JSON.stringify(res));
	      			errorCallback && errorCallback();
	      		});
	      	})
      	}, (res) => {
      		GlobalService.consoleLog("获取文件夹失败, 先创建文件夹");
      		// urlResolve(folderPath, (fileSystem) => {
      		// 	GlobalService.consoleLog("解析文件夹成功");
      		// 	fileSystem.getDirectory(subFolder, { create: true }, (dir) => {
      		// 		GlobalService.consoleLog("创建文件夹成功");
      		// 		this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// 	}, (dir => {
      		// 		GlobalService.consoleLog("创建文件夹失败");
      		// 	}))
      		// })

      		// this.file.createDir(this.global.fileSavePath, subFolder, false)
      		// .then(res => {
      		// 	GlobalService.consoleLog("文件夹已创建成功:" + JSON.stringify(res));
      		// 	return this.file.checkDir(this.global.fileSavePath, subFolder);
      		// })
      		// .then(entry => {
      		// 	GlobalService.consoleLog("创建文件夹成功");
      		// 	this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// })
      		// .catch(e => {
      		// 	GlobalService.consoleLog("创建文件夹失败:" + JSON.stringify(e));
      		// 	this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// })
      	});		
	}

	/**
	 * [writeImageFileByBlob 将blob对象写入文件中]
	 * @param {[type]} folderPath    [文件夹路径]
	 * @param {[type]} fileName      [文件名]
	 * @param {[type]} contentType   [MIME类型]
	 * @param {[type]} blob          [文件的blob对象]
	 * @param {[type]} callback      =             null [成功回调]
	 * @param {[type]} errorCallback =             null [失败回调]
	 */
	writeFileToDiskIOS(info, folderPath, subFolder, fileName, callback = null, errorCallback = null) {      
      	console.log("Starting to write the file :" + folderPath + "***" + fileName);
      	folderPath = folderPath.replace(/\/$/, '') + '/';
      	let urlResolve = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
      	urlResolve(folderPath, (fileSystem) => {
      		fileSystem.getDirectory(subFolder, { create: true }, (dir) => {
	      		console.log("文件夹解析成功：" + subFolder);
	      		dir.getFile(fileName, {create: true}, (file) => {
			      	cordova.plugins.photoLibrary.getLibraryItemInPackage(
			        	info, // or libraryItem.id
			        	folderPath + subFolder + "/" + fileName,
				        (p)=>{
				        	console.log("请求并写入成功:" + p);
				        	callback && callback(p);
				        },      
				        (res)=>{
				          console.log("写入文件失败" + JSON.stringify(res))
				          errorCallback && errorCallback();
				        },
				        { // optional options
				          	thumbnailWidth: GlobalService.THUMBNAIL_WIDTH,
				          	thumbnailHeight: GlobalService.THUMBNAIL_HEIGHT,
				          	// quality: GlobalService.THNUBNAIL_QUALITY
				        }
				    ) 		     			
	              	// file.createWriter((fileWriter) => {
	              	// 	let folder = folderPath + subFolder + "/";
	               //    	console.log("Writing content to folder:" + (folder + fileName));
	               //    	fileWriter.write(blob);
	               //    	this.file.checkFile(folder, fileName)
	               //    	.then(res => {
	               //    		console.log("新生成的文件已确认存在:" + JSON.stringify(res));
	               //    		if(res) {
	               //    			callback && callback(folder + fileName);
	               //    		}
	               //    	})
	               //    	.catch(e => {
	               //    		console.log("checkFile error:" + (e.stack || e.message));
	               //    		console.log(JSON.stringify(e))
	               //    	})
	              	// }, () => {
	               //    	console.log('Unable to save file in path '+ folderPath);
	               //    	errorCallback && errorCallback();
	              	// });
	      		}, (res) => {
	      			console.log("getFile失败了啊" + JSON.stringify(res));
	      			errorCallback && errorCallback();
	      		});
	      	})
      	}, (res) => {
      		GlobalService.consoleLog("获取文件夹失败, 先创建文件夹");
      		// urlResolve(folderPath, (fileSystem) => {
      		// 	GlobalService.consoleLog("解析文件夹成功");
      		// 	fileSystem.getDirectory(subFolder, { create: true }, (dir) => {
      		// 		GlobalService.consoleLog("创建文件夹成功");
      		// 		this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// 	}, (dir => {
      		// 		GlobalService.consoleLog("创建文件夹失败");
      		// 	}))
      		// })

      		// this.file.createDir(this.global.fileSavePath, subFolder, false)
      		// .then(res => {
      		// 	GlobalService.consoleLog("文件夹已创建成功:" + JSON.stringify(res));
      		// 	return this.file.checkDir(this.global.fileSavePath, subFolder);
      		// })
      		// .then(entry => {
      		// 	GlobalService.consoleLog("创建文件夹成功");
      		// 	this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// })
      		// .catch(e => {
      		// 	GlobalService.consoleLog("创建文件夹失败:" + JSON.stringify(e));
      		// 	this.writeImageFileByBlob(folderPath, fileName, contentType, blob, callback, errorCallback);
      		// })
      	});
  	}	

  	/**
  	 * [uploadThumbnail 上传缩略图]
  	 * @param {[type]} filePath   [文件路径，不含文件名]
  	 * @param {[type]} fileName   [文件名]
  	 * @param {[type]} remotePath [远程路径，不含文件名]
  	 */
    // uploadThumbnail(filePath, fileName, remotePath) {      
    //      GlobalService.consoleLog("上传缩略图：" + filePath + "," + fileName);
    //      return this.file.readAsArrayBuffer(filePath, fileName)
    //         .then(buf => {
    //             GlobalService.consoleLog("------缩略图文件长度: " + buf.byteLength + "-----")
    //             let length = buf.byteLength;
    //     		let uploadUrl = this.global.getBoxApi('uploadFileBreaking');
    //             return this.http.uploadFile(uploadUrl, {
    //                     range: `0-${length-1}-${length}`,
    //                     path: remotePath,
    //                     name: fileName,
	// 					disk_uuid: this.global.currDiskUuid
    //             }, filePath, fileName, buf)
    //         }, res => {
    //             throw new Error("Failed to read file");
    //         })
    //         .then((res:any) => {
    //         	GlobalService.consoleLog("上传缩略图结果：" + JSON.stringify(res));
    //     		try {
    //                 if(res.data && (typeof res.data === 'string')) {
    //                     res.data = JSON.parse(res.data);
    //                 }                    
    //             } catch(e) {
    //                 GlobalService.consoleLog(e.stack || e.message);
    //             }  
    //             GlobalService.consoleLog("状态检测：" + res.status + "," + res.data.err_no)	
    //             if(res.status === 200) {
	//             	if(res.data.err_no != 0) {
	// 	            	if(res.data.err_no === 1401) {
	// 	            		//目录不存在，创建目录
	// 	            		GlobalService.consoleLog("开始创建远程目录...");
	// 	            		var url = this.global.getBoxApi("createFolder");
	//                         this.http.post(url, {
	//                             fullpath: this.global.ThumbnailRemotePath,
	// 							disk_uuid: this.global.currDiskUuid
	//                         })
	//                         .then(res => {
	//                         	if(res.err_no === 0) {
	//                         		//创建文件夹成功
	//                         		return this.uploadThumbnail(filePath, fileName, remotePath);
	//                         	}
	//                         })
	// 	            	} else {
	// 	            		throw new Error("不识别的上传状态码:" + res.data.err_no);
	// 	            	}            		
	// 	            } else {
	// 	            	GlobalService.consoleLog("缩略图上传成功");
	// 	            	return Promise.resolve('ok');
	// 	            }                	
    //             } else {
    //             	return Promise.reject('error');
    //             }
    //         })
    //         //捕获异常
    //         .catch((error) => {
    //             let errstr = JSON.stringify(error);
    //             GlobalService.consoleLog("缩略图上传出错：" + errstr);
    //             return Promise.reject(errstr);
    //         });        
    // }

    /**
     * [browserLocal 浏览本地文件夹]
     * @param {[type]} file [传入目录的entry,或者目录名]
     */
	browserLocal(file) {
		if(typeof file === 'string') {
		    GlobalService.consoleLog("传入路径，直接浏览" + file);
		  	//字符串
		  	return this.file.listDir(file, '.')
		  	.then(entries => {
		  	  	return {
		  	  		err_no: 0,
		  	  		type: "listFolder",
		  	  		data: entries
		  	  	}
		  	})
		} else {
		  	if(file.isFile) {
		      	GlobalService.consoleLog("直接打开文件即可");
		      	var mime = this.util.computeFileMIMEType(file.name);
			   	if(mime) {
		     //        return this.util.openFile(file.nativeURL)
		     //        .then(res => {
		     //        	return {
							// type: "fileOpener",
							// err_no: 0,
			    //         	data: res
		     //        	}
		     //        })
		        } else {
		        	GlobalService.consoleLog("无法打开文件");
		        	return {
						type: "fileOpener",	
						err_no: -1		        		
		        	}
		        }
		    } else if(file.isDirectory) {
		        GlobalService.consoleLog("文件夹诶")
		      	return this.browserLocal(file.nativeURL);
		    }
		}
	}

    /**
     * [saveThumbnail 通过文件ID，获取缩略图数据，并存储到本地]
     * @param {[type]} id            [图片ID]
     * @param {[type]} fileName      [文件名]
     * @param {[type]} callback      =             null [成功回调]
     * @param {[type]} errorCallback =             null [失败回调]
     */
	saveThumbnail(info, fileName, callback = null, errorCallback = null) {
		// let path = this.global.fileSavePath + 'thumbnail/' + fileName;
		// console.log("缩略图本地路径：" + path);
		// this.writeFileToDisk(info, this.global.fileSavePath, 'thumbnail', fileName, callback, errorCallback);
	    cordova.plugins.photoLibrary.getThumbnailBinary(info, (blob) => {
        	console.log("获取文件成功,准备写入blob");
        	//写文件
        	let subFolder = this.global.ThumbnailSubPath;
        	let folderPath = this.global.fileSavePath + subFolder + "/";
        	let contentType = info.mimeType;
        	this.writeImageFileByBlob(this.global.fileSavePath, subFolder, fileName, contentType, blob, () => {
        		console.log("文件已写入本地----------");
        		this.file.listDir(folderPath, fileName)
        		.then(res => {
        			console.log("gggggggssss" + JSON.stringify(res))
        		})
        		callback && callback(folderPath + fileName);
        	}, (res) => {
        		console.log("文件写入本地失败");
        		errorCallback && errorCallback(res);
        	}) 
        }, (res) => {
        	console.log("获取文件失败：" + JSON.stringify(res));
        	errorCallback && errorCallback(res);
        }, {
          	thumbnailWidth: GlobalService.THUMBNAIL_WIDTH,
          	thumbnailHeight: GlobalService.THUMBNAIL_HEIGHT,
          	// quality: GlobalService.THNUBNAIL_QUALITY	
        })	    	
	}

	/**
	 * [fetchAlbums 获取手机上的所有相册]
	 * @param {[type]} type [文件类型]
	 */
	fetchAlbums(type) {
		if(!this.platform.is('cordova')) {
			return Promise.reject([]);
		}
		// GlobalService.consoleLog("开始获取相册...")
		let config = this.resourceStorage[type];
		if(config.album) {
			if(this.global[config.album] && this.global[config.album].length) {
				return Promise.resolve(this.global[config.album]);
			} else {
				return new Promise((resolve, reject) => {
					cordova.plugins.photoLibrary.getAlbums(albums => {
						GlobalService.consoleLog("相册获取完毕........." + JSON.stringify(albums));
						this.global[config.album] = albums;
						albums.forEach(function(album:any) {
							album.content = album.content || [];
						});
						// GlobalService.consoleLog("开始获取图片数据...");
						resolve(albums);        
					}, e => {
						GlobalService.consoleLog(e.stack);
						reject([]);
					}, {
						mediaType: type
					})		
				});				
			}
		} else {
			GlobalService.consoleLog("相册获取.........")
			return Promise.resolve([]);
		}
	}

	//计算需上传的数据 
	computeFileListDiff(manifest, albums) {
		let filesToBeBackup = {};
		let key = this.global.platformName === 'android' ? 'modificationTime' : 'creationDate';
		for(let i = 0, len = albums.length; i < len; i++) {
			let albumId = albums[i].id;
			let backedAlbum = manifest[albumId] || [];
			if(backedAlbum && backedAlbum.length) {
				console.log("相册已经备份过：" + backedAlbum.length)
				//已部分备份过
				let album = [];
				albums[i].content.forEach(item => {
					let fileId = item.id;
					let backedItem = backedAlbum.filter(back => back.id === fileId);
					if(backedItem.length && backedItem[0][key] == item[key]) {
						//已上传并且最后修改时间没有变化，不需要上传
						return ;
					} else {
						album.push({
							id: item.id,
							fileName: item.fileName,
							mimeType: item.mimeType
						});
					}
				})
				if(album.length) {
					filesToBeBackup[albumId] = album;
				}
			} else {
				//该相册并未备份过，全部拷贝
				let album = [];
				albums[i].content.forEach(item => {
					album.push({
						id: item.id,
						fileName: item.fileName,
						mimeType: item.mimeType
					})
				});
				filesToBeBackup[albumId] = album;
			}
		}
		return filesToBeBackup;
	}

	//上传备份文件
	uploadBackedFiles(manifest, filesToBeBackup, backupId) {
		if(backupId != this.backupId) {
			GlobalService.consoleLog("已作废的backupId:" + backupId);
			return false;
		}

		//如果已关闭备份，则不处理
		if(this.autoBackupSwitch === false) {
			GlobalService.consoleLog("停止备份");
			return false;
		}

		let uri = this.global.getBoxApi('uploadCopyAlbums');
		let deviceId = this.global.deviceID;

		let getNextFile = (albumId) => {
			if(albumId && filesToBeBackup[albumId].length === 0) {
				//相册下所有文件已上传
				albumId = '';
				delete filesToBeBackup[albumId];
			}
			if(!albumId) {
				for(let id in filesToBeBackup) {
					if(!filesToBeBackup[id] || !filesToBeBackup[id].length) {
						GlobalService.consoleLog("空相册：" + id);
						delete filesToBeBackup[id];
						this.storage.set('backupManifest', JSON.stringify(manifest));
						continue;
					}
					albumId = id; 
					break;
				}
			} 
			if(albumId) {
				let file = filesToBeBackup[albumId].pop();
				return {
					albumId: albumId,
					file: file
				};
			} else {
				return null;
			}
		}

		let ret = getNextFile('');

		if(!ret) {
			console.log("自动备份已完成");
			//manifest写缓存
			this.storage.set('backupManifest', JSON.stringify(manifest));
			return false;
		}

		let albumId = ret.albumId,
			file = ret.file;

		console.log("即将上传文件：" + JSON.stringify(file));
		console.log("相册id:" + albumId);
		console.log("manifest内容：" + JSON.stringify(manifest));
		let key = this.global.platformName === 'android' ? 'lastModificationTime' : 'creationDate';
		this.getNativeUrl(file)
		.then(localPath => {
			GlobalService.consoleLog("源文件：" + localPath + "," + file.fileName + "," + albumId + "," + deviceId);
			return this.http.backupFile(localPath, file.fileName, albumId, deviceId)
		})		
		.then((res:any) => {
			GlobalService.consoleLog("上传完成：" + JSON.stringify(res));
			if(res.err_no === 0) {
				manifest[albumId] = manifest[albumId] || [];
				//写入manifest
				let fileInManifest = manifest[albumId].find(item => item.id === file.id);
				if(fileInManifest) {
					console.log("Manifest更新文件时间戳:" + file[key]);
					fileInManifest[key] = file[key];
				} else {
					console.log("Manifest增加文件");
					manifest[albumId].push(file);
				}
			}
			setTimeout(() => {
				this.uploadBackedFiles(manifest, filesToBeBackup, backupId);
			}, 2000);
		})
		.catch(e => {
			console.log("备份文件异常：" + e.stack || JSON.stringify(e));
			this.storage.set('backupManifest', JSON.stringify(manifest));
		})
		return true;
	}

	switchBackup(b) {
		//停止备份
		GlobalService.consoleLog("停止备份");
		this.autoBackupSwitch = b;
	}

	getBackupInfo() {
        let url = this.global.getBoxApi('getCopyAlbums');
        if(this.global.albumBackupSwitch === undefined) {
	        return this.util.getDeviceID()
	        .then(res => {
		        return this.http.post(url, {
		            equip_id: this.global.deviceID
		        }, false)        	
	        })
	        .then(res => {
	            if(res.err_no == 0){
	                if(res.backup == 1) {
	                	this.global.albumBackupSwitch = true;
	                	this.global.autoBackupAlbums = res.dic_list;
	                    //需要备份,计算所有需要备份的文件
	                    return this.global.autoBackupAlbums;
	                } else {
	                	this.global.albumBackupSwitch = false;
	                    throw new Error('无需备份');
	                }
	            } else {
	                throw new Error('获取备份相册失败');
	            }         	
	        })        	
        } else {
        	return Promise.resolve(this.global.autoBackupAlbums);
        }
	}

    getBackupConfig() {
        GlobalService.consoleLog("准备获取备份相册")
        return this.getBackupInfo()
        .then(res => {
        	this.global.localAlbum.forEach(item => {
        		if(!item.content || !item.content.length) {
        			return false;
        		}
                if(this.global.autoBackupAlbums.indexOf(item.id) > -1) {
                    item.backupSwitch = true;
                } else {
                    item.backupSwitch = false;
                }
            })
            return this.global.localAlbum;
        })
        .catch(e => {
            GlobalService.consoleLog(e.stack);
            return [];
        })
    }

    startBackUp() {
    	if(!this.global.deviceSelected) {
    		GlobalService.consoleLog("未选择任何设备");
    		return false;
    	}

    	this.getBackupConfig()
    	.then((res:any) => {
			this.backupId = Date.now();
    		if(res && !this.global.useWebrtc) {
	    		let albums = this.global.localAlbum.filter(item => {
	    			return res.indexOf(item.id) > -1;
	    		})
	    		let manifest = {};
	    		this.storage.get('backupManifest')
	    		.then(res => {
	    			if(res) {
	    				try {
	    					manifest = JSON.parse(res);
	    				} catch(e) {
	    					console.log(JSON.stringify(e));
	    				}
	    			}
	    			let filesToBeUpdated = this.computeFileListDiff(manifest, this.global.localAlbum.filter(item => item.backupSwitch == 1));
	    			for(let i in filesToBeUpdated) {
	    				console.log("备份相册：" + i + "," + filesToBeUpdated[i].length);
	    				console.log("备份文件：" + JSON.stringify(filesToBeUpdated[i]))
	    			}
	    			this.uploadBackedFiles(manifest, filesToBeUpdated, this.backupId);
	    		})    			
    		}
    	})
    	.catch(e => {
    		GlobalService.consoleLog(e.stack);
    	})
    	return true;
    }
}
