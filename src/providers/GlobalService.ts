import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { Lang } from './Language';
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

declare var cordova: any;

@Injectable()
export class GlobalService {
    public static CoinDecimal = 1e9;
    public static CoinDecimalBlockchain = 1e18;
    public static MaxEarnPerDay = 600;
    public static ChainMaxEarnPerDay = 8000;
    public static ToastTime = 1000; //toast弹窗时间控制
    public static webrtcFileControl = 2;
    public static boxFileControl = 3;
    public static AppVersion = '2.0.0';
    public static applang: any = "en";
    public static ENV = "dev"; //环境设定
    public static UBBEY_CONTRACT: string = "0x6cB1C2B61e24aD08bF5FFF4d2b13ea987d211a88";
    public static UBBEY_CONTRACT_TEST: string = "0x76040366331dc8e4A11CfC5f0Cd4d1aD23A1eAcd";
    public static DISK_K_BITS:number = 1024;
    public static DISK_M_BITS:number = GlobalService.DISK_K_BITS * GlobalService.DISK_K_BITS;
    public static DISK_G_BITS:number = GlobalService.DISK_M_BITS * GlobalService.DISK_K_BITS;
    public static DISK_T_BITS:number = GlobalService.DISK_G_BITS * GlobalService.DISK_K_BITS;

    static THUMBNAIL_WIDTH = 512; //缩略图宽
    static THUMBNAIL_HEIGHT = 512; //缩略图高
    static THNUBNAIL_QUALITY = 1; //缩略质量

    static LoadingDisplayPeriod = 6000; //Loading持续最长时间

    public static DefaultMiningStorage = 10 * GlobalService.DISK_G_BITS;
    public static DefaultChainMiningStorage = 10 * GlobalService.DISK_G_BITS;

    public shareFileProduced: any = 0;

    public coinUnit: any = "USD";
    public chainSelectIndex = 0; //当前选择的链索引
    public chainSelectArray: any = ["ERC20", "TESTNET"]; //ERC20, TESTNET, MAINNET
    public chainTypeList: any = []; //缓存type列表

    public fileTaskList = []; //文件下载/上传队列
    public fileMaxChoose = 20;//文件最大上传数量
    public fileMaxUpload = 3;//文件同时上传最大数量
    public fileMaxDownload = 3;//文件同时上传最大数量

    public networkType: String = '';
    public networking: Boolean = true; //是否联网
    public wifiName: String = ""; //wifi名字

    public fileHandler: any = {};

    public boxUserInfo: any = {}; //盒子端个人信息
    public centerUserInfo: any = {}; //中心端个人信息

    public foundDeviceList: any = []; //发现到的设备列表
    public userBoxIndex: any = -1; //用户填写的用户名对应的盒子编号
    public deviceSelected: any = null; //用户选择的设备
    public diskInfo: any = {}; //磁盘信息
    public globalRateInfo: any = []; //货币换算比例

    public alertCtrl: any = null; //全局弹窗控制
    public loadingCtrl: any = null; //全局弹窗控制

    public passwdType: String = "register"; //业务类型
    private storageFilename = "logs.txt";
    public ThumbnailRemotePath = "/thumbnail.uploading"; //远程目录，缩略图全部写到该目录
    public ThumbnailSubPath = "thumbnail";
    public PhotoSubPath = "photo";
    public VideoSubPath = "video";
    public MusicSubPath = "music";
    public DocSubPath = "doc";

    public fileSavePath: string = "";
    public fileThumbnailPath = '';
    public fileRootPath: string = "";

    public useWebrtc:any = true; //是否使用webrtc
    public boxInfo: any = {}; //当前连接的盒子信息
    // public centerBoxList:any = []; //盒子列表
    // public centerAvailableBoxList: any = []; //当前可连接的盒子ID
    // public centerBoxSelected: any = {}; //远程登录所选择的盒子
    public boxStatus:Boolean = true;//磁盘连接状态
    public diskInfoStatus:Boolean = true;//磁盘连接状态
    public speedMax:any = 0.7;
    public noticeBrowseList = []; //营销消息浏览
    public nowNoticeList = []; //当前请求营销消息
    public allNoticeList = []; //消息列表请求消息
    public selectedUploadFolderName ='';


    public walletList = []; //钱包缓存列表
    public nowUserWallet = {}; //当前用户钱包
    public firstLoadVersion = 0; //第一次拉取版本数据
    // public firstLoadSearchData = 0; //第一次拉取发现页数据
    public userLoginList = {
        'remote': {},
        'boxid': {}
    }; //用户登录数据
    public userLoginInfo: any = null; //用户登录数据

    public albumVideoClassified = false; //相册数据数据分类是否已经完成
    public albumPhotoClassified = false; //相册图片数据分类是否已经完成

    public localAlbum = []; //本地图片相册
    public localPictureLibrary = []; //本地图片库
    public localVideoLibrary = []; //本地图片库
    public localMusicLibrary = [];
    public localDocLibrary = [];
    public eventType = '';
    public currPath = '';
    public currDiskUuid = '';
    public currSelectDiskUuid = '';
    public selectFolderType = 'upload';
    // public selectDataType = 'music';
    public albumBackupSwitch = undefined; //是否自动备份
    public deviceID = ''; //设备id
    public autoBackupAlbums = []; //自动备份的相册
    // public copyedAlbumsList = {}; //已备份相册
    private loadingTimer = null; //加载loading的关闭计时器
	public thumbnailMap = {}; //文件远程路径到缩略图的映射
	public photoMap = {};
    public platformName = 'android'; //平台名
	public readPermitted = false; //读取权限
	public focusWallet = null; //用户当前使用的默认钱包

    public static getUbbeyContract() {
        if(GlobalService.ENV === 'dev') {
            return GlobalService.UBBEY_CONTRACT_TEST;
        } else {
            return GlobalService.UBBEY_CONTRACT;
        }
	}
    public SearchData = null;

    public static VersionControl = {
        "1.1.0": {
            "versionList": [
                {
                    "version": "-1.1.1",
                    "action": "this.events.publish('update-box')"
                }
            ]
        }
    };

    public static BoxVersionDescription = {
        "1.0.1": [
            {
                "cn": ["1. 新增支持文件远程访问、操作功能","2. 新增支持文件断点续传功能","3. 优化提升UBBEY BOX挖矿性能"],
                "en": ["1. Support remote file access and operation functions","2. Support file transmission breakpoint resume functions","3. Ubbey Box mining function improvement and updates"],
                "kr": ["1. 지원 파일 원격 액세스 및 작업 기능을 추가합니다","2. 지원 파일 중단점 연속 기능을 추가합니다","3. 우베이 박스(UBBEY BOX) 마이닝의 성능을 최적화하고 개선합니다"]
            }
        ],
        "1.1.1": [
            {
                "cn": ["1. 修复已知BUG","2. 新增文件远程访问、操作功能","3. 优化文件上传下载性能","4. 优化部分UI及使用体验"],
                "en": ["1. Bugs fixing","2. Adding file remote access and operation functions","3. Optimize file upload and download performance","4. Optimize UI and user experience"],
                "kr": ["1. 알려진 버그를 수정합니다","2. 새로운 파일 원격 액세스 및 작업 기능","3. 파일 업로드 및 다운로드 성능 최적화","4. UI 및 사용자 환경의 일부를 최적화합니다"]
            }
        ]
    };
    public NewVersionHead = {
        'cn': ['FOUND','NEW VERSION'],
        'en': ['FOUND','NEW VERSION'],
    'kr': ['FOUND','NEW VERSION'],
    }

    public static AppVersionDescription = {
        "version": "1.2.1",
        "content":
            {
                "cn": ["1. 修复已知BUG","2. 新增文件远程访问、操作功能","3. 优化文件上传下载性能","4. 优化部分UI及使用体验"],
                "en": ["1. Bugs fixing","2. Adding file remote access and operation functions","3. Optimize file upload and download performance","4. Optimize UI and user experience"],
                "kr": ["1. 알려진 버그를 수정합니다","2. 새로운 파일 원격 액세스 및 작업 기능","3. 파일 업로드 및 다운로드 성능 최적화","4. UI 및 사용자 환경의 일부를 최적화합니다"]
            },
        "downloadUrl":"https://m.yqtc.co/download/ubbey.v1.2.2.apk"
    };

    //热更新路径
    public static hotPath = {
        'dev': "https://www.yqtc.co/iamtest/ubbey",
        "prod": "https://m.yqtc.co/ubbey"
    }

    //浏览器路径
    public static ubbeyscanPath = {
        'dev': "https://www.yqtc.co/iamtest/ubbeyscan/#/txhash/",
        "prod": "https://uchain.yqtc.com/#/txhash/"
    }

    public static centerApiDomain = {
        'dev': 'www.yqtc.co',
        'prod': 'api.yqtc.co'
    }

    //中心服务器API的host
    public static centerApiHost = {
        'dev': "https://" + GlobalService.centerApiDomain.dev + "/iamtest",
        'prod': "https://" + GlobalService.centerApiDomain.prod
    }

    //版本控制文件
    public static versionConfig = {
        'dev': "https://www.yqtc.co/iamtest/ubox/versionControl.json",
        'prod': "https://www.yqtc.co/iamtest/ubox/versionControl.json",
        // 'prod': "https://m.yqtc.co/ubbey/versionControl.json"
    }

    //发现页数据文件
    public static searchDataConfig = {
        'dev': "https://www.yqtc.co/iamtest/ubox/searchData.json",
        'prod': "https://m.yqtc.co/ubbey/searchData.json"
    }

    //安装包下载地址
    public static DownloadPath = {
      'android': "https://www.yqtc.co/iamtest/ubox/ubbey-v1.2.2-test.apk",
      'ios': "https://itunes.apple.com/cn/app/id1400599400?mt=8",
      'browser': "https://m.yqtc.co/download/ubbeybox/index.html"
    }

    public logger(...messages) {
        var now = new Date();
        var timestamp = now.toJSON();
        var message = [timestamp];

        for (var i = 0; i < messages.length; i++) {
            if (typeof messages[i] === 'string') {
                message.push(messages[i]);
            } else {
                message.push(JSON.stringify(messages[i]));
            }
        }

        var logMsg = message.join('-');

        if (this.platform.is('cordova')) {
            this.file.checkFile(this.fileSavePath, this.storageFilename)
            .then(() => {
                return this.file.writeExistingFile(this.fileSavePath, this.storageFilename, logMsg)
            }, () => {
                return this.file.writeFile(this.fileSavePath, this.storageFilename, logMsg)
            })
            .then(res => {
            })
        }
    }

    public getChainType() {
        return this.chainSelectArray[this.chainSelectIndex];
    }

    //盒子API
    public static boxApi = {
        "login": {
            url: '/ubeybox/user/login',
        },
        "getUserInfo": {
            url: '/ubeybox/user/get_userinfo',
        },
        "bindBox": {
            url: "/ubeybox/user/bind_box",
        },
        "resetPasswd": {
            url: "/ubeybox/user/reset_password",
        },
        "uploadFile": {
            url: "/ubeybox/file/upload",
        },
        "uploadFileBreaking": {
            url: "/ubeybox/file/upload_breaking",
        },
        "downloadFile": {
            url: "/ubeybox/file/download",
        },
        "createFolder": {
            url: "/ubeybox/file/mkdir",
        },
        "removeFile": {
            url: "/ubeybox/file/remove",
        },
        "moveFile": {
            url: "/ubeybox/file/move",
        },
        "listFolder": {
            url: "/ubeybox/file/list",
        },
        "listClassFolder": {
            url: "/ubeybox/classify/list",
        },
        "getDiskStatus": {
            url: "/ubeybox/device/get_status",
        },
        "setMineInfo": {
            url: "/ubeybox/user/set_mine",
        },
        "logout": {
            url: "/ubeybox/user/logout",
        },
        "getWalletList": {
            url: "/ubeybox/user/get_walletlist",
        },
        "createWallet": {
            url: "/ubeybox/user/create_wallet",
        },
        "setCoinbase": {
            url: "/ubeybox/user/set_coinbase",
        },
        "deleteWallet": {
            url: "/ubeybox/user/delete_wallet",
        },
        "modifyWallet": {
            url: "/ubeybox/user/mod_wallet",
        },
        "changePassword": {
            url: "/ubeybox/user/mod_password",
        },
        "unbindBox": {
            url: "/ubeybox/user/unbind_box",
        },
        "formatBox": {
            url: "/ubeybox/device/format",
        },
        "checkFormatStatus": {
            url: "/ubeybox/device/check",
        },
        "renameDisk": {
            url: "/ubeybox/device/rename_disk",
        },
        "renameHost": {
            url: "/ubeybox/device/rename_host",
        },
        "switchSamba": {
            url: "/ubeybox/device/samba_switch",
        },
        "switchFtp": {
            url: "/ubeybox/device/ftp_switch",
        },
        "checkRomUpdate": {
            url: "/updatebox/update",
        },
        "updateRom": {
            url: "/updatebox/updatedst",
        },
        "checkRomUpdateStatus": {
            url: "/updatebox/check",
        },
        "keepAlive": {
            url: "/ubeybox/update/get_version"
        },
        "changePayPassword": {
            url: "/ubeybox/user/mod_keystore"
        },
        "getChainProfile": {
            url: "/ubeybox/mine/get_profile"
        },
        "setChainMining": {
            url: "/ubeybox/mine/set_mine"
        },
        "setChainCoinbase": {
            url: "/ubeybox/mine/set_coinbase"
        },
        "setChainStorage": {
            url: "/ubeybox/mine/set_sharesize"
        },
        "stopShare": {
            url: "/ubeybox/mine/stop_share"
        },
        "getMineProgress": {
            url: "/ubeybox/mine/get_mineprogress"
        },
        "clearShareFile": {
            url: "/ubeybox/mine/clear_sharefile"
        },
        "getChainOnlineTime": {
            url: "/ubeybox/mine/get_minetime"
        },
        "setCopyAlbums": {
            url: "/ubeybox/backup/set_param"
        },
        "getCopyAlbums": {
            url: "/ubeybox/backup/get_param"
        },
        "uploadCopyAlbums": {
            url: "/ubeybox/backup/upload"
        },
        "rebootDevice": {
            url: "/ubeybox/device/reboot"
        },
        "reportLog": {
            url: "/collector/bug/report"
        },
        "checkUpdate130": {
            url: "/updatebox/check_update"
        },
        "downloadPackage130": {
            url: "/updatebox/download"
        },
        "downloadPackageProgress130": {
            url: "/updatebox/get_progress"
        },
        "installPackage130": {
            url: "/updatebox/install"
        },
        "downloadUapp": {
            url: "/ubeybox/uapp/download"
        },
        "checkUappProgress": {
            url: "/ubeybox/uapp/get_progress"
        },
        "installUapp": {
            url: "/ubeybox/uapp/install"
        },
        "uninstallUapp": {
            url: "/ubeybox/uapp/uninstall"
        },
        "btDownlaod": {
            url: "/ubeybox/bt/task/start_magnet"
        },
        "getBtTaskList": {
            url: "/ubeybox/bt/task/list"
        },
        "changeBtTaskStatus": {
            url: "/ubeybox/bt/task/change_status"
        },
        "deleteBtTask": {
            url: "/ubeybox/bt/task/delete"
        },
        "getBtTaskConfig": {
            url: "/ubeybox/bt/conf/get"
        },
        "changeBtTaskConfig": {
            url: "/ubeybox/bt/conf/modify"
        }
    };

    private static centerApiHostEnv = GlobalService.centerApiHost[GlobalService.ENV];
    //中心API
    public static centerApi = {
        "login": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/login',
        },
        "register": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/register',
        },
        "getUserInfo": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_userinfo',
        },
        "getVerifyCode": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/send_mail',
        },
        "bindBox": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/bind_box',
        },
        "bindBoxConfirm": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/bind_box_confirm',
        },
        "resetPasswd": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/forget_userpwd',
        },
        "resetPasswdConfirm": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/forget_userpwd_confirm',
        },
        "getMiningInfo": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/forget_userpwd_confirm',
        },
        "getBoxList": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_box_list',
        },
        "getAvenueList": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_day_earn',
        },
        "logout": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/logout',
        },
        "getWalletBalance": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_wallet_balance',
        },
        "changePassword": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/change_userpwd',
        },
        "changePasswordConfirm": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/change_userpwd_confirm',
        },
        "unbindBox": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/unbind_box',
        },
        "unbindBoxConfirm": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/unbind_box_confirm',
        },
        "getBoxSdpById": {
            url: GlobalService.centerApiHostEnv + '/ubbey/sdp/app_get_box_sdp',
        },
        "checkBoxSdp": {
            url: GlobalService.centerApiHostEnv + '/ubbey/sdp/app_check_box_sdp',
        },
        "submitLocalSdp": {
            url: GlobalService.centerApiHostEnv + '/ubbey/sdp/app_register_sdp',
        },
        "getWalletTotalMining": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_addr_mining_ubbey',
        },
        "transferUbbey": {
            url:  GlobalService.centerApiHostEnv + '/ubbey/user/transfer',
        },
        "getTransferList": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_addr_trans_list',
        },
        "getUbbeyRate": {
            url: GlobalService.centerApiHostEnv + '/ubbey/user/get_ubbey_rate'
        },
        "noticeList": {
            url: GlobalService.centerApiHostEnv + "/ubbey/information/pull_msg"
        },
        "noticeDetail": {
            url: GlobalService.centerApiHostEnv + "/ubbey/information/get_detail"
        },
        "noticeMarketList": {
            url: GlobalService.centerApiHostEnv + "/ubbey/information/pull_market_msg"
        },
        "getChainAvenueList": {
            url: GlobalService.centerApiHostEnv + "/uchainscan/mining/get_addr_mining_rewards"
        },
        "getChainMiningList": {
            url: GlobalService.centerApiHostEnv + "/uchainscan/mining/get_mined_block_by_addr"
        },
        "getChainMiningListByDate": {
            url: GlobalService.centerApiHostEnv + "/uchainscan/mining/get_mined_block_by_addr_and_date"
        },
        "getTransactionByAddress": {
            url: GlobalService.centerApiHostEnv + "/uchainscan/transaction/get_by_addr"
        },
        "commitTransactionPending": {
            url:  GlobalService.centerApiHostEnv + "/uchainscan//transaction/commit_pending"
        },
        "getTransactionPendingList": {
            url:  GlobalService.centerApiHostEnv + "/uchainscan//transaction/get_addr_pending"
        },
        "addKeystore": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/user/keystore/add"
        },
        "delKeystore": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/user/keystore/del"
        },
        "changeKeystore": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/user/keystore/change"
        },
        "getKeystore": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/user/keystore/get"
        },
        "modifyKeystore": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/user/keystore/change_name"
        },
        "uploadLogAnalyser": {
            url:  GlobalService.centerApiHostEnv + "/loganalyser/user/upload_log_file"
        },
        "getFeedList": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/btfeed/feedlist"
        },
        "getFeedTop": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/btfeed/feedtop"
        },
        "getSearchList": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/btfeed/searchlist"
        },
        "getFeedDetail": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/btfeed/feeddetail"
        },
        "getSearchDetail": {
            url:  GlobalService.centerApiHostEnv + "/ubbey/btfeed/searchdetail"
        },

    }

    constructor(
        public alertCreator: AlertController,
        public toastCtrl: ToastController,
        public loadingCreator: LoadingController,
        private file: File,
        private platform: Platform,
        private storage: Storage,
        public events: Events
    ) {

    }

    getBoxApi(name) {
        if (this.deviceSelected && this.deviceSelected.URLBase && !this.useWebrtc) {
            return "http://" + this.deviceSelected.URLBase + GlobalService.boxApi[name].url;
        } else {
            return GlobalService.boxApi[name].url;
        }
        // return GlobalService.boxApi[name].url;
    }

    createGlobalToast(obj, opt) {
        let toast = obj.global.toastCtrl.create({
            message: opt.message || opt,
            duration: GlobalService.ToastTime,
            position: opt.position || 'middle',
            cssClass: 'toast-error',
        });
        toast.present();
    }

    getAppLang() {
        return GlobalService.applang;
    }

    L(strid) {
        return Lang.L(strid)
    }

    Lf(strid, ...args) {
        return Lang.Lf(strid, ...args)
    }

    createGlobalLoading(obj, opt) {
        this.loadingCtrl = obj.global.loadingCreator.create({
            content: opt.message
        });
        this.loadingCtrl.present();
        // this.loadingTimer = setTimeout(() => {
        //     this.closeGlobalLoading(obj);
        // }, GlobalService.LoadingDisplayPeriod);
    }

    closeGlobalLoading(obj) {
        if(obj.global.loadingCtrl) {
            obj.global.loadingCtrl.dismiss();
            obj.global.loadingCtrl = null;
        }
        // if(this.loadingTimer) {
        //     clearTimeout(this.loadingTimer);
        //     this.loadingTimer = null;
        // }
    }

    closeGlobalAlert(obj) {
        if(obj.global.alertCtrl) {
            obj.global.alertCtrl.dismiss();
            obj.global.alertCtrl = null;
        }
    }

    //全局唯一的弹窗
    createGlobalAlert(obj, opt) {
        if (!obj.global.alertCtrl) {
            let options = {
                title: opt.title || '',
                subTitle: opt.subTitle || '',
                message: opt.message || '',
                buttons: opt.buttons || [],
                inputs: opt.inputs || [],
                enableBackdropDismiss: false,
                cssClass: 'ubbey-alert-class',
            };
            opt.buttons.forEach((item, index) => {
                if (item.handler) {
                    let fn = item.handler;
                    options.buttons[index].handler = (data) => {
                        obj.global.alertCtrl = null;
                        return fn.call(obj, data);
                    }
                } else {
                    options.buttons[index].handler = () => {
                        obj.global.alertCtrl = null;
                    }
                }
            })
            let prompt = obj.global.alertCreator.create(options);
            prompt.present();
            obj.global.alertCtrl = prompt;
        }
    }

    setSelectedBox(deviceSelected, nullsave=false){
        this.deviceSelected = deviceSelected;
        // if (this.deviceSelected){
        //     //忽略保存结果
        //     this.storage.set('DeviceSelected', JSON.stringify(this.deviceSelected));
        // } else if (nullsave){
        //     //忽略保存结果
        //     this.storage.set('DeviceSelected', JSON.stringify(this.deviceSelected));
        // }
    }

    getSelectedBox(fromstorage=false){
        if (fromstorage){
            return new Promise((resolve, reject)=>{
                this.storage.get('DeviceSelected')
                    .then(res => {
                        GlobalService.consoleLog("缓存DeviceSelected获取成功:" + JSON.stringify(res));
                        if(res) {
                            let deviceSelected = JSON.parse(res);
                            resolve(deviceSelected);
                        }else{
                            reject(null);
                        }
                    })
                    .catch(e => {
                        GlobalService.consoleLog("缓存DeviceSelected获取失败:" + e.stack)
                        reject(null);
                    })
            })
        }else{
            return this.deviceSelected;
        }
    }




    //初始化变量
    resetWebrtc(type){
        if(type === 'webrtc'){
            this.fileMaxUpload = GlobalService.webrtcFileControl;
            this.fileMaxDownload = GlobalService.webrtcFileControl;
        } else{
            this.fileMaxUpload = GlobalService.boxFileControl;
            this.fileMaxDownload = GlobalService.boxFileControl;
        }
        this.boxStatus = true;
        this.diskInfoStatus = true;
    }
    public static consoleLog = console.log;
    //日志打印
    // public static consoleLog(msg) {
    //     // if(GlobalService.ENV == "dev"){
    //         console.log(msg);
    //     // }
    // }

    //无登录态初始化
    logoutInit() {
        this.fileTaskList.forEach(item => {
            //所有下载任务设置为暂停状态
            if (item.finished === false) {
                if(item.pausing == "doing"){
                    this.fileHandler[item.taskId].pause();
                    item.speed = 0;
                }
                item.pausing = 'paused';
            }
        });
    }
}
