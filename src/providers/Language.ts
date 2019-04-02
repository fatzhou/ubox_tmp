/**
 * Created by bing on 2018/5/26.
 */
import { Injectable } from '@angular/core';
import { GlobalService } from './GlobalService';
@Injectable()
export class Lang {
    constructor() {
    }

    static L(strid) {
        try {
            let l = GlobalService.applang;
            return Lang[strid][l] || Lang[strid]['en'] || Lang[strid]['cn'];
        } catch (ex) {
            // GlobalService.consoleLog("Error:" + ex + " or Unkown Strid:" + strid);
            return strid;
        }
    }

    static Lf(strid, ...args) {
        try {
            let l = GlobalService.applang;
            let str = Lang[strid][l] || Lang[strid]['en'] || Lang[strid]['cn'];
            let i = 0;
            return str.replace(/\$\{[^\$]*\}/g, function (word) {
                return args[i++];
            });
        }catch(ex) {
            // GlobalService.consoleLog("Error:" + ex + " or Unkown Strid:" + strid);
            return strid;
        }
    }

    static Home = {
        cn: "首页",
        en: "Home",
        kr: ""
    }

    static Mining = {
        cn: "挖矿",
        en: "Mining",
        kr: ""
    }    
    
    static Discover = {
        cn: "发现",
        en: "Discover",
        kr: ""
    }

    static User = {
        cn: "我的",
        en: "User",
        kr: ""
    }

    static LoginBtn = {
        cn: "点击登录/注册",
        en: "",
        kr: ''
    }

    static LoginTips = {
        cn: "尚未登录，点击这里登录/注册",
        en: "",
        kr: ""
    }

    static NeedLogin = {
        cn: "请先登录您的个人账号",
        en: '',
        kr: ''
    }

    static UpdateAssistant = {
        cn: "升级助手",
        en: '',
        kr: ''
    }

    static APP = {
        cn: '',
        en: 'Ubbey APP',
        kr: ''
    }

    static ROM = {
        cn: '',
        en: 'Ubbey Box ROM',
        kr: ''
    }

    static CurrentVersion = {
        cn: '当前版本',
        en: '',
        kr: ''
    }

    static RemoteNetwork = {
        cn: '远场网络',
        en: '',
        kr: ''
    }

    static LocalNetwork = {
        cn: '近场网络',
        en: '',
        kr: ''
    }

    static RemoteNetworkDesc = {
        cn: '手机与Ubbey Box处于不同网络',
        en: '',
        kr: ''
    }

    static LocalNetworkDesc = {
        cn: '手机与Ubbey Box处于同一网络',
        en: '',
        kr: ''
    }

    static ConnectionError = {
        cn: '连接失败',
        en: '',
        kr: ''
    }

    static ConnectionErrorDesc = {
        cn: '网络异常，请检查手机或设备网络状态',
        en: '',
        kr: ''
    }

    static Connecting = {
        cn: '连接中',
        en: '',
        kr: ''
    }

    static ConnectingDesc = {
        cn: '设备连接中，请稍候......',
        en: '',
        kr: ''
    }

    static BuyFavour = {
        cn: '绑定Ubbey Box,您将获得',
        en: '',
        kr: ''
    }

    static BackupImmediately = {
        cn: '去中心化存储私有云盘，随时备份',
        en: '',
        kr: ''
    }

    static StorageEnough = {
        cn: '再也不担心手机存储不够用',
        en: '',
        kr: ''
    }

    static JoinMining = {
        cn: '分享存储空间，参与挖矿',
        en: '',
        kr: ''
    }

    static EarnMoney = {
        cn: '每天赚点零花钱',
        en: '',
        kr: ''
    }

    static BindImmediately = {
        cn: '立即绑定',
        en: '',
        kr: ''
    }

    static BuyBox = {
        cn: '购买Ubbey Box',
        en: '',
        kr: ''
    }

    static Offline = {
        cn: "离线",
        en: '',
        kr: ''        
    }    

    static DeviceReboot = {
        cn: "设备重启",
        en: '',
        kr: ''        
    }    

    static DeviceRebooting = {
        cn: "设备正在重启中，盒子启动后将恢复重连...",
        en: '',
        kr: ''        
    }    

    static RebootSuccess = {
        cn: "设备已重新连接！",
        en: '',
        kr: ''        
    }

    static AdviceSubmit = {
        cn: "意见反馈",
        en: '',
        kr: ''
    }

    static ProblemCategory = {
        cn: "问题类别",
        en: '',
        kr: ''
    }

    static Account = {
        cn: '账号', 
        en: '', 
        kr: ''
    }

    static Application = {
        cn: 'DAPP应用', 
        en: '', 
        kr: ''
    }

    static HardwareDevice = {
        cn: '硬件设备', 
        en:'', 
        kr:''
    }

    static FileTransport = {
        cn: '文件传输', 
        en: '', 
        kr: ''
    }

    static FileManager = {
        cn: '文件管理', 
        en: '', 
        kr: ''
    }

    static Others = {
        cn: '其他', 
        en:'', 
        kr:''
    }

    static ProblemDetail = {
        cn: '反馈问题详情',
        en: '',
        kr: ''
    }

    static ProblemDetailPlaceholder = {
        cn: '您的反馈对我们来说非常重要，请输入您在使用过程中遇到的问题和建议，帮助我们优化产品（该详情输入不超过500个字符）',
        en: '',
        kr: ''
    }

    static ContactEmail = {
        cn: '联系邮箱',
        en: '',
        kr: ''
    }    

    static ContactEmailPlaceholder = {
        cn: '请输入您的常用邮箱',
        en: '',
        kr: ''
    }

    static ProblemSnapshot = {
        cn: '问题截图(可选)',
        en: '',
        kr: ''
    }      

    static UploadSystemLog = {
        cn: '上传系统日志，帮助我们定位问题',
        en: '',
        kr: ''
    }    

    static CommitFeedback = {
        cn: '提交反馈',
        en: '',
        kr: ''
    }    

    static FeedbackSucceeded = {
        cn: '您的反馈已提交成功',
        en: '',
        kr: ''
    }

    static ContactEmailEmpty = {
        cn: '联系邮箱不能为空',
        en: '',
        kr: ''
    }

    static ContactEmailIlledge = {
        cn: '请输入正确的联系邮箱',
        en: '',
        kr: ''
    }    

    static ProblemDetailEmpty = {
        cn: '您的问题描述不能为空',
        en: '',
        kr: ''
    }    

    static CheckUpdatingAvailable = {
        cn: "正在检查可用的更新...",
        en: '',
        kr: ''
    }    

    static DownloadingPackages = {
        cn: "正在下载升级包...",
        en: '',
        kr: ''
    }    

    static InstallingPackages = {
        cn: "正在安装升级包...",
        en: '',
        kr: ''
    }    

    static Downloading = {
        cn: "正在下载(${percent}%)",
        en: '',
        kr: ''
    }    

    static UpgradeStopped = {
        cn: "已停止升级",
        en: '',
        kr: ''
    }

    static UappInstallSucceed = {
        cn: "应用${name}已成功安装!"
    }

    static BindBoxFirst = {
        cn : '该应用需先绑定盒子'
    }

    static BoxOffline = {
        cn : '您的盒子不在线，请在盒子在线时使用'
    }

    static UappUninstalled = {
        cn: '应用${name}已卸载成功'
    }

    static Getting = {
        cn: '获取中(${progress}%)'
    }

    static AppInstalling = {
        cn: '正在安装应用${name}'
    }

    static InstallError = {
        cn: '应用${name}安装失败'
    }

    static Ok = {
        cn: "确定",
        en: "Ok",
        kr: "확인",
    };
    static Back = {
        cn: "返回",
        en: "Back",
        kr: "뒤로 ",
    };
    static Cancel = {
        cn: "取消",
        en: "Cancel",
        kr: "취소",
    };    
    static Update = {
        cn: "升级",
        en: "Update",
        kr: "업데이트",
    };
    static NowUpdate = {
        cn: "立即升级",
        en: "Upgrade now",
        kr: "즉시 업그레이드",
    };
    static Commit = {
        cn: "提交",
        en: "Submit",
        kr: "제출",
    };
    static Loading = {
        cn: "正在加载中...",
        en: "Loading...",
        kr: "로딩중...",
    };
    static Unkown = {
        cn: "未知",
        en: "Unkown",
        kr: "알 수 없음",
    };
    static Uploading = {
        cn: "正在升级中...",
        en: 'Updating...',
        kr: '업그레이드중...'
    };
    static PasswordPlaceholder = {
        cn: "登录密码由8-18位数字和字母组成",
        en: "Login password should contain 8-18 digits and letters ",
        kr: "로그인 비밀번호는 8~18자 및 문자를 포함해야 합니다. ",
    };
    static NeedPassword = {
        cn: "查看该项数据需输入您的密码",
        en: "Enter your password to access desired data",
        kr: "데이터에 액세스 하려면 암호를 입력하십시오.",
    };
    static PlsInputCurrentPassword = {
        cn: "请输入${username}的登录密码",
        en: "Enter ${username} and password",
        kr: " ${username} 및 암호 입력",
    };
    static ReLogin = {
        cn: "重新登录",
        en: "Login again",
        kr: "다시 로그인하십시오. ",
    };
    static UnkownError = {
        cn: "未知错误",
        en: "Unknown error",
        kr: "알 수 없는 오류 ",
    };
    static SystemError = {
        cn: "系统繁忙，请稍候再试",
        en: "System error. Please try again later.",
        kr: "시스템 오류가 발생하였습니다. 잠시 후에 다시 시도해 주십시오.",
    };
    static NetworkError = {
        cn: "网络错误，请检测网络",
        en: "Network error. Please check the network.",
        kr: "네트워크 오류가 발생하였습니다. 네트워크를 확인하십시오.",
    };    
    static RequestError = {
        cn: "网络请求错误，请稍候重试",
        en: "Network request error. Please try again later.",
        kr: "네트워크 요청 오류입니다. 잠시 후에 다시 시도해 주십시오.",
    };
    static ConnectNetworkError = {
        cn: "无法连接网络，请检查网络情况！",
        en: "Network Error. Please check the network.",
        kr: "네트워크 오류입니다. 네트워크를 확인하십시오. ",
    };
    
    //设备发现页
    static YourWifi = {
        cn: "您连接的Wi-Fi: ${wifi_name}",
        en: "You are connecting Wi-Fi:${wifi_name} ",
        kr: " Wi-Fi 연결중입니다:${wifi_이름}",
    };
    static YourNetworkType = {
        cn: "您连接的网络类型: ${type}",
        en: "Network type:${type}",
        kr: "연결된 네트워크 유형:${type}",
    };
    static YourNetworkUnknown = {
        cn: "未知网络",
        en: "Unknown Network",
        kr: "알 수 없는 네트워크",
    };
    static YourNetworkOffline = {
        cn: "网络连接失败",
        en: "Failed to connect to the network",
        kr: "인터넷 접속 실패",
    };
    static IsScanning = {
        cn: "正在扫描",
        en: "Scanning",
        kr: "스캔중입니다.",
    };
    static ScannedDeviceNum = {
        cn: "已扫描到${number}个设备",
        en: "${number} devices found",
        kr: "${number}개의 디바이스를 찾았습니다.",
    };
    static ScanNotFoundDev = {
        cn: "未查找到设备",
        en: "No device found.",
        kr: "디바이스를 찾을 수 없음",
    };
    static IsDoingScan = {
        cn: "正在扫描...",
        en: "Scanning...",
        kr: "스캔중입니다.",
    };
    static BindComment1 = {
        cn: "绑定时请确保手机与设备在可连接外网的同一局域网内",
        en: "Please make sure your phone and Ubbey Box are connecting to the same network ",
        kr: "휴대기기와 디바이스가 동일한 네트워크에 연결되어 있는지 확인하십시오.",
    };
    static BindComment2 = {
        cn: "如设备已绑定，可使用远程登录",
        en: "Your device is bound. Please use remote login",
        kr: "장치가 바인딩되었습니다, 원격 로그인을 사용하십시오. ",
    };
    static RemoteLogin = {
        cn: "远程登录",
        en: "Remote login",
        kr: "원격 로그인",
    };
    static RetryScan = {
        cn: "重新扫描",
        en: "Scan again",
        kr: "다시 스캔",
    };

    //设备管理页
    static AboutDevice = {
        cn: "关于设备",
        en: "About device",
        kr: "디바이스 정보",
    };
    static Online = {
        cn: "在线",
        en: "Online",
        kr: "온라인",
    };
    static StartMining = {
        cn: "开启挖矿",
        en: "Mining",
        kr: "마이닝",
    };
    static BindWallet = {
        cn: "绑定钱包",
        en: "Bound wallet",
        kr: "지갑 바인딩",
    };
    static DeviceName = {
        cn: "设备名称",
        en: "Device name",
        kr: "디바이스 이름",
    };
    static DeviceModel = {
        cn: "型号",
        en: "Model",
        kr: "모델",
    };
    static DeviceStatus = {
        cn: "设备状态",
        en: "Status",
        kr: "상황",
    };
    static DiskModel = {
        cn: "硬盘型号",
        en: "Disk",
        kr: "디스크",
    };
    static DeviceType = {
        cn: "设备类型",
        en: "Device type",
        kr: "디바이스 유형",
    };
    static DeviceStorage = {
        cn: "设备存储",
        en: "Capacity",
        kr: "용량",
    };
    static DiskAvailableSpace = {
        cn: "可用容量：${c}GB",
        en: "Available storage:${c}GB ",
        kr: "사용 가능한 스토리지：${c}GB",
    };
    static DiskTotalSpace = {
        cn: "总容量：${c}GB",
        en: "Total storage:${c}GB",
        kr: "총 스토리지：${c}GB",
    };
    static SerialNo = {
        cn: "序列号",
        en: "Serial No.",
        kr: "일련 번호",
    };
    static FirmwareVersion = {
        cn: "固件版本",
        en: "Version",
        kr: "버전",
    };
    static CheckFirmwareUpdate = {
        cn: "检查固件更新",
        en: "Firmware Updates",
        kr: "펌웨어 업데이트",
    };

    //关于我们
    static Version = {
        cn: "版本",
        en: "Version",
        kr: "버전",
    };
    static WebSite = {
        cn: "网址",
        en: "Website",
        kr: "웹사이트",
    };
    static Copyright = {
        cn: "Copyright © 2018 Universal Labs",
        en: "Copyright © 2018 Universal Labs",
        kr: "Copyright © 2018 Universal Labs",
    };

    //修改密码
    static ChangePassword = {
        cn: "修改密码",
        en: "Change password",
        kr: "비밀번호 변경",
    };
    static PasswordRuleDesc = {
        //请设置8-18位数字和字母密码组合
        cn: "请设置8-18位英文、数字组合密码",
        en: "8-18 characters contain letters and numbers.",
        kr: "8-18자는 문자와 숫자를 포함하여야 합니다",
    };
    static PlsInputUsername = {
        cn: "请输入邮箱地址",
        en: "Enter email address",
        kr: "이메일 주소를 입력하십시오.",
    };
    static PlsInputPassword = {
        cn: "请输入密码",
        en: "Enter password",
        kr: "비밀번호를 입력하십시오.",
    };
    static PlsInputPasswordAgain = {
        cn: "请再次输入密码",
        en: "Enter password again",
        kr: "비밀번호를 다시 입력하십시오.",
    };
    static PlsInputOldPassword = {
        cn: "请输入原密码",
        en: "Enter the old password",
        kr: "기존 비밀번호를 입력하십시오.",
    };
    static PlsInputNewPassword = {
        cn: "请输入新密码",
        en: "Enter the new password",
        kr: "새 비밀번호를 입력하십시오.",
    };
    static PlsInputNewPassword1 = {
        cn: "再次输入新密码",
        en: "Enter the new password again",
        kr: "새 비밀번호를 다시 입력하십시오.",
    };
    //注册/忘记密码
    static Register = {
        cn: "注册",
        en: "Register",
        kr: "회원가입",
    };
    static ForgotPassword = {
        cn: "忘记密码",
        en: "Forgot password",
        kr: "암호를 잊어버렸습니다.",
    };
    static UserAgreementLable = {
        cn: "我已仔细阅读并同意",
        en: " I have read and agreed to ",
        kr: "읽고 동의합니다.",
    };
    static UserAgreementButton = {
        cn: "服务",
        en: "The Terms of Service",
        kr: "서비스 약관",
    };
    static UserAndButton = {
        cn: "及",
        en: " and ",
        kr: "그리고",
    };
    static PrivacyPolicyButton = {
        cn: "隐私条款",
        en: "Privacy Policy.",
        kr: "개인정보 보호정책",
    };
    static CommitRegister = {
        cn: "提交注册",
        en: "Submit registration",
        kr: "회원가입 제출",
    };
    static ResetPassword = {
        cn: "重置密码",
        en: "Reset password",
        kr: "비밀번호 재 설정",
    };
    ////./home/home.html//////////////////////////////
    static DiskTotalCapacity = {
        cn: "总空间",
        en: "Total storage",
        kr: "총 스토리지",
    };
    static DiskFreeCapacity = {
        cn: "空闲空间",
        en: "Available storage",
        kr: "사용 가능한 스토리지",
    };
    static EarningsYesterday = {
        cn: "昨日收益",
        en: "Yesterday's reward",
        kr: "어제의 수익"
    };
    static TotalXYou = {
        cn: "共${X}UBBEY",
        en: "Total ${X}UBBEY",
        kr: "총 ${X}UBBEY"
    };

    ////./device-management/device-management.html////
    static DeviceManagement = {
        cn: "设备管理",
        en: "Manage device",
        kr: "디바이스 관리"
    };
    static IsMining = {
        cn: "挖矿中",
        en: "Mining",
        kr: "마이닝"
    };
    static NotSetMining = {
        cn: "未设置挖矿",
        en: "No mining setting",
        kr: "마이닝 설정 없음"
    };
    static WalletAddress = {
        cn: "钱包地址",
        en: "Wallet address",
        kr: "지갑 주소"
    };
    static NotSetWalletAddress = {
        cn: "未设置挖矿收益钱包",
        en: "No assigned mining reward recipient",
        kr: "마이닝 수익을 받을 지갑이 설정되어 있지 않습니다."
    };
    static DiskType = {
        cn: "硬盘类型",
        en: "Disk type",
        kr: "디스크 유형"
    };
    static DiskCapacity = {
        cn: "硬盘容量",
        en: "Disk capacity",
        kr: "디스크 용량"
    };
    static FormatDisk = {
        cn: "格式化硬盘",
        en: "Format disk ",
        kr: "디스크 포맷"
    };
    static FormatDiskLoading = {
        cn: "硬盘格式化中...",
        en: "The disk is being formatted... ",
        kr: "하드 디스크 포맷중"        
    };    
    static FormatFinished = {
        cn: "硬盘格式化成功！",
        en: "Your disk has been successfully formatted.",
        kr: "하드 디스크 포맷 성공!"        
    };
    static DoUnbind = {
        cn: "解除绑定",
        en: "Unbind",
        kr: "바인딩 해제"
    };
    static YouNotConnectedDev = {
        cn: "您尚未连接设备噢",
        en: "You haven't connected to any devices.",
        kr: "디바이스를 연결하지 않았습니다."
    };

    ////./export-keystore/export-keystore.html////
    static Export = {
        cn: "导出",
        en: "Export",
        kr: "보내기"
    };
    static Copy = {
        cn: "复制",
        en: "Copy",
        kr: "복사"
    };
    static UseRemind = {
        cn: "使用提醒",
        en: "Reminder",
        kr: "알림 "
    };
    static UseRemindContent = {
        cn: "请复制粘贴Keystore文件到可信、安全、离线的地方保存。切勿保存到邮箱、记事本、在线文档、网盘、聊天工具等，勿通过网络工具传输Keystore文件",
        en: "Please save Keystore file in a reliable, secure and offline location. Do not save it in email, notes, online file, online storage system. Do not send Keystore files via online tools.",
        kr: "신뢰할 수 있는 안전한 오프라인 위치에 키 저장소 파일을 저장하십시오. 이메일, 노트, 온라인 파일, 온라인 저장 시스템에 저장하지 마십시오. 온라인 도구를 통해 Keystore 파일을 보내지 마십시오."
    };

    ////./language-select/language-select.html////
    static SaveModify = {
        cn: "保存",
        en: "Save",
        kr: "저장"
    };

    ////./list/list.html////
    static Select = {
        cn: "选择",
        en: "Select",
        kr: "선택"
    };
    static CancelSelectAll = {
        cn: "取消全选",
        en: "Unselect",
        kr: "선택 취소"
    };
    static SelectAll = {
        cn: "全选",
        en: "Select All",
        kr: "모두 선택 "
    };
    static YouHaveUploadFile = {
        cn: "您还没有上传文件",
        en: "You haven't uploaded any file. ",
        kr: "파일을 업로드하지 않았습니다."
    };
    static Download = {
        cn: "下载",
        en: "Download",
        kr: "다운로드"
    };
    static Delete = {
        cn: "删除",
        en: "Delete",
        kr: "삭제"
    };
    static Rename = {
        cn: "重命名",
        en: "Rename",
        kr: "이름 바꾸기"
    };

    ////./login/login.html////
    static Login = {
        cn: "登录",
        en: "Login",
        kr: "로그인"
    };
    static InnerTestVersion = {
        cn: "测试版",
        en: "Test version",
        kr: "테스트 버전"
    };
    static LoginYouCanFinishBind = {
        cn: "登录账号即可完成绑定",
        en: "Login your account and finish binding process",
        kr: "계정 로그인 후 바인딩 할 수 있습니다."
    };
    static PlsInputEmail = {
        cn: "请输入邮箱",
        en: "Enter email address",
        kr: "이메일 주소를 입력하십시오."
    };
    static RegisterNewUser = {
        cn: "注册新用户",
        en: "Register",
        kr: "신규회원 가입"
    };    
    static SearchingBox = {
        cn: "正在查询可用设备…",
        en: "Looking for available device",
        kr: "사용 가능한 장치 찾기"
    };
    static AccountError = {
        cn: "账户无法登录该设备",
        en: "Account cannot login this device",
        kr: "계정이 이 장치에 로그인할 수 없습니다. "
    };
    static AccountErrorReason = {
        cn: "原因：输入账户有误、设备已解绑或重置",
        en: "Cause:wrong account information, devices been unbounded or reset ",
        kr: "원인:오류 계정 정보, 장치의 바인딩 해제 또는 재설정"
    };
    static ReInput = {
        cn: "重新输入",
        en: "Enter again",
        kr: "다시 입력"
    };
    static ReScan = {
        cn: "重新扫描",
        en: "Scan again",
        kr: "다시 스캔"
    }
    ////./mining/mining.html////
    static MiningSetting = {
        cn: "挖矿设置",
        en: "Mining Setting",
        kr: "마이닝 설정"
    };
    static YesterdayReward = {
        cn: "昨日收益",
        en: "Yesterday's reward",
        kr: "어제의 수익"
    };
    static MiningClosed = {
        cn: "未开启挖矿",
        en: "Mining inactivated",
        kr: "마이닝 설정이 활성화 되지 않음"
    };
    static TotalReward = {
        cn: "累计收益",
        en: "Total reward",
        kr: "누적 수익"
    };
    static LockedReward = {
        cn: "待解锁收益",
        en: "Locked reward",
        kr: "잠긴 수익"
    };
    static NotSetWallet = {
        cn: "未设置钱包",
        en: "No assigned wallet",
        kr: "지갑이 설정되어 있지 않습니다."
    };
    static Day = {
        cn: "天",
        en: "D",
        kr: "일"
    };
    static Hour = {
        cn: "小时",
        en: "H",
        kr: "시간"
    };    
    static Minute = {
        cn: "分钟",
        en: "M",
        kr: "분"
    };
    static MinedTime = {
        cn: "挖矿时长",
        en: "Mined time",
        kr: "마이닝 시간"
    };
    static ShareStorage = {
        cn: "共享存储",
        en: "Shared storage",
        kr: "스토리지 공유"
    };
    static LastNumDayReward = {
        cn: "近${N}天收益",
        en: "Last ${N} day's reward ",
        kr: "최근${N} 일 수익 "
    };
    static LastNumDayNoReward = {
        cn: "您最近${N}天内无挖矿收益记录",
        en: "No mining reward in last ${N} days",
        kr: "지난{N}일 동안 마이닝 수익이 없습니다."
    };
    static ViewRewardList = {
        cn: "查看收益记录",
        en: "View reward history",
        kr: "수익 기록 보기 "
    };

    ////./mining-list/mining-list.html////
    static MiningReward = {
        cn: "挖矿收益",
        en: "Mining reward",
        kr: "마이닝 수익 "
    };
    static HaveNoRewardRecord = {
        cn: "您还没有收益记录",
        en: "You don't have any reward records",
        kr: "수익 기록이 없습니다."
    };

    ////./mining-setting/mining-setting.html////
    static OpenMining = {
        cn: "开启挖矿",
        en: "Mining",
        kr: "마이닝"
    };
    static OpenChainMining = {
        cn: "开启测试链挖矿",
        en: "Start mining with test chain",
        kr: "테스트 체인으로 마이닝 시작"
    };
    static AvailableStorage = {
        cn: "可用${totalSize}GB",
        en: "Available ${totalSize}GB ",
        kr: "사용 가능한 ${총 용량}GB"
    };
    static RewardLess = {
        cn: "收益少",
        en: "Low return",
        kr: "수익이 적습니다."
    };
    static RewardMore = {
        cn: "收益多",
        en: "High return",
        kr: "수익이 많습니다."
    };
    static MiningRewardAddress = {
        cn: "挖矿收益地址",
        en: "Mining reward recipient",
        kr: "마이닝 수익 주소"
    };
    static Modify = {
        cn: "更改",
        en: "Modify",
        kr: "수정"
    };
    static Setting = {
        cn: "设置",
        en: "Settings",
        kr: "설정"
    };
    static MyWalletName = {
        cn: "钱包名称",
        en: "Wallet name",
        kr: "지갑 이름"
    };

    ////./user/user.html////
    static WalletManagement = {
        cn: "钱包管理",
        en: "Manage wallet",
        kr: "지갑관리"
    };
    static ModifyPassword = {
        cn: "修改密码",
        en: "Change password",
        kr: "비밀번호 변경"
    };
    static CheckUpdate = {
        cn: "检查更新",
        en: "Check updates",
        kr: "업데이트 확인"
    };
    static AboutUs = {
        cn: "关于我们",
        en: "About us",
        kr: "정보"
    };
    static Language = {
        cn: "多语言",
        en: "Language",
        kr: "언어"
    };
    static ExitLogin = {
        cn: "退出登录",
        en: "Sign out",
        kr: "로그아웃"
    };

    ////./verify-email/verify-email.html////
    static InputVerifyCode = {
        cn: "填写验证码",
        en: "Enter verification code",
        kr: "인증코드 입력"
    };
    static VerifyCodeSend = {
        cn: "验证码已发送至邮箱${username}",
        en: "The verification code is sent to: ${username}",
        kr: "인증코드가 아래 주소로 전송되었습니다.: ${사용자 이름}"
    };
    static NSecondRetryGet = {
        cn: "${N}S后可重新获取",
        en: "Resend in ${N} seconds ",
        kr: "${N}초 이후에 재전송 가능"
    };
    static WarmRemind = {
        cn: "温馨提示",
        en: "Reminder",
        kr: "알림"
    };
    static WarmRemindContend1 = {
        cn: "验证码有效期为${N}分钟，超时请重新获取",
        en: "The verification code will expire in 30 minutes. Please reacquire the verification code after expiration;",
        kr: "인증코드가 30분 후에 만료됩니다. 만료 후에 다시 인증코드를 받으십시오."
    };
    static WarmRemindContend2 = {
        cn: "如收不到邮件，请检查邮件地址或检查邮件是否被归类于垃圾邮件",
        en: "If failed to receive the verification code, please check your email address and spam folder.",
        kr: "인증코드를 받지 못한 경우 스팸 메일함을 확인해 주시고 이메일 주소를 다시 확인해 주시기 바랍니다."
    };

    ////./wallet-coinbase/wallet-coinbase.html////
    static CreateWallet = {
        cn: "创建钱包",
        en: "Create wallet",
        kr: "지갑 만들기"
    };
    static ViewBalance = {
        cn: "查看余额",
        en: "View balance",
        kr: "잔액 보기"
    };
    static HaveReceived = {
        cn: "余额",
        en: "Balance",
        kr: "잔액"
    };
    static WaitUnlock = {
        cn: "待解锁",
        en: "Locked",
        kr: "잠금"
    };
    static YouHaveNotCreateWallet = {
        cn: "您还没有创建过钱包噢",
        en: "You haven't created any wallets.",
        kr: "지갑을 만들지 않았습니다."
    };

    ////./wallet-generator/wallet-generator.html////
    static PayPasswordRemind = {
        cn: "支付密码用于保护私钥和交易授权，强度非常重要，Ulabs不存储密码，也无法帮您找回，请务必牢记",
        en: "Payment password is used to protect private key and authorizing transactions. Universal Labs will not store or retrieve password, please keep your password safely.",
        kr: "결제 암호는 개인 키를 보호하고 트랜잭션을 인증하는 데 사용됩니다. Universal Labs는 암호를 저장하거나 검색하지 않습니다. 암호를 안전하게 유지하십시오."
    };
    static NewWalletName = {
        cn: "钱包名称",
        en: "wallet name",
        kr: "지갑 이름"
    };
    static SetPayPassword = {
        cn: "设置支付密码",
        en: "Enter transaction password",
        kr: "출금 비밀번호 설정"
    };
    static PayPasswordCannotEmpty = {
        cn: "支付密码不能为空",
        en: "Password could not be blank",
        kr: "출금 비밀번호는 비워둘 수 없습니다."
    };
    static PlsInputAgain = {
        cn: "请再次输入",
        en: "Enter the password again",
        kr: "다시 입력하십시오."
    };
    static ImportWallet = {
        cn: "导入",
        en: "Import",
        kr: "가져오기"
    };

    ////./wallet-import/wallet-import.html////
    static ImportWalletRemind = {
        cn: "直接粘贴以太坊钱包keystore内容至输入框。或者通过生成keystore内容二维码，扫描录入。",
        en: "Please paste Ethereum wallet Keystore file contents into the input box; Or import Keystore directly by scanning the generated QR code.",
        kr: "지갑 키스토어 파일 내용을 입력 상자에 붙여 넣거나 생성된 QR 코드를 스캔하여 키스토어를 직접 가져오십시오."
    };
    static WalletTextContend = {
        cn: "文本内容",
        en: "Text contents",
        kr: "텍스트 내용"
    };
    static StartImport = {
        cn: "开始导入",
        en: "Import",
        kr: "불러오기"
    };

    ////./wallet-info/wallet-info.html////
    static WalletName = {
        cn: "钱包名称",
        en: "Wallet Name",
        kr: "지갑 이름"
    };
    static DeleteWallet = {
        cn: "删除钱包",
        en: "Delete wallet",
        kr: "지갑 삭제"
    };

    ////./wallet-name-modify/wallet-name-modify.html////
    static ModifyName = {
        cn: "修改名称",
        en: "Rename",
        kr: "이름 변경"
    };
    static YouWalletNewName = {
        cn: "您的钱包的新名字",
        en: "Your wallet's new name",
        kr: "지갑의 새 이름"
    };

    ////./wallet-select/wallet-select.html////
    static CreateNewWallet = {
        cn: "新建钱包",
        en: "Create",
        kr: "지갑 새로 만들기"
    };


    //设备错误码提示
    static ErrBox = {
        1001: {
            Title: {
                cn: "参数不合格",
                en: "Illegal parameter ",
                kr: "잘못된 매개 변수",
            },
            Subtitle: {
                cn: "请提交相关参数",
                en: "Please submit associated parameter",
                kr: "해당 매개 변수를 제출하십시오.",
            }
        },
        1002: {
            Title: {
                cn: "钱包名字太长",
                en: "The wallet's name is too long",
                kr: "지갑 이름이 너무 깁니다.",
            },
            Subtitle: {
                cn: "钱包名字最多支持60个字符",
                en: "The wallet's name should contain no more than 60 characters",
                kr: "지갑 이름은 60자를 넘지 않아야 합니다.",
            }
        },
        1003: {
            Title: {
                cn: "签名错误",
                en: "Invalid signature",
                kr: "잘못된 서명",
            },
            Subtitle: {
                cn: "您的签名错误",
                en: "Your signature is invalid. ",
                kr: "서명이 잘못되었습니다.",
            }
        },
        1101: {
            Title: {
                cn: "该设备非您所有，请使用正确的账户登录",
                en: "The Ubbey Box does not belong to this account. Please use the correct account. ",
                kr: "당신 소유의 Ubbey Box가 아닙니다. 올바른 계정을 사용하십시오.",
            },
            Subtitle: {
                cn: "当前输入账户非设备拥有者",
                en: "The Ubbey Box does not belong to the current account ",
                kr: "이 계정은 해당 Ubbey Box와 연결된 계정이 아닙니다 .",
            }
        },
        1102: {
            Title: {
                cn: "请输入正确的账户密码",
                en: "Enter the correct password",
                kr: "올바른 비밀번호를 입력하십시오.",
            },
            Subtitle: {
                cn: "请核对并确认密码",
                en: "Please check and confirm the password",
                kr: "비밀번호를 확인하십시오.",
            }
        },
        1103: {
            Title: {
                cn: "您的登录状态已失效",
                en: "You have been signed out",
                kr: "로그아웃 되었습니다.",
            },
            Subtitle: {
                cn: "点击确定，重新登录系统",
                en: "Please login again",
                kr: "다시 로그인 하십시오.",
            },
            action() {
                this.global.events.publish('token:expired', Date.now());
            }
        },
        1111: {
            Title: {
                cn: "签名解析失败",
                en: "Failed to decrypt signature",
                kr: "서명을 해독하지 못했습니다.",
            },
            Subtitle: {
                cn: "系统错误，未获取到签名信息",
                en: "System error. Unable to acquire signature information",
                kr: "시스템 오류입니다. 서명 정보를 가져올 수 없습니다.",
            }
        },
        1112: {
            Title: {
                cn: "签名校验不通过",
                en: "Failed to pass signature verification",
                kr: "서명 확인을 통과하지 못 했습니다.",
            },
            Subtitle: {
                cn: "请使用正确的签名数据",
                en: "Please use the correct signature",
                kr: "올바른 서명을 사용하십시오.",
            }
        },
        1104: {
            Title: {
                cn: "用户名不符合规则",
                en: "Invalid username format",
                kr: "잘못된 형식의 사용자 이름입니다."
            },
            Subtitle: {
                cn: "请使用正确的邮箱地址",
                en: "Enter a valid email address",
                kr: "올바른 이메일 주소를 입력하십시오."
            }
        },
        1121: {
            Title: {
                cn: "设置的存储空间超出磁盘容量",
                en: "Storage space exceeds disk capacity ",
                kr: "설정된 스토리지 공간이 디스크 용량을 초과하였습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1201: {
            Title: {
                cn: "设备ID错误",
                en: "Ubbey Box ID error",
                kr: "디바이스 ID 오류 "
            },
            Subtitle: {
                cn: "该设备ID非当前设备",
                en: "The ID does not match to the Ubbey Box",
                kr: "ID가 디바이스와 일치하지 않습니다."
            }
        },
        1202: {
            Title: {
                cn: "设备已被绑定",
                en: "The Box has been bound",
                kr: "디바이스가 이미 바인딩 되었습니다."
            },
            Subtitle: {
                cn: "请使用设备绑定的账户登录",
                en: "Please log in the Ubbey Box with binding account.",
                kr: " Ubey Box에 바인딩 계정으로 로그인하십시오."
            }
        },
        1301: {
            Title: {
                cn: "keystore和钱包地址不匹配",
                en: "The Keystore does not match the wallet address. ",
                kr: "Keystore와 지갑 주소가 일치하지 않습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1302: {
            Title: {
                cn: "钱包地址已存在",
                en: "The wallet address already exist",
                kr: "지갑 주소가 이미 존재합니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1303: {
            Title: {
                cn: "钱包地址不符合规则",
                en: "Invalid wallet address format",
                kr: "잘못된 형식의 지갑 주소입니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1305: {
            Title: {
                cn: "钱包名称过长",
                en: "The wallet's name is too long",
                kr: "지갑 이름이 너무 깁니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1401: {
            Title: {
                cn: "文件夹不存在",
                en: "The folder does not exist",
                kr: "파일 폴더가 존재하지 않습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1402: {
            Title: {
                cn: "文件夹已存在",
                en: "The folder already exist",
                kr: "파일 폴더가 이미 있습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1403: {
            Title: {
                cn: "该文件夹已包含同名文件",
                en: "The file with the same name is already existed in folders",
                kr: "같은 이름의 파일이 이미 폴더에 존재합니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
        1406: {
            Title: {
                cn: "重命名名字不符合规则",
                en: "Invalid rename format",
                kr: " 변경된 이름이 요구조건에 부합되지 않습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },        
        1502: {
            Title: {
                cn: "设备没有挂载硬盘，无法进行该操作",
                en: "No disk detected, operation failed.",
                kr: "디바이스에 마운트 된 하드 디스크가 없으므로, 이 작업을 수행할 수 없습니다."
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        }
        
    };

    //桥接中心错误码提示
    static ErrBridge = {
        20002: {
            Title: {
                cn: "用户未注册",
                en: "The account is not registered",
                kr: "등록되지 않은 계정입니다."
            },
            Subtitle: {
                cn: "该用户尚未注册系统",
                en: "The current account is not registered",
                kr: "사용자가 아직 시스템에 등록하지 않았습니다."
            },
            ButtonText: {
                cn: "重新登录",
                en: "Login again",
                kr: "다시 로그인"
            }
        },
        20003: {
            Title: {
                cn: "该用户已注册",
                en: "The account has been registered",
                kr: "계정이 이미 등록되었습니다."
            },
            Subtitle: {
                cn: "该邮箱已注册，请更换邮箱或直接登录。如忘记密码，可重置密码。",
                en: "This mail has been registered, please change the mail or login directly. If you forget your password, you can reset it",
                kr: "이 메일은 이미 등록되었습니다. 메일을 변경하거나 직접 로그인하십시오. 암호를 잊어버린 경우 재설정할 수 있습니다."
            }
        },
        20005: {
            Title: {
                cn: "登录失败",
                en: "Failed to login",
                kr: "로그인 실패"
            },
            Subtitle: {
                cn: "登录失败，请稍候再试。",
                en: "Failed to login. Please try again later",
                kr: "로그인에 실패했습니다. 잠시후 다시 시도해 주십시오."
            }
        },
        20010: {
            Title: {
                cn: "您的登录态已失效",
                en: "You have been signed out",
                kr: "로그아웃 되었습니다."
            },
            Subtitle: {
                cn: "请点击「重新登录」按钮，重新登录系统",
                en: "Please click「Login again」button to login again",
                kr: " 다시 로그인 하려면 [다시 로그인] 버튼을 클릭 하십시오."
            },
            ButtonText: [{
                cn: "取消登录",
                en: "cancel",
                kr: ""
            },
            {
                cn: "重新登录",
                en: "Login again",
                kr: "다시 로그인"
            }],
            action: [
                (that) => {
                    that.global.events.publish('token:expired', {that: that, action: "cancal"});
                },
                (that) => {
                    that.global.events.publish('token:expired', {that: that, action: "login"});
                },
            ]
        },
        20011: {
            Title: {
                cn: "用户状态异常",
                en: "Abnormal account status",
                kr: "비정상 계정 상태"
            },
            Subtitle: {
                cn: "该登录用户状态异常，请联系客服",
                en: "Unusual activities detected. Please contact customer service.",
                kr: "현재 계정의 사용자 로그인 상태가 비정상입니다. 고객 서비스에 문의하십시오."
            }
        },
        20012: {
            Title: {
                cn: "该账户已绑定设备，请更换用户",
                en: "Your current account is already bound to a Ubbey Box. Please switch to another account.",
                kr: "현재 계정은 이미 디바이스에 바인딩 되어 있습니다. 다른 계정으로 전환하십시오."
            },
            Subtitle: {
                cn: "每个账户仅允许绑定一个设备",
                en: "Each account is only allowed to bind to one Ubbey Box",
                kr: "각 계정은 하나의 디바이스에만 바인딩 할 수 있습니다."
            }
        },
        20052: {
            Title: {
                cn: "验证码发送错误",
                en: "Verification code delivery error ",
                kr: "인증코드 발송 오류"
            },
            Subtitle: {
                cn: "系统发送验证码时出错，请更换邮箱或稍候再试。",
                en: "System error during verification code delivery. Please change the email or try again later ",
                kr: "인증코드 발송 중에 시스템 오류가 발생하면 이메일을 변경하거나 나중에 다시 시도하십시오."
            }
        },
        20080: {
            Title: {
                cn: "请输入正确的账户密码",
                en: "Enter the correct password",
                kr: "올바른 비밀번호를 입력하십시오."
            },
            Subtitle: {
                cn: "您的密码输入错误，请确认。",
                en: "Your password is incorrect. Please check again",
                kr: "비밀번호가 올바르지 않습니다. 다시 확인해 주세요."
            }
        },
        20100: {
            Title: {
                cn: "请输入正确的验证码",
                en: "Enter valid verification code",
                kr: "올바른 인증코드를 입력하십시오."
            },
            Subtitle: {
                cn: "您提交的验证码错误，请核对。",
                en: "The verification code is incorrect. Please check again",
                kr: "인증코드가 잘못되었습니다. 다시 확인해 주세요."
            }
        },
        20151: {
            Title: {
                cn: "设备状态错误",
                en: "Ubbey Box status error",
                kr: "디바이스 상태 오류"
            },
            Subtitle: {
                cn: "该设备当前无法绑定，请稍候再试",
                en: "The Ubbey Box cannot be bound. Please try again later",
                kr: "디바이스를 바인딩 할 수 없습니다. 잠시후 다시 시도해 주십시오."
            }
        },
        30003: {
            Title: {
                cn: "设备ID错误",
                en: "Ubbey Box ID error",
                kr: "디바이스 ID 오류 "
            },
            Subtitle: {
                cn: "该设备没有预绑定，无法确认",
                en: "The Ubbey Box is not bound. Unable to confirm",
                kr: "디바이스가 바인딩 되어 있지 않아서 확인할 수 없습니다."
            }
        },
        30400: {
            Title: {
                cn: "请勿提交重复交易",
                en: "Please don't repeat transactions",
                kr: "거래를 반복하지 마십시오. "
            },
            Subtitle: {
                cn: "",
                en: "",
                kr: ""
            }
        },
    };

    ////src/pages/about-us/about-us.ts////
    ////src/pages/change-passwd/change-passwd.ts////
    static WORD6f82c27d = {
        cn: "您的原密码不能为空",
        en: "Your original password could not be blank",
        kr: "기존 비밀번호 입력란은 비워 둘 수 없습니다."
    };
    static WORDaa3d0f8d = {
        cn: "两次密码输入不一致",
        en: "The passwords did not match",
        kr: "비밀번호가 일치하지 않습니다."
    };
    static WORD9ca12d39 = {
        cn: "校验通过，开始修改密码",
        en: "Verification confirmed. Please change the password",
        kr: "인증이 통과 되었습니다. 비밀번호를 변경하겠습니다."
    };
    static WORD8b37527e = {
        cn: "您当前未连接设备，无法修改密码",
        en: "You are unable to change password now. You have to connect to your Ubbey Box first.",
        kr: "지금은 비밀번호를 변경할 수 없습니다. 먼저 고객님의 디바이스에 연결해 주십시오."
    };
    static WORD49fd48a8 = {
        cn: "请重新搜索网络内的设备",
        en: "Please search the Ubbey Box in the network again",
        kr: "네트워크 내에서 디바이스를 다시 검색하십시오."
    };
    static WORD85ceea04 = {
        cn: "取消",
        en: "Cancel",
        kr: "취소"
    };
    static WORD0cde60d1 = {
        cn: "搜索设备",
        en: "Search Ubbey Box",
        kr: "디바이스 검색"
    };
    static WORD22138f20 = {
        cn: "获取设备列表失败",
        en: "Failed to achieve Ubbey Boxes ",
        kr: "박스 리스트 다운로드 실패했습니다."
    };
    static WORD7b23f9a4 = {
        cn: "设备密码修改失败",
        en: "Failed to change Ubbey Box password",
        kr: "디바이스의 비밀번호 변경에 실패했습니다."
    };
    static WORD07c69da3 = {
        cn: "确认密码失败",
        en: "Failed to confirm password",
        kr: "비밀번호 확인에 실패했습니다."
    };
    static WORD6eb2ef18 = {
        cn: "您的密码已修改成功",
        en: "Successfully changed",
        kr: "비밀번호 변경이 완료되었습니다."
    };
    static WORD206a718a = {
        cn: "请使用新密码重新登录",
        en: "Please login with the new password",
        kr: "새 비밀번호로 다시 로그인하십시오."
    };
    static WORD31ef4b33 = {
        cn: "重新登录",
        en: "Please login again",
        kr: "다시 로그인하십시오."
    };
    ////src/pages/device-list/device-list.ts////
    static WORD46ed4d8e = {
        cn: "该设备非您所有",
        en: "This Ubbey Box does not belong to you",
        kr: "해당 디바이스는 고객님의 것이 아닙니다."
    };
    static WORDd0b25fa3 = {
        cn: "您的远程登录账户与设备所有者不一致",
        en: "Your remote login account does not match the Ubbey Box owner account",
        kr: "원격 로그인 계정이 디바이스 소유자 계정과 일치하지 않습니다."
    };
    static WORD1b9bba37 = {
        cn: "更换账户",
        en: "Switch account",
        kr: "계정 전환"
    };
    static WORD1e477974 = {
        cn: "即将删除历史记录：",
        en: "Delete history: ",
        kr: "기록 삭제 중"
    };
    static WORD24fa7b55 = {
        cn: "直接登录，未设置设备信息",
        en: "Login directly without setting Ubbey Box's information",
        kr: "디바이스 정보를 설정하지 않고 바로 로그인"
    };
    ////src/pages/device-management/device-management.ts////
    static WORDe3f67d41 = {
        cn: "没连接设备！",
        en: "Not connected to the Ubbey Box",
        kr: "디바이스에 연결되지 않음!"
    };
    static WORD59b0d149 = {
        cn: "未连接任何设备",
        en: "Not connected to any Ubbey Box",
        kr: "디바이스에 연결되지 않음"
    };
    static WORDe6e1739b = {
        cn: "点击搜索设备，重新搜索网络内的设备",
        en: "Click to search Ubbey Box.",
        kr: "클릭하여 디바이스를 검색하십시오."
    };
    static WORD621202ef = {
        cn: "返回",
        en: "Back",
        kr: "뒤로"
    };
    static WORDdece57fd = {
        cn: "连接了设备!",
        en: "Connected to a Ubbey Box",
        kr: "디바이스에 연결됨"
    };
    static WORDe008139a = {
        cn: "未知类型",
        en: "Unknown",
        kr: "알 수 없음"
    };
    static WORD652905a6 = {
        cn: "格式化磁盘",
        en: "Format the disk",
        kr: "디스크 포맷"
    };
    static WORDcc4cfe3d = {
        cn: "格式化将会丢失磁盘内所有数据且无法恢复",
        en: "All data in disk will be deleted and unable to be restored after formatting.",
        kr: "디스크를 포맷하면 모든 데이터는 삭제되고  다시 복원할 수 없습니다."
    };
    static WORD95d39fcd = {
        cn: "格式化",
        en: "Format",
        kr: "포맷"
    };
    static WORDaa10600b = {
        cn: "正在为您格式化磁盘",
        en: "Formatting disk",
        kr: "디스크 포맷중"
    };
    static WORDbe8f94ca = {
        cn: "整个格式化过程大概10分钟左右，请休息片刻",
        en: "The formatting process will take about 10 minutes.",
        kr: "포맷 프로세스는 약 10분 정도 소요됩니다."
    };
    static WORDd6291d38 = {
        cn: "回到首页",
        en: "Back to home page",
        kr: "홈으로 돌아가기"
    };
    static WORD67551a7e = {
        cn: "解除绑定",
        en: "Unbind",
        kr: "바인딩 해제"
    };
    static WORD9f502956 = {
        cn: "解除绑定后您可以使用其他账户重新绑定设备",
        en: "After unbinding, the Ubbey Box could be bound to other account",
        kr: "바인딩 해제 후, 다른 계정을 디바이스에 바인딩 할 수 있습니다."
    };
    static WORDd0ce8c46 = {
        cn: "确定",
        en: "Confirm",
        kr: "확인"
    };
    static WORD4b3c3932 = {
        cn: "预解除绑定失败",
        en: "Failed to unbind",
        kr: "바인딩 해제 실패"
    };
    static WORD3f31fa42 = {
        cn: "设备解除绑定失败",
        en: "Failed to unbind the Ubbey Box",
        kr: "디바이스와 바인딩 해제 실패"
    };
    static WORDab667a91 = {
        cn: "您的设备已经成功解除绑定",
        en: "Successfully unbound",
        kr: "디바이스와 바인딩 해제 성공"
    };
    ////src/pages/export-keystore/export-keystore.ts////
    static WORDde2e6b57 = {
        cn: "未获取到keystore文件信息",
        en: "Unable to obtain Keystore file information",
        kr: "Keystore 파일 정보를 불러올 수 없습니다."
    };
    static WORDa98d53f4 = {
        cn: "您点击了复制按钮",
        en: "You clicked copy button",
        kr: "고객님은 복사 버튼을 클릭 했습니다."
    };
    static WORDfe5ae1b8 = {
        cn: "您的keystore文件已粘贴到剪贴板",
        en: "Your Keystore is already pasted into clipboard",
        kr: "Keystore 파일이 이미 클립 보드에 복사되었습니다."
    };
    ////src/pages/home/home.ts////
    static WORD2e18dc31 = {
        cn: "成功接收到事件",
        en: "Successfully received event",
        kr: "이벤트 수신에 성공했습니다."
    };
    static WORD0623a392 = {
        cn: "获取磁盘信息",
        en: "Receiving disk information",
        kr: "디스크 정보를 불러오는 중"
    };
    static WORD870636e5 = {
        cn: "设置挖矿收益",
        en: "Set mining reward",
        kr: "마이닝 수익 설정"
    };
    static WORD0753d080 = {
        cn: "获取收益成功",
        en: "Successfully earned rewards",
        kr: "수익 획득에 성공"
    };
    static WORD5d6ecf8d = {
        cn: "选择文件夹类型：",
        en: "Select folder type",
        kr: "폴더 유형 선택"
    };
    static WORD2a0b753a = {
        cn: "您尚未连接设备",
        en: "You haven't connected to any boxes",
        kr: "디바이스를 연결하지 않았습니다."
    };
    static WORDc89b0da1 = {
        cn: "连接设备后方可查看",
        en: "Please connect the Ubbey Box to access your files",
        kr: "파일에 액세스하려면 Ubey Box를 연결하십시오. "
    };
    static WORD688d7511 = {
        cn: "不连接",
        en: "Disconnected",
        kr: "연결 끊김"
    };
    static WORD81fe0a15 = {
        cn: "收到文件上传成功事件",
        en: "Receive file uploaded success event",
        kr: "파일 업로드에 성공한 알림 수신"
    };
    ////src/pages/language-select/language-select.ts////
    static WORD8a4691ac = {
        cn: "您选择了语言:",
        en: "You selected language: ",
        kr: "언어를 선택했습니다."
    };
    static WORDbae90e96 = {
        cn: "语言切换成功！",
        en: "Successfully changed",
        kr: "언어 변경에 성공!"
    };
    ////src/pages/list/list.ts////
    static WORD8c9fe31b = {
        cn: "选择了文件:",
        en: "Selected file: ",
        kr: "파일을 선택하였습니다."
    };
    static WORD9f82fe81 = {
        cn: "文件未被选中，直接加入选中列表",
        en: "The file is not selected, add to selected items list",
        kr: "파일이 선택되지 않았습니다. 선택한 항목을 리스트에 추가하십시오."
    };
    static WORDbb1902d2 = {
        cn: "从选择列表中清除索引为",
        en: "Clear index from selected items list",
        kr: "선택한 항목 리스트에서 색인 지우기"
    };
    static WORDc9df6ce6 = {
        cn: "的记录",
        en: "record",
        kr: "기록"
    };
    static WORDbba98b1c = {
        cn: "获取文件列表成功，即将清除状态",
        en: "The file list was successfully obtained, and about to clear status",
        kr: "파일 리스트를 성공적으로 불러왔으며 상태를 지우려고 합니다."
    };
    static WORDa509a58d = {
        cn: "重置状态",
        en: "Reset status",
        kr: "상태 재 설정"
    };
    static WORD09adbc77 = {
        cn: "当前已经全选",
        en: "Selected all",
        kr: "모두 선택하였습니다."
    };
    static StartDownloadFile = {
        cn: "开始下载文件${file}",
        en: "Downloading ${file} ",
        kr: "다운로드 중 ${file}"
    };
    static StartDownloading = {
        cn: '开始下载文件',
        en: 'start downloading',
        kr: '다운로드를 시작'
    }
    static WORDc8b1ea31 = {
        cn: "尚未选择文件，无法下载",
        en: "You haven't selected any files, unable to download",
        kr: "파일을 선택하지 않아 다운로드할 수 없습니다."
    };
    static WORDe7a259fa = {
        cn: "从以下路径下载:",
        en: "Download from following path: ",
        kr: "다음 경로에서 다운로드:"
    };
    static FileSuccessfulSaved = {
        cn: "文件${name}已成功并存储在${path}",
        en: "The file ${name} is successfully saved in ${path} ",
        kr: "${name}파일이${path}에 저장됨"
    };
    static WillRenameDirectory = {
        cn: "您即将对文件夹${directory}重命名",
        en: "You are going to rename folder ${directory} ",
        kr: "폴더 이름을${directory}(으)로 바꾸려고 합니다."
    };
    static WillRenameFile = {
        cn: "您即将对文件${file}重命名",
        en: "You are going to rename file${file} ",
        kr: " 파일${file}의 이름을 바꾸려고 합니다."
    };
    static RenameDirectorySuccess = {
        cn: "文件夹重命名成功",
        en: "Successfully renamed",
        kr: "폴더 이름이 성공적으로 변경되었습니다."
    };
    static RenameFileSuccess = {
        cn: "文件重命名成功",
        en: "Successfully renamed",
        kr: "파일 이름이 성공적으로 변경되었습니다."
    };
    static MoveDirectorySuccess = {
        cn: "文件夹移动成功",
        en: "Successfully moved",
        kr: "폴더가 성공적으로 이동되었습니다."
    };
    static MoveFileSuccess = {
        cn: "文件移动成功",
        en: "Successfully moved",
        kr: "파일이 성공적으로 이동되었습니다."
    };
    static PlsInputYourDirectoryName = {
        cn: "请输入您想设定的文件夹名字",
        en: "Enter folder name",
        kr: "폴더 이름을 입력하십시오."
    };
    static PlsInputYourFileName = {
        cn: "请输入您想设定的文件名字",
        en: "Enter file name",
        kr: "파일 이름을 입력하십시오."
    };
    static WORD81b2d4a0 = {
        cn: "删除文件：",
        en: "Delete file",
        kr: "파일 삭제"
    };
    static WORDeeaff15e = {
        cn: "已成功删除",
        en: "Successfully deleted",
        kr: "삭제 완료되었습니다."
    };
    static WORD853a141c = {
        cn: "个文件!",
        en: "files!",
        kr: "개 파일!"
    };
    static WORD57a63e05 = {
        cn: "删除成功！",
        en: "Successfully deleted",
        kr: "삭제 완료되었습니다."
    };
    static WORD38bf1a39 = {
        cn: "部分文件删除出错，请重试",
        en: "Error occurred during deleting files. Please try again",
        kr: "파일을 삭제하는 과정에서 오류가 발생했습니다. 다시 시도해 보십시오."
    };
    static WORD3b29a0e3 = {
        cn: "开始删除文件",
        en: "Begin deleting files",
        kr: "파일 삭제 시작"
    };
    static WORDfd8af984 = {
        cn: "尚未选择文件，无法删除",
        en: "You haven't selected and files. Unable to delete",
        kr: "파일을 선택하지 않았습니다. 삭제할 수 없습니다."
    };
    static WORD3aff2d2f = {
        cn: "您的勾选项中包含文件夹",
        en: "Your selected items contain folders",
        kr: "선택한 항목에 폴더가 포함되어 있습니다."
    };
    static WORD5e19363c = {
        cn: "您确定要删除文件吗？",
        en: "Are you sure to delete files?",
        kr: "파일을 삭제 하시겠습니까?"
    };
    static WORD248579dd = {
        cn: "文件目录包含的内容也将被删除",
        en: "Your table of contents is going to be deleted as well",
        kr: "목차에 포함된 내용도 삭제됩니다."
    };
    static WORD5627ad0c = {
        cn: "文件被删除后将不可恢复",
        en: "The files will be unable to be restored after deleting.",
        kr: "삭제 후 파일을 복원할 수 없습니다."
    };
    static WORD5627ad0c1 = {
        cn: "删除任务列表",
        en: "Delete the tasks list",
        kr: "미션 리스트 삭제"
    };
    static WORD5627ad0c2 = {
        cn: "任务列表被删除后将无法恢复",
        en: "The tasks list could not be restored after deleting",
        kr: "미션 리스트가 삭제 되면 다시 복원할 수 없습니다."
    };
    static WORD0e46988a = {
        cn: "删除",
        en: "Delete",
        kr: "삭제"
    };
    static WORDb11bca9a = {
        cn: "开始重命名文件",
        en: "Begin renaming file",
        kr: "파일 이름 변경 시작"
    };
    static WORDae3092c3 = {
        cn: "文件重命名",
        en: "Rename file",
        kr: "파일 이름 변경"
    };
    static WORD65abf33c = {
        cn: "保存",
        en: "Save",
        kr: "저장"
    };
    static WORD0f8908c2 = {
        cn: "重命名的名字不能为空或者全空格",
        en: "The new name could not be blank or all blank spaces",
        kr: "새 이름은 비워둘 수 없습니다."
    };
    static WORDb1ed364e = {
        cn: "重命名文件：",
        en: "Rename file: ",
        kr: "파일 이름 변경:"
    };
    static WORD4d511f71 = {
        cn: "长度为",
        en: "The length is ",
        kr: "길이는"
    };
    static WORD1b35951f = {
        cn: "重命名成功",
        en: "Successfully renamed",
        kr: "이름이 성공적으로 변경되었습니다."
    };
    static DirAllFiles = {
        cn: "所有文件",
        en: "All files",
        kr: "모든 파일"
    };
    static DirFolders = {
        cn: "文件夹",
        en: "Folders",
        kr: "폴더"
    };
    static DirImages = {
        cn: "图片",
        en: "Images",
        kr: "이미지"
    };
    static DirVideos = {
        cn: "视频",
        en: "Videos",
        kr: "비디오"
    };
    static DirMusics = {
        cn: "音乐",
        en: "Musics",
        kr: "뮤직"
    };
    static DirDocuments = {
        cn: "文档",
        en: "Documents",
        kr: "문서"
    };
    static WORD197e3ad4 = {
        cn: "选择了文件夹，进入文件夹",
        en: "Folder selected, enter the folder",
        kr: "폴더 선택, 폴더 열기"
    };
    static WORD74355603 = {
        cn: "选择了文件，打开文件",
        en: "File selected, open the file",
        kr: "파일 선택, 파일 열기"
    };
    static WORDTestLen={
        cn:"文件名长度不能超过60个字符",
        en:"The folder name could not contain more than 60 characters",
        kr:"파일 이름은 60자 이내로 설정해 주십시오."
    };
    static WORDTestTxt={
        cn:"文件名不能包含\\／|*？<>等特殊字符",
        en:"The folder name could not contain special characters such as\\／|*？<>",
        kr:"파일 이름에는 특수기호 \\／|*？<>등을 사용할 수 없습니다. "
    };
    ////src/pages/login/login.ts////
    static WORDa33756a9 = {
        cn: "用户名不能为空",
        en: "The username could not be blank",
        kr: "사용자 이름은 비워둘 수 없습니다."
    };
    static WORD7b2271a4 = {
        cn: "请输入正确的用户名",
        en: "Enter a valid username",
        kr: "올바른 사용자 이름을 입력하십시오."
    };
    static WORDf3223de8 = {
        cn: "用户确认注册,",
        en: "The user confirmed registration",
        kr: "사용자 등록 확인"
    };
    static WORD43f60387 = {
        cn: "用户名验证不通过",
        en: "Failed to pass username verification",
        kr: "사용자 이름이 확인되지 않았습니다."
    };
    static WORD74a945cf = {
        cn: "密码为空，验证不通过",
        en: "Failed to pass verification. The password is blank",
        kr: "비밀번호가 비어 있습니다. 인증에 실패했습니다."
    };
    static WORD758b56bc = {
        cn: "密码不能为空",
        en: "The password could not be blank",
        kr: "비밀번호는 비워 둘 수 없습니다."
    };
    static WORD357d4a38 = {
        cn: "参数校验通过，开始登录设备",
        en: "Pass parameters examination. Log in box. ",
        kr: "매개 변수 인증에 성공하였습니다. 디바이스에 로그인 시작합니다."
    };
    static WORDa577165a = {
        cn: "已选择设备，查看绑定情况",
        en: "Selected box, check binding condition",
        kr: "디바이스가 선택 됨, 바인딩 상태 확인"
    };
    static WORDf929c519 = {
        cn: "设备已绑定用户，此时直接登录设备",
        en: "The box is already bound. You could login box directly",
        kr: "디바이스가 이미 바인드 되었습니다. 바로 로그인할 수 있습니다."
    };
    static WORD6a562d32 = {
        cn: "前往注册",
        en: "Go to registration",
        kr: "바로 등록하기"
    };
    ////src/pages/mining/mining.ts////
    static WORDe3003c0f = {
        cn: "检测登录态",
        en: "Check login status",
        kr: "로그인 상태 확인"
    };
    static WORD12d44a89 = {
        cn: "用户已登录中心，查询box信息",
        en: "The user has logged into the center. Check Ubbey Box's information",
        kr: "사용자가 이미 로그인했습니다. 디바이스 정보를 확인하십시오."
    };
    static WORD37e1ca29 = {
        cn: "已登录",
        en: "Logged in",
        kr: "로그인 되었습니다."
    };
    static WORD3a536642 = {
        cn: "开启挖矿必须先配置挖矿收益地址",
        en: "You must set up reward recipient's address before mining",
        kr: "마이닝 시작 전에 수익을 수령할 주소를 설정해야 합니다."
    };
    static WORDb5025769 = {
        cn: "自动更新数据，无需触发",
        en: "Automatically updated data",
        kr: "자동으로 업데이트 할 수 있습니다."
    };
    static WORD7f07438e = {
        cn: "用户切换了mining状态:",
        en: "The user switches to mining status: ",
        kr: "사용자가 마이닝 상태로 전환:"
    };
    static WORD96cad532 = {
        cn: "您已开启挖矿模式",
        en: "You have activated mining mode",
        kr: "이미 마이닝 모드가 활성화 되었습니다." 
    };
    static WORDe716466c = {
        cn: "挖矿收益按天结算，每月末自动发放。您将贡献100G存储空间用于挖矿，点击「挖矿配置」更改此配置",
        en: "The mining rewards is settled on a daily basis and is automatically issued at the end of each month. You will contribute 100G of storage space for mining, click 'mining configuration' to change this configuration", 
        kr: "마이닝보상은 매일 결제되며 매월 말에 자동으로 지급됩니다. 마이닝에 100G의 저장 공간을 기여하기 위한 설정으로 변경하려면 '마이닝 설정'을 클릭하십시오."
    };
    static WORD9916edcb = {
        cn: "暂不更改",
        en: "Do not change for now",
        kr: "지금은 변경하지 않음"
    };
    static WORD899d5535 = {
        cn: "挖矿配置",
        en: "Mining setting",
        kr: "마이닝 설정"
    };
    static WORDb3bb7d1a = {
        cn: "您已关闭挖矿模式",
        en: "You have turned off the mining mode",
        kr: "마이닝 모드를 닫았습니다."
    };
    static WORD7a920180 = {
        cn: "关闭挖矿后您的设备无需再贡献带宽和存储资源，亦不会得到挖矿收益",
        en: "If you choose to stop mining, your Ubbey Box will no longer contribute storage space and network resource. You will no longer receive mining reward",
        kr: "마이닝을 중단한 디바이스는 더 이상 스토리지 공간과 네트워크 리소스에 기여하지 않을 뿐만 아니라 마이닝 수익도 받을 수 없습니다."
    };
    static WORD6b92f0b5 = {
        cn: "用户已选择设备，此时可以更改挖矿设置",
        en: "The user has selected Ubbey Box, and could change mining setting now",
        kr: "사용자가 이미 디바이스를 선택했으며 바로 마이닝 설정을 변경할 수 있습니다."
    };
    static WORDcd93951c = {
        cn: "用户没有选择设备，此时无法更改挖矿设置",
        en: "The user haven't selected any Ubbey Box, and couldn't change mining setting now",
        kr: "사용자가 디바이스를 선택하지 않아 마이닝 설정을 변경할 수 없습니다."
    };
    static WORD99645c33 = {
        cn: "您当前尚未连接到设备，无法配置挖矿信息",
        en: "You have not connected to any Ubbey Box, unable to pair mining information",
        kr: "연결된 디바이스가 없으므로 마이닝 정보를 제공할 수 없습니다."
    };
    static WORDc9659c05 = {
        cn: "您可以尝试去搜索网络内的设备",
        en: "You could try to search the box in the network",
        kr: "네트워크 내의 디바이스를 검색할 수 있습니다."
    };
    static WORD93ea7a8b = {
        cn: "暂不配置",
        en: "Do not set up",
        kr: "지금은 설정 안 함"
    };
    static WORD915026f0 = {
        cn: "用户选择了设备",
        en: "The user has selected a Ubbey Box",
        kr: "사용자가 디바이스를 선택했습니다."
    };
    static WORD8d840479 = {
        cn: "昨日日期为",
        en: "Yesterday's date is ",
        kr: "어제의 날짜는 "
    };
    static WORDe5521c1b = {
        cn: "即将设置挖矿信息",
        en: "You are going to pair mining information",
        kr: "마이닝 정보를 설정하겠습니다."
    };
    static WORD964606f4 = {
        cn: "进入挖矿页面",
        en: "Enter mining page",
        kr: "마이닝 페이지에 들어가기"
    };
    ////src/pages/mining-list/mining-list.ts////
    ////src/pages/mining-setting/mining-setting.ts////
    static WORD5e6d7a09 = {
        cn: "您的挖矿设置已配置成功",
        en: "The mining setting was successfully set up",
        kr: "마이닝 설정이 성공적으로 완료되었습니다."
    };
    static WORD69e5e22b = {
        cn: "更新设备数据",
        en: "Update Ubbey Box data",
        kr: "디바이스의 데이터 업데이트"
    };
    static WORD6c8721b1 = {
        cn: "已选择设备",
        en: "Ubbey Box selected ",
        kr: "디바이스가 선택됨"
    };
    static WORD83fddc65 = {
        cn: "您当前尚未连接到设备，无法更改挖矿配置",
        en: "You haven't connected to any Ubbey Box, cannot change mining setting",
        kr: "연결된 디바이스가 없으므로 마이닝 설정을 변경할 수 없습니다."
    };
    ////src/pages/register/register.ts////
    static WORD4c5a6a38 = {
        cn: "密码md5:",
        en: "Passwordmd5:",
        kr: "비밀번호md5"
    };
    static WORDd2f6ca9b = {
        cn: "您尚未同意服务及隐私条款",
        en: "You haven't agreed to the Terms of Service and Privacy Policy.",
        kr: "서비스 약관 및 개인정보 보호정책에 동의하지 않았습니다."
    };
    static WORDdb2732a2 = {
        cn: "参数校验通过，获取验证码",
        en: "Pass parameter verification. Receive verification code",
        kr: "매개 변수 검증을 통과하였습니다. 인증코드 받기"
    };
    static WORD9a251537 = {
        cn: "用户提交的是重置密码请求",
        en: "The user submit a request to reset password ",
        kr: "사용자가 비밀번호 재설정 요청을 제출하였습니다."
    };
    static WORDed9fee92 = {
        cn: "如果用户名绑定的设备不在线，此时无法忘记密码",
        en: "If user's binding device is not online, user could not change password",
        kr: "사용자가 바인딩한 디바이스가 온라인 상태가 아니면 비밀번호를 변경할 수 없습니다."
    };
    static WORD3fed4555 = {
        cn: "当前用户名的hash：",
        en: "Current user's hash:",
        kr: "현재 사용자 해시"
    };
    static WORDd79d257e = {
        cn: "设备hash:",
        en: "Ubbey Box’s hash:",
        kr: "디바이스의 해시"
    };
    static WORD46eeafa3 = {
        cn: "设备在线，直接获取验证码",
        en: "The Ubbey Box is online. You could choose to acquire verification code directly",
        kr: "디바이스가 온라인 상태입니다. 인증코드를 직접 획득하도록 선택할 수 있습니다."
    };
    static WORDa25b8545 = {
        cn: "该账号绑定的设备暂不在线，请检查设备开机和网络状态",
        en: "Your binding Ubbey Box is not online. Please check the network and power status",
        kr: "바인딩 Ubey Box가 온라인 상태가 아닙니다. 네트워크 및 전원 상태를 확인하십시오. "
    };
    ////src/pages/reset-passwd/reset-passwd.ts////
    ////src/pages/result/result.ts////
    static WORD4f3797b0 = {
        cn: "找回密码成功",
        en: "Successfully retrieve the password",
        kr: "비밀번호 재설정이 성공적으로 완료됨"
    };
    static WORD381beeb5 = {
        cn: "账户注册成功",
        en: "Successfully registered",
        kr: "회원가입 성공"
    };
    static WORD2cb40779 = {
        cn: "前往首页",
        en: "Go to Home page",
        kr: "홈으로 이동"
    };
    static WORD9e182b17 = {
        cn: "绑定设备成功",
        en: "Successfully bound",
        kr: "성공적으로 바인딩 되었습니다."
    };
    static WORD9853ada1 = {
        cn: "业务类型为重置密码，即将前往登录页",
        en: "Reset password. Redirecting to home page now.",
        kr: "비밀번호 재설정을 요청하였습니다. 지금 홈 페이지로 이동중입니다."
    };
////src/pages/tabs/tabs.ts////
////src/pages/user/user.ts////
    static WORD0e77bf3e = {
        cn: "连接设备后方可查看钱包信息",
        en: "You could check wallet information after connecting to Ubbey Box",
        kr: "디바이스에 연결 후 지갑 정보를 확인할 수 있습니다."
    };
    static WORDce7b4940 = {
        cn: "连接设备后方可进行设备管理",
        en: "You could manage device after connecting to Ubbey Box",
        kr: "디바이스에 연결 후 디바이스를 관리할 수 있습니다."
    };
    static WORDb38ae5d2 = {
        cn: "连接设备后方可修改密码",
        en: "You will be able to change password after connecting to Ubbey Box",
        kr: " Ubbey Box에 연결한 후 암호를 변경할 수 있습니다. "
    };
    static WORD73de1e81 = {
        cn: "您当前已经是最新版了",
        en: "This is the most updated version",
        kr: "최신 버전입니다."
    };
    static WORDcda6aa4e = {
        cn: "更新已加载",
        en: "Updates loaded",
        kr: "업데이트가 로드됨"
    };
    static WORD997457d4 = {
        cn: "App升级",
        en: "App updating",
        kr: "앱 업데이트"
    };
    static WORDebb0158d = {
        cn: "检测到新版本，点击确定立即更新",
        en: "Detecting a new version. Please click confirm to update.",
        kr: "업데이트 가능한 버전이 있습니다.클릭하여 새 버전으로 업데이트 하시기 바랍니다."
    };
    static WORD2262cc07 = {
        cn: "请求更新资源:",
        en: "Request to update resource",
        kr: "리소스 업데이트 요청"
    };
    static updateDetected = {
        cn: "检查到可升级的固件版本",
        en: "Firmware system updates available.",
        kr: "업그레이드 가능한 펌웨어 버전이 확인됨"
    };
    static updateTips = {
        cn: "您的固件版本可升级至${New}",
        en: "You can now update to ${New} version.",
        kr: "펌웨어 버전${New}(으)로 업그레이드할 수 있습니다."
    };    
    static romUpdatingTips = {
        cn: "固件正在升级中...",
        en: "Firmware system updating...",
        kr: "펌웨어 업데이트하는 중입니다."
    };    
    static uploadFinished = {
        cn: "固件升级成功！",
        en: "Firmware system has been updated successfully.",
        kr: "펌웨어 업그레이드 성공!"
    };    
    static updateRomError = {
        cn: "固件升级失败，请检查网络设置",
        en: "Firmware system updates failed, please check the network settings. ",
        kr: "펌웨어 업그레이드에 실패했습니다. 네트워크 설정을 확인하십시오"
    };    
    static NewestVersion = {
        cn: "您的当前固件版本是最新版本",
        en: "The current firmware system is the latest version.",
        kr: "최신 펌웨어 버전"
    };    
    static getRomUpdate = {
        cn: "正在检测固件更新...",
        en: "Checking for firmware system updates...",
        kr: "펌웨어 업데이트 확인 중..."
    };
    static WORD51452558 = {
        cn: "正在为您加载更新",
        en: "Updates loading ",
        kr: "업데이트 로딩"
    };
    static WORD79e4bc03 = {
        cn: "退出登录",
        en: "Sign out",
        kr: "로그아웃"
    };
    static WORDf6cdb0fc = {
        cn: "您将退出登录",
        en: "You are going to sign out",
        kr: "곧 로그아웃 됩니다."
    };
    static WORD64595209 = {
        cn: "您已成功退出登录！",
        en: "Successfully signed out",
        kr: "성공적으로 로그아웃 됨"
    };
    static WORD5980d11a = {
        cn: "退出设备",
        en: "Ubbey Box log out",
        kr: "디바이스로부터 로그아웃"
    };
////src/pages/verify-email/verify-email.ts////
    static WORD6631dd91 = {
        cn: "重新获取验证码",
        en: "Reacquire verification code",
        kr: "인증코드 다시 불러오기"
    };
    static WORD58225f33 = {
        cn: "注册成功，检测是否已经绑定；如果已经绑定，则提示用户登录；否则，自动绑定",
        en: "Successfully registered, please check whether your account is bound. If it is bound, remind user to login. Otherwise, bind automatically",
        kr: "등록이 완료되었습니다. 계정이 바인딩 되어 있는지 확인하십시오. 바인딩 되어 있는 경우 사용자에게 로그인을 알립니다. 그렇지 않으면 자동으로 바인딩 됩니다."
    };
    static WORD612ce400 = {
        cn: "获取设备信息错误！",
        en: "Error occurred acquiring Ubbey Box information ",
        kr: "디바이스 정보를 불러오는 동안 오류가 발생했습니다."
    };
    static WORDea9cca85 = {
        cn: "您未登录设备，不可修改密码",
        en: "You haven't logged into Ubbey Box,  unable to change password",
        kr: "디바이스에 로그인하지 않았으므로 비밀번호를 변경할 수 없습니다."
    };
    static WORD5b319f51 = {
        cn: "已绑定设备，需向设备发送请求",
        en: "You have bound to a Ubbey Box. Send request to the box.",
        kr: "이미 디바이스에 바이딩 되었습니다. 디바이스에 요청을 보내야 합니다."
    };
    static WORD5d02b310 = {
        cn: "设备未绑定账户，可以直接重设",
        en: "The Ubbey Box has not bound to any account. Reset directly",
        kr: "디바이스에 어떤 계정에도 바이딩 되어있지 않습니다. 직접 재설정 할 수 있습니다."
    };
    static WORDe7824893 = {
        cn: "重设密码失败",
        en: "Failed to reset password",
        kr: "비밀번호 재설정에 실패했습니다. "
    };
    static WORDe672dfc3 = {
        cn: "设备重新设置密码返回错误",
        en: "Error occurred during resetting password",
        kr: "비밀번호 재설정 중 오류가 발생했습니다."
    };
    static WORDceae2f3a = {
        cn: "密码修改成功",
        en: "Successfully changed",
        kr: "비밀번호가 성공적으로 변경되었습니다."
    };
    static WORD8cb9d4ce = {
        cn: "恭喜您注册成功！",
        en: "Congratulations! You have registered succesfully!",
        kr: "축하합니다! 등록되었습니다!"
    };
    static WORD081c3435 = {
        cn: "请点击确定回到登录页，使用",
        en: "Please click confirm to go back to login page, use",
        kr: "로그인 페이지로 돌아가려면 확인을 클릭하십시오."
    };
    static WORD7d79a22f = {
        cn: "进行登录",
        en: "Login",
        kr: "로그인"
    };
    static WORD20eddadd = {
        cn: "去登录",
        en: "Go to login",
        kr: "로그인 페이지로 이동"
    };
    static WORD6cccaf8c = {
        cn: "绑定提示",
        en: "Binding reminder",
        kr: "바인딩 알림"
    };
    static WORD8abef29c = {
        cn: "新用户注册成功，但该设备已绑定，设备解绑前无法绑定其他用户",
        en: "Successfully registered. The device has been bound. Please unbind the device before binding to a new account.",
        kr: "성공적으로 등록되었습니다. 장치가 바인딩되었습니다. 새 계정에 바인딩하기 전에 장치의 잠금을 해제하십시오."
    };
    static WORDa54ee54e = {
        cn: "前往登录",
        en: "Go to login",
        kr: "로그인 페이지로 이동"
    };
    static WORD4a8bf19f = {
        cn: "重新扫描设备",
        en: "Scan device again",
        kr: "디바이스 다시 스캔"
    };
    static WORD92f2a1ae = {
        cn: "验证码已重新发发送",
        en: "The verification code has been sent again",
        kr: "인증코드가 다시 발송되었습니다. "
    };
////src/pages/wallet-coinbase/wallet-coinbase.ts////
    static WORDdd409967 = {
        cn: "未知",
        en: "Unknown",
        kr: "알 수 없음"
    };
    static WORD59abf580 = {
        cn: "请选择一个钱包作为挖矿收益地址",
        en: "Please select a wallet as mining reward recipient address",
        kr: "마이닝 수익을 받을 지갑 주소를 선택하십시오."
    };
    static WORD6c50c226 = {
        cn: "挖矿收益地址设置成功！",
        en: "Successfully set mining reward recipient address",
        kr: "마이닝 수익을 받을 주소가 설정되었습니다. "
    };
////src/pages/wallet-generator/wallet-generator.ts////
    static WalletNameMustNotBeEmpty = {
        cn: "钱包名字不能为空",
        en: "The wallet name could not be blank",
        kr: "지갑 이름은 비워둘 수 없습니다. "
    };
    static WORD97e2a1c5 = {
        cn: "钱包创建成功",
        en: "Created wallet successfully",
        kr: "지갑이 성공적으로 생성되었습니다. "
    };
////src/pages/wallet-import/wallet-import.ts////
    static WORD3ac2fca4 = {
        cn: "从剪贴板中获取了keystore信息，请确认并核对",
        en: "Acquire Keystore information from clipboard. Please confirm.",
        kr: "클립보드에서 keystore 정보를 복사하여 붙여 넣었습니다. 정보가 올바른지 다시 확인하십시오. "
    };
    static WORD056ef792 = {
        cn: "未解析到钱包地址",
        en: "Unable to decrypt wallet address",
        kr: "지갑 주소를 해독할 수 없습니다. "
    };
    static WORDafafb9f2 = {
        cn: "请输入keystore内容，或通过二维码扫描钱包自动填充",
        en: "Enter Keystore content, or autofill through scanning generated wallet's QR code.",
        kr: "keystore 내용을 입력하거나, 생성된 지갑의 QR코드를 스캔하여 자동으로 채우기를 수행하십시오."
    };
    static WORD1bf131ff = {
        cn: "请输入合法的keystore内容",
        en: "Enter valid Keystore content",
        kr: "올바른 keystore 컨텐츠를 입력하십시오. "
    };
    static WORD388fa919 = {
        cn: "导入钱包",
        en: "Import",
        kr: "지갑 불러오기"
    };
    static WORDcd95217b = {
        cn: "钱包导入成功!",
        en: "Successfully imported",
        kr: "지갑 불러오기 성공 "
    };
////src/pages/wallet-info/wallet-info.ts////
    static WORDcaf794fb = {
        cn: "修改钱包",
        en: "Change wallet",
        kr: "지갑 변경"
    };
    static WORD34cc33e1 = {
        cn: "的名字",
        en: "'s name",
        kr: "의 이름"
    };
    static WORDad57fb8a = {
        cn: "Keystore文件导出成功",
        en: "Successfully exported",
        kr: "내보내기 성공"
    };
    static WORD18fc4843 = {
        cn: "无法删除钱包",
        en: "Unable to delete the wallet",
        kr: "지갑을 삭제할 수 없습니다. "
    };
    static WORD256b8339 = {
        cn: "该钱包目前正在接收挖矿收益，请不要删除钱包",
        en: "This wallet is receiving mining rewards. Please do not delete the wallet",
        kr: "이 지갑은 마이닝 수익을 받고 있습니다. 지갑을 삭제하지 마십시오. "
    };
    static WORDed3a93fd = {
        cn: "您确定要删除该钱包吗？",
        en: "Sure to delete this wallet?",
        kr: "이 지갑을 정말 삭제하겠습니까?"
    };
    static WORD702c7fa6 = {
        cn: "钱包删除后不可恢复，请确保您已备份该钱包",
        en: "The wallet is unable to be restored after deleting. Please make sure you have back up this wallet",
        kr: "지갑 삭제 후에는 다시 복구할 수 없습니다. 이 지갑이 백업 되었는지 다시 확인해 주십시오."
    };
    static WORD5f9bdeda = {
        cn: "钱包删除成功",
        en: "Successfully deleted",
        kr: "지갑이 성공적으로 삭제되었습니다. "
    };
////src/pages/wallet-name-modify/wallet-name-modify.ts////
    static WORD745522b1 = {
        cn: "钱包名称不能为空或全空格",
        en: "Wallet's name could not be blank",
        kr: "지갑 이름은 비워둘 수 없습니다. "
    };
    static WORDa638f828 = {
        cn: "钱包名字修改成功",
        en: "Successfully changed",
        kr: "지갑 이름이 성공적으로 변경되었습니다."
    };
////src/pages//task-list/task-list.html////
    static WORD9d749424 = {
        cn: "任务管理",
        en: "Mission control",
        kr: "미션 컨트롤"
    };
    static WORD64e13621 = {
        cn: "进行中",
        en: "In progress",
        kr: "진행 중"
    };
    static WORD02a388a9 = {
        cn: "已中断",
        en: "Disconnected",
        kr: "연결 끊김"
    };
    static WORD3c80409a = {
        cn: "已完成",
        en: "Completed",
        kr: "완료"
    };
    static WORD2a006785 = {
        cn: "清空",
        en: "Clear",
        kr: "클리어"
    };
    static WORDab54d4e8 = {
        cn: "上传位置",
        en: "Upload location",
        kr: "업로드 위치"
    };
    static WORD0c97002a = {
        cn: "下载位置",
        en: "Download location",
        kr: "다운로드 위치"
    };
    static PAUSED = {
        cn: "已暂停",
        en: "Paused",
        kr: "중지 됨"
    };
    static WAITING = {
        cn: "等待中",
        en: "Waiting",
        kr: "대기중"
    };
    static ALLSTART = {
        cn: "开始",
        en: "Start",
        kr: "시작"
    };
    static ALLPAUSE = {
        cn: "暂停",
        en: "Pause",
        kr: "일시 중지"
    };
////src/pages//task-list/task-list.ts////
    static WORD37d9a2fb = {
        cn: "清空任务记录",
        en: "Are you sure to delete all tasks?",
        kr: "모든 작업을 삭제하겠습니까?"
    };
    static WORDf01a8be6 = {
        cn: "任务记录清空后将无法恢复，是否清空？",
        en: "The tasks list could not be restored after deleting？",
        kr: "태스크 목록 삭제 후 다시 복구할 수 없습니다. 정말 삭제 하겠습니까? "
    };
    ////src/pages//list/list.ts////
    static WORDfac98084 = {
        cn: "部分文件正在下载队列中",
        en: "Some files are in downloading list",
        kr: "일부 파일이 다운로드 목록에 있습니다. "
    };
    ////src/components//device/device.html////
    static WORD89462053 = {
        cn: "Ubbey Box(未连接)",
        en: "",
        kr: ""
    };
    static UbbeyBoxNotBind = {
        cn: "Ubbey Box(未绑定)",
        en: "",
        kr: ""
    };

    static REMOTE_CONNECT = {
        cn: "远程登录中，部分功能受限",
        en: "Limited functions during remote login",
        kr: "원격 로그인 중이여서 일부 기능이 제한될 수 있습니다. "
    };
    static WORD5e53c092 = {
        cn: "您当前尚未连接到网络",
        en: "You haven’t connected to the network",
        kr: "네트워크에 연결되지 않았습니다. "
    };
    static WORD8cabdefd = {
        cn: "请插入硬盘",
        en: "Please insert disk",
        kr: "디스크를 넣으십시오. "
    };
    ////src/components//add-file/add-file.html////
    static WORD6f79290c = {
        cn: "添加内容至",
        en: "Add contents to ",
        kr: "내용 추가"
    };
    static WORD789efc55 = {
        cn: "剩余可用空间",
        en: "Available storage ",
        kr: "사용 가능한 스토리지 "
    };
    static UploadFileFailed = {
        cn: "文件${filename}上传失败",
        en: "Failed to upload file ${filename}",
        kr: "${filename}파일 업로드 실패"
    };
    static WORD80e433b7 = {
        cn:"正在为您上传${filename}...",
        en:"File ${filename} is uploading...",
        kr:"업로드중…{filename}…"

    };
    static FileUploading = {
        cn: '正在上传文件...'
    }
    static UploadFileNotExist = {
        cn: "文件${filename}上传失败",
        en: "${filename} upload failed",
        kr: "${filename}파일 업로드 실패"
    };    

    static DownloadFileNotExist = {
        cn: "文件${filename}下载失败",
        en: "The file ${filename} is failed to download",
        kr: "파일${filename}다운로드 실패"
    };
    static UploadFileToBoxSuccess = {
        cn: "文件${filename}已成功上传至设备的「${path}」目录",
        en: "The file ${filename} is successfully uploaded to Ubbey Box「${path}」catalogue",
        kr: "${filename}파일이 성공적으로 디바이스「${path}」카탈로그에 업로드 되었습니다."
    };
    static DownloadFileToBoxSuccess = {
        cn: "文件${filename}已成功下载至手机",
        en: "The file ${filename} is successfully downloaded to your phone",
        kr: "파일${filename}이 성공적으로 휴대기기에 다운로드 되었습니다."
    };
    ////src/app/app.component.ts////
    static WORDce5f6618 = {
        cn: "设置",
        en: "Setting",
        kr: "설정"
    };
    static WORDd96d26cb = {
        cn: "好",
        en: "OK",
        kr: "확인"
    };
    static PlsCheckNetwork = {
        cn: "请检查您的网络连接，或者进入\"设置\"中允许\"Ubbey\"访问网络数据",
        en: "Please check your network, or allow \"Ubbey\" to access network in settings",
        kr: "인터넷 연결 상태를 확인하거나 설정에서 \"Ubbey\"가 네트워크 데이트에 액세스 할 수 있도록 허용하십시오. "
    };
    static NoTask = {
        cn:"您还没有创建过上传/下载任务",
        en:"You have not created any upload/download task yet.",
        kr:"업로드 작업 / 다운로드 작업이 아직 설정되지 않았습니다."
    };
    static WORD94864389 = {
        cn: "网络连接出了问题",
        en: "Error occurred during internet connection",
        kr: "인터넷 연결 중 오류가 발생했습니다. "
    };
    ////src/components//add-file/add-file.ts////
    static WORD7c5e25c1 = {
        cn: "创建文件夹",
        en: "Create folder",
        kr: "폴더 생성"
    };
    static WORD18239a0a = {
        cn: "请输入您要创建的文件夹名字",
        en: "Enter folder name",
        kr: "폴더 이름을 입력하십시오."
    };
    static WORD5466a2d3 = {
        cn: "请输入您想设定的文件夹名字",
        en: "Enter folder name",
        kr: "폴더 이름을 입력하십시오."
    };
    static WORD284e3541 = {
        cn: "文件夹名称不能为空或全空格",
        en: "The folder name could not be blank",
        kr: "폴더 이름은 비워둘 수 없습니다."
    };
    static WORD3eca2610 = {
        cn: "文件夹创建成功",
        en: "Successfully created folder",
        kr: "폴더 생성 성공"
    };
    ////src/pages/about-device/about-device.ts////
    static WORD2497f41e = {
        cn: "配置挖矿钱包收益地址后，才能得到挖矿收益。收益地址和挖矿设置均可在「挖矿设置」中自由更改。",
        en: "You could earn reward only after setting up reward recipient's wallet address. You could change recipient's address in「Mining Setting」",
        kr: "보상 받는 사람의 지갑 주소를 설정한 후에만 보상을 받을 수 있습니다. \"마이닝 설정\"에서 수신인의 주소를 변경할 수 있습니다."
    };
    static WORD2cd228b9 = {
        cn: "不要收益",
        en: "No reward",
        kr: "수익 없음"
    };
    static WORD3f7ecdab = {
        cn: "配置钱包",
        en: "Set up wallet",
        kr: "지갑 설정"
    };
    static WORDcf8f0771 = {
        cn: "该功能正在开发中，敬请期待",
        en: "The function is under development. Coming Soon.",
        kr: "해당 기능은 개발 중입니다. 오픈 예정입니다.;"
    };
    //引导页
    static Guidance1 = {
        cn: "私有云",
        en: "Exclusive Personal Cloud",
        kr: "퍼스널 클라우드"
    }
    static Guidance2 = {
        cn: "随时随地",
        en: "Save life moments anytime and anywhere",
        kr: "언제 어디서나 자유롭게 당신의 모멘트를 저장 하십시오."
    }
    static Guidance3 = {
        cn: "分享备用存储",
        en: "Share Spare Storage",
        kr: "Share Spare Storage"
    }
    static Guidance4 = {
        cn: "通过采矿赚取UBBEY币",
        en: "Earn UBBEY token through mining",
        kr: "마이닝을 통해 UBBEY를 획득하십시오."
    }
    static Guidance5 = {
        cn: "数字资产安全",
        en: "Digital Asset Security",
        kr: "디지털 자산에 대한 보안"
    }
    static Guidance6 = {
        cn: "一个更安全的存储系统：非云存储",
        en: "A safer storage system: non-cloud storage",
        kr: "보다 안전한 스토리지 시스템입니다. 클라우드 스토리지가 아닙니다."
    }
    
    static GuidanceBtn = {
        cn: "马上体验",
        en: "Experience Now",
        kr: "바로 체험하기"
    }
    //agreement
    static AgreementTitle = {
        cn: "服务协议",
        en: "The Terms of Service",
        kr: "서비스 약관"
    }
    static PrivacyPolicyTitle = {
        cn: "隐私协议",
        en: "Privacy Policy",
        kr: "개인정보 보호정책"
    }
    //
    static SystemFileError = {
        cn:'系统无法打开该文件类型',
        en:'The system is unable to open this type of file.',
        kr:'시스템에서 해당 파일 형식을 열 수 없습니다.'
    }
    static CoinUint = {
        cn: "货币单位",
        en: "Currency",
        kr: "화폐단위"
    };
    static System = {
        cn: "系统设置",
        en: "System setting",
        kr: "시스템 설정"
    };    
    static WalletSetting = {
        cn: "钱包设置",
        en: "Wallet setting",
        kr: "지갑 설정"
    };
    static ExportKeystore = {
        cn: "导出Keystore",
        en: "Export Keystore",
        kr: "Keystore 불러오기"
    };
    static AvailableBalance = {
        cn: "可用余额",
        en: "Available balance",
        kr: "사용가능한 잔액"
    };
    ////./wallet-detail/wallet-detail.html////
    static wallatPullingText = {
        cn: "松开立即同步钱包信息",
        en: "Release to see wallet updates",
        kr: "지갑 업데이트를 보려면 릴리스하십시오. "
    };
    static wallatRefreshingText = {
        cn: "正在同步区块链…",
        en: "Synchronizing with blockchain…",
        kr: "블록체인과 동기화 중..."
    };
    static TotalValue = {
        cn: "总市值",
        en: "Total value",
        kr: "시가총액"
    };
    static TotalAssets = {
        cn: "总资产",
        en: "Total assets",
        kr: "총 자산"
    };
    static CumulativeDig = {
        cn: "累计挖矿",
        en: "Mining income",
        kr: "누적 마이닝"
    };
    static RecentTransactionRecords = {
        cn: "最近交易记录",
        en: "Recent transactions",
        kr: "최근 거래기록"
    };
    static NoMoreData = {
        cn: "没有更多数据了",
        en: "No more data",
        kr: "데이터가 더는 없습니다."
    };
    static Collection = {
        cn: "收款",
        en: "Receive",
        kr: "입금"
    };
    static Transfer = {
        cn: "转账",
        en: "Send",
        kr: "출금"
    };
    ////./coin-get/coin-get.html////
    static ClickCopy = {
        cn: "点击复制",
        en: "Copy wallet address",
        kr: "복사 버튼 클릭"
    };
    static ReceivableAssets = {
        cn: "可接收资产",
        en: "Available Assets",
        kr: "입금 가능한 자산"
    };
    static CopySucceed = {
        cn: "复制成功",
        en: "Copied",
        kr: "복사 성공"
    };
    ////./coin-send/coin-send.html////
    static EnterAddress = {
        cn: "输入收款钱包地址",
        en: "Receiver's address",
        kr: "입금주소를 입력하십시오."
    };
    static EnterAddressPrompt = {
        cn: "转账前请确认收款钱包地址无误。",
        en: "Please confirm the receiver's address.",
        kr: "출금 하기 전에 꼭 지갑주소를 확인해 주세요."
    };
    static TransferAmount = {
        cn: "转账金额",
        en: "Amount",
        kr: "출금금액"
    };
    static AllTurnOut = {
        cn: "全部转出",
        en: "Send all",
        kr: "모두 출금"
    };
    static InputFullAmount = {
        cn: "请输入转帐金额",
        en: "Enter the transfer amount",
        kr: "이체 하실 금액을 입력해주세요."
    };
    static MinersFee = {
        cn: "矿工费",
        en: "Mining fee",
        kr: "수수료"
    };
    static TransferSlow = {
        cn: "转账慢",
        en: "Slow",
        kr: "출금속도가 느립니다."
    };
    static TransferFast = {
        cn: "转账快",
        en: "Fast",
        kr: "출금속도가 빠릅니다."
    };
    static TransferPrompt = {
        cn: "为了保证转账成功，请确保钱包内拥有足额ETH支付矿工费",
        en: "To ensure a successful transfer, please make sure you have enough ETH to pay for mining fee ",
        kr: "성공적인 출금을 위하여 지갑에 출금수수료 지불에 충분한 이더리움 잔고가 있는지 확인해주시기 바랍니다.  "
    };
    static Next = {
        cn: "下一步",
        en: "Next",
        kr: "다음단계"
    };
    static About = {
        cn: "≈",
        en: "≈",
        kr: "≈"
    };
    ////./coin-transaction/coin-transaction.html////
    static TransactionRecords = {
        cn: "交易记录",
        en: "Transaction record",
        kr: "거래기록"
    };
    static CollectionAddress = {
        cn: "收款地址",
        en: "To",
        kr: "입금주소"
    };
    static TurnsOutAddress = {
        cn: "转出地址",
        en: "From",
        kr: "출금주소"
    };
    static TransactionNumber = {
        cn: "交易单号",
        en: "Transaction #",
        kr: "트렌젝션넘버"
    };
    static TransactionTime = {
        cn: "交易时间",
        en: "Transaction Time",
        kr: "거래시간"
    }; 
    //notice
    static NoticeList = {
        cn:'消息',
        en:'Messages',
        kr:'알림'
    }
    static NoticeDetail = {
        cn:'消息详情',
        en:'Message Details',
        kr:'알림 상세내용'
    }
    static NoticeDefault = {
        cn:'您还没有消息记录',
        en:'No Message ',
        kr:'알림 내용이 없습니다.'
    }
    static SystemNotice = {
        cn:'系统通知',
        en:'Notifications',
        kr:'시스템 공지'
    }
    static ActiveNotice = {
        cn:'活动通知',
        en:'Activity Notifications',
        kr:'활동 공지'
    }
    //转账相关
    static ChangePayPassword = {
        cn: "修改支付密码",
        en: "Change Payment Password",
        kr: "결제 비밀번호 변경"
    }
    static PayPasswordFunction = {
        cn: "支付密码用于保护私钥和交易授权，强度非常重要。Ulabs不存储密码，也无法帮您找回，请务必牢记",
        en: "Payment password is used to protect private key and authorizing transactions. Ulabs will not store or retrieve password, please keep your password safely.",
        kr: "결제 비밀번호는 private key와 거래승인을 보호하기 위한 것으로써 보안강도가 중요합니다. Ulabs 은 비밀번호를 저장하지 않으므로 비밀번호를 찾아 드릴수 없으므로 반드시 백업해두시기 바랍니다."
    }
    static PayPasswordPlaceholder = {
        cn: "请输入支付密码",
        en: "Enter payment password.",
        kr: "결제비밀번호를 입력하십시오."
    }
    static NewPayPasswordPlaceholder = {
        cn: "请输入新支付密码",
        en: "Enter new payment password.",
        kr: "새 결제비밀번호를 입력하십시오."        
    }
    static NewPayPasswordAgainPlaceholder = {
        cn: "请再次输入",
        en: "Enter again.",
        kr: "다시 한번 입력하십시오."
    }
    static CommitModified = {
        cn: "提交修改",
        en: "Submit changes",
        kr: "수정사항 제출"
    }
    static PayPasswordRequired = {
        cn: "原支付密码不能为空",
        en: "The original payment password cannot be blank.",
        kr: "기존 결제비밀번호는 비워둘 수 없습니다."
    }
    static ChangePasswordSucceed = {
        cn: "支付密码修改成功",
        en: "Payment password changed",
        kr: "결제비밀번호 수정이 완료되었습니다."
    }
    static EnterRightPassword = {
        cn: "请输入正确的支付密码",
        en: "Enter the correct payment password.",
        kr: "정확한 결제비밀번호를 입력하십시오."
    }
    static Pay = {
        cn: "支付",
        en: "Payment",
        kr: "결제"
    }
    static TransferTo = {
        cn: "转账至",
        en: "Transfer to",
        kr: "로출금"
    }
    static IncorrectPaymentPassword  = {
        cn: "支付密码不正确",
        en: "Incorrect payment password.",
        kr: "결제비밀번호가 정확하지 않습니다."
    }
    static PayAddressRequired = {
        cn: "收款钱包地址不能为空",
        en: "The receiving address cannot be blank.",
        kr: "입금주소는 비워둘수 없습니다."
    }
    static RightAddress = {
        cn: "请输入正确的钱包地址",
        en: "Enter the correct wallet address",
        kr: "정확한 지갑주소를 입력하십시오."
    }
    static TransferAmountRequired = {
        cn: "请输入转账金额",
        en: "Enter amount.",
        kr: "출금금액을 입력하십시오."
    }
    static NoTransferAmountZero  = {
        cn: "转账金额不能为0",
        en: "Payment amount cannot be 0.",
        kr: "출금금액은 0이 될 수 없습니다."
    }
    static RightTransferAmount = {
        cn: "请输入正确的转账金额",
        en: "Enter the correct payment amount.",
        kr: "정확한 출금금액을 입력하십시오."
    }
    static InsufficientAccountBalance = {
        cn: "账户余额不足",
        en: "Insufficient account balance",
        kr: "잔액이 부족합니다."
    }
    static EthBalanceInsufficient  = {
        cn: "以太坊余额不足",
        en: "Insufficient ETH balance",
        kr: "이더리움 잔액이 부족합니다."
    }
    static UbbeyBalanceInsufficient  = {
        cn: "余额不足",
        en: "Insufficient balance",
        kr: "잔액부족"
    }
    static TransactionPackaging = {
        cn: "交易打包中",
        en: "Packing",
        kr: "거래가 진행중입니다."
    }
    static SuccessfulDeal = {
        cn: "交易成功",
        en: "Transaction succeeded",
        kr: "거래 성공"
    }
    static TransactionFailure = {
        cn: "交易失败",
        en: "Transaction failed",
        kr: "거래 실패"
    }
    static TransactionCancal = {
        cn: "交易取消",
        en: "Transaction canceled",
        kr: "거래 취소"
    }
    static WaitTransactionPackage = {
        cn: "交易待打包",
        en: "To be packed",
        kr: "거래가 대기중입니다."
    }
    //selectpage
    static SelectFile = {
        cn: "选择文件",
        en: "Select file",
        kr: "파일 선택"
    }
    static SelectUploadPath = {
        cn: "选择上传位置",
        en: "Select upload location",
        kr: "업로드할 위치를 선택하십시오."
    }
    static SelectRightPath = {
        cn: "选定: ",
        en: "Selected",
        kr: "선택"
    }
    static Upload = {
        cn: "上传",
        en: "Upload",
        kr: "업로드"
    }
    static SelectUploadNum = {
        cn: "已选择${num}项",
        en: "{num} items selected",
        kr: "이미${num}항목을 선택했습니다."
    }


    static SelfTransferNotPermitted = {
        cn: "你不能给自己转账",
        en: "The address cannot be yourself",
        kr: "본인주소로 출금할 수 없습니다."
    }
    //tab.html
    static createFile = {
        cn: "创建挖矿文件",
        en: "Create mining files",
        kr: "마이닝 파일 생성"
    }
    static createJoinEarn = {
        cn: "已创建文件即可参与挖矿",
        en: "After created files can join mining ",
        kr: "생성된 파일은 마이닝에 결합할 수 있습니다. "
    }
    static cantCreateMore = {
        cn: "空间不足，无法创建更多文件",
        en: "No enough space, cannot create more files",
        kr: "공간이 부족하여 파일을 더 이상 만들 수 없습니다. "
    }
    static createdShareFile = {
        cn: "已共享存储",
        en: "Used Sharing storage",
        kr: "사용된 공유 저장소"
    }
    static allShareFile = {
        cn: "总共享存储",
        en: "Total sharing storage",
        kr: "총 공유 스토리지"
    }
    //测试链
    static changeSize = {
        cn: "正在更改中",
        en: "Changing is in progress",
        kr: "변경이 진행 중입니다. "
    }
    static changeWallet = {
        cn: "正在更改钱包中",
        en: "Changing the wallet",
        kr: "지갑 변경중"
    }
    static changeWalletTitle = {
        cn: "更换挖矿地址",
        en: "Change mining address",
        kr: "마이닝 주소 변경"
    }
    static changeWalletDetail = {
        cn: "更换挖矿地址后，先前挖矿文件不可用",
        en: "After changing the mining address, the previous mining file cannot be accessed",
        kr: "마이닝 주소를 변경한 후 이전 마이닝 파일에 접근할 수 없습니다. "
    }

    static transferErrUnderPriced = {
        cn: "交易发送失败，为保障交易成功建议提高Gas",
        en: "Transaction failed, recommend to improve Gas for the success of the transactions",
        kr: "거래가 실패했습니다. 거래 성공을 위해 Gas를 개선할 것을 권장합니다. "
    }   
    static height = {
        cn: "高度",
        en: "Height",
        kr: "높이"
    }
    static timestamp = {
        cn: "时间戳",
        en: "Time stamp",
        kr: "타임스탬프"
    }
    static seeDetail = {
        cn: "查看详情",
        en: "View details",
        kr: "세부 정보 보기"
    }
    static hideDetail = {
        cn: "收起详情",
        en: "Collapse details",
        kr: "세부 정보 거두기"
    }
    static transerSending = {
        cn: "正在转帐中",
        en: "Transaction submitting ",
        kr: "거래 제출 중"
    }
    static HaveNoChangeRecord = {
        cn: "您还没有交易记录",
        en: "You don't have any transaction record",
        kr: "거래 기록이 없습니다"
    };
    static StartChainMining = {
        cn: "开启测试链挖矿",
        en: "Mining",
        kr: "마이닝",
    };
    static StartMiningInfo = {
        cn: "挖矿收益按天结算，每月末自动发放。点击「挖矿配置」更改此配置",
        en: "The mining reward is settled on a daily basis and is automatically issued at the end of each month. Click 'mining configuration' to change this configuration",
        kr: "마이닝보상은 매일 결제되며 매월 말에 자동으로 지급됩니다. 이 설정을 변경하려면 '마이닝 설정'을 클릭하십시오."
    };
    static StartChainMiningInfo = {
        cn: "测试链挖矿收益将实时结算至测试链钱包，您可以点击「挖矿配置」设置挖矿参数",
        en: "The test chain mining reward is settled on a daily basis and is automatically issued at the end of each month. Click 'mining configuration' to change this configuration",
        kr: "테스트 체인의 마이닝 보상은 매일 결제되며 매월 말에 자동으로 지급됩니다. 이 설정을 변경하려면 '마이닝 설정'을 클릭하십시오."
    };
    static StopMining = {
        cn: "暂不挖矿",
        en: "Not mining now",
        kr: "지금 마이닝 안 함"
    };
    static UploadFileSuccess = {
        cn: '文件上传成功',
        en: 'file uploaded successfully',
        kr: '파일 업로드 성공'
    }

    static CloseMining = {
        cn: "关闭挖矿",
        en: "Close mining",
        kr: "마이닝 중지"
    };
    static CloseChainMining = {
        cn: "关闭测试链挖矿",
        en: "Close test chain mining",
        kr: "테스트 체인 마이닝 중지"
    };
    static CloseMiningInfo = {
        cn: "关闭挖矿后，您的设备无需再共享带宽和存储资源，也不会获得挖矿收益",
        en: "After turn off mining, your device no longer needs to share bandwidth and storage space, and you won’t get mining reward",
        kr: "마이닝 기능을 중지 후에는 더 이상 단말기가 대역폭과 스토리지 공간을 공유할 필요가 없으며, 마이닝 보상을 받을 수 없습니다. "
    };
    static Close = {
        cn: "关闭",
        en: "Close",
        kr: "중지"
    };
    static MinedChainTime = {
        cn: "连续挖矿时长",
        en: "Continuous mining time",
        kr: "지속적인 마이닝 시간"
    };
    static setMiningAddr = {
        cn: "请设置钱包地址",
        en: "please set up wallet address",
        kr: "지갑 주소를 적어주세요"
    };
    static MiningAvenue = {
        cn: '挖矿收益',
        en: 'Mining reward',
        kr: '마이닝수익'
    }
    static TransactionRecord = {
        cn: '交易记录',
        en: 'Transaction record',
        kr: '거래기록'
    }
    
    static TestChainTitle = {
        cn: '参与测试链挖矿',
        en: 'Check out TestNet mining',
        kr: '테스트넷 마이닝 체크아웃'
    }
    static TestChainDescription = {
        cn: '加入测试活动，获百万UBBEY奖励',
        en: 'Mining with us to win millions of UBBEY',
        kr: '테스트 체인 마이닝에 참여하여 백만 UBBEY상금을 받아가세요'
    }
    static ERCChainTitle = {
        cn: '查看ERC20挖矿',
        en: 'Check out ERC20 mining',
        kr: ' ERC20 마이닝 확인'
    }
    static ERCChainDescription = {
        cn: '开启测试链挖矿不影响ERC20挖矿收益',
        en: 'Testnet won\'t effect on ERC20 reward',
        kr: '테스트넷이 ERC20 보상에 영향을 미치지 않음'
    }
    static LookNow = {
        cn: '立即查看',
        en: 'Check out',
        kr: '체크아웃'
    }
    static Move = {
        cn: '移动',
        en: 'Move',
        kr: '이동'
    }
    static Detail = {
        cn: '详情',
        en: 'Details',
        kr: '세부 사항'
    }
    static Share = {
        cn: '分享',
        en: 'Share',
        kr: '공유'
    }
    static MoveToPath = {
        cn: '移动至: ',
        en: 'Move to',
        kr: '다음으로 이동'
    }
    static Unupload = {
        cn: '未上传',
        en: 'Not uploaded',
        kr: '업로드되지 않음'
    }
    static All = {
        cn: '全部',
        en: 'All',
        kr: '전부'
    }
    static SelectAlbums = {
        cn: '选择相册',
        en: 'Elect albums',
        kr: '앨범 선택 '
    }
    static CannotView = {
        cn: '暂不支持该文件类型预览',
        en: 'Not support the file preview',
        kr: '파일 미리보기를 지원하지 않습니다. '
    }
    static OpenAfterDownload = {
        cn: '下载后可用其他应用打开',
        en: 'Open with other application after downloading',
        kr: '다운로드 후 다른 응용프로그램으로 열기'
    }
    static OpenOtherApp = {
        cn: '其他应用打开',
        en: 'Open with others',
        kr: '다른 응용프로그램으로 열기'
    }
    static CancalDownload = {
        cn: '取消下载',
        en: 'Cancel downloading',
        kr: '다운로드 취소'
    }
    static DownloadFile = {
        cn: '下载文件',
        en: 'Download files',
        kr: '파일 다운로드'
    }
    static Type = {
        cn: '类型',
        en: 'Type',
        kr: '유형'
    }
    static Size = {
        cn: '大小',
        en: 'Size',
        kr: '크기'
    }
    static Owner = {
        cn: '所有者',
        en: 'Owner',
        kr: '주인'
    }
    static CreatTime = {
        cn: '创建时间',
        en: ' Creat time',
        kr: '창조 시간'
    }
    static EditTime = {
        cn: '最近修改',
        en: 'Latest editing',
        kr: '최신 편집'
    }
    static Editor = {
        cn: '修改成员',
        en: 'Editor',
        kr: '편집장'
    }
    static ShareToFriend = {
        cn: '分享给好友',
        en: 'Share with friend',
        kr: '친구와 공유'
    }
    static PayMeUBBEY = {
        cn: '向我扫码转UBBEY',
        en: 'Scan to transfer',
        kr: '스캔 전송'
    }
    static UBBEYTransfer = {
        cn: 'U口令转账',
        en: 'U password transfer',
        kr: ' U 암호 전송'
    }
    static TransferInfo = {
        cn: '您将向该钱包地址转账:',
        en: 'Transfer to this wallet address',
        kr: '이 지갑 주소로 전송합니다 '
    }
    static ToSend = {
        cn: '去转账',
        en: 'Go to transfer',
        kr: '전송으로 이동'
    }
    static AllFiles = {
        cn: '所有文件',
        en: 'All files',
        kr: '모든 파일'
    }
    static PhotoCopy = {
        cn: '图片备份',
        en: 'Photo backups',
        kr: '사진 백업'
    }
    static Opened = {
        cn: '已开启',
        en: 'Already opened',
        kr: '이미 열려 있습니다. '
    }
    static UnOpened = {
        cn: '未开启',
        en: 'Not open',
        kr: '열리지 않음'
    }
    static AndroidPermissionTxt = {
        cn: 'Ubbey需要您授予存储空间权限，不授予可能会影响文件预览、上传下载功能使用。如关闭请前往【设置】-【权限管理】开启。',
        en: 'Ubbey requires you to grant storage permissions, not to grant access might influence the file preview, upload and download features. If it is closed, please go to [Settings] - [Permission Management]',
        kr: 'Ubbey에서는 스토리지 사용 권한을 부여해야 합니다. 액세스 권한을 부여하지 않을 경우 파일 미리 보기, 업로드 및 다운로드 기능에 영향을 줄 수 있습니다. 닫혀 있는 경우 [설정] - [권한 관리]로 이동하십시오.'
    }
    static IosPermissionTxt = {
        cn: 'Ubbey需要您授予存储空间权限，不授予可能会影响文件预览、上传下载功能使用。如关闭请前往【设置】开启',
        en: 'Ubbey requires you to grant storage permissions, not to grant access might influence the file preview, upload and download features. If it is closed, please go to [Settings]',
        kr: ' Ubbey에서는 스토리지 사용 권한을 부여해야 합니다. 액세스 권한을 부여하지 않을 경우 파일 미리 보기, 업로드 및 다운로드 기능에 영향을 줄 수 있습니다. 닫혀 있는 경우 [설정]으로 이동하십시오.'
    }
     
    static PermissionBtn = {
        cn: '知道了',
        en: 'Known',
        kr: '알려짐'
    }

    static CopyPlace = {
        cn: '近场环境下自动同步，速度快不耗费流量',
        en: 'Automatic synchronization in near-field environment, fast and no traffic',
        kr: '근거리 환경에서의 자동 동기화, 빠른 속도, 트래픽 없음'
    }
    static CopyCommentary = {
        cn: '图片自动加密传输至Ubbey Box，去中心化存储，私密保存不怕丢',
        en: 'The picture is automatically encrypted and transmitted to Ubbey Box, secure your privacy with decentralized storage',
        kr: '사진이 자동으로 암호화되고 Ubbey 상자로 전송되며 분산형 스토리지로 개인 정보 보호'
    }

    static SelectCopyAlbums = {
        cn: '选择自动备份相册',
        en: 'Select auto photo backup',
        kr: '자동 사진 백업 선택'
    }
    static Item = {
        cn: '项',
        en: 'Item',
        kr: '항목'
    }
    static NoFiles = {
        cn: '该文件夹下为空',
        en: 'The folder is empty',
        kr: '폴더가 비어 있습니다.'
    }
    static NoShares = {
        cn: '分享功能暂未开放',
        en: 'Sharing not available now',
        kr: '공유 기능을 지금 사용할 수 없습니다.'
    }
    static CannotMove = {
        cn: '文件夹暂时不支持移动',
        en: 'This file cannot be moved',
        kr: '이 파일을 이동할 수 없습니다.'
    }
    static CannotRename = {
        cn: '该文件夹暂时不支持重命名',
        en: 'This file cannot be renamed',
        kr: '이 파일의 이름을 바꿀 수 없습니다.'
    }
    
    static CopyInfoHead = {
        cn: '复制整段信息，打开👉Ubbey App👈，即可向我的钱包转账:【',
        en: 'Copy the whole paragraph，open👉Ubbey App，then you can transfer to my wallet',
        kr: '전체 메시지를 복사하고 👉Ubbey App👈를 열면 바로 나의 지갑으로 이체할 수 있다.'
    }
    static CopyInfoFoot = {
        cn: '】(未安装App点这里：https://ulabs.tech/app)',
        en: 'Download app, please click https://ulabs.tech/app',
        kr: '앱 다운로드 받으시려면 여기를 누루세요'
    }
    static Time = {
        cn: '时间',
        en: '',
        kr: ''
    }
    static UpdateApp = {
        cn: '更新',
        en: '',
        kr: ''
    }
    static Description = {
        cn: '应用描述',
        en: '',
        kr: ''
    }
    static Permissions = {
        cn: '权限',
        en: '',
        kr: ''
    }
    static Hardware = {
        cn: '硬件环境',
        en: '',
        kr: ''
    }
    static Developers = {
        cn: '开发者',
        en: '',
        kr: ''
    }
    static Open = {
        cn: '打开',
        en: '',
        kr: ''
    }
    static FindFascinating = {
        cn: '发现精彩',
        en: '',
        kr: ''
    }
    static Get = {
        cn: '获取',
        en: '',
        kr: ''
    }
    static BindBox = {
        cn: '绑定Ubbey Box',
        en: '',
        kr: ''
    }
    static BindBoxInfo1 = {
        cn: '拥有去中心化存储私有云盘，随时备份',
        en: '',
        kr: ''
    }
    static BindBoxInfo2 = {
        cn: '再也不担心手机存储不够用',
        en: '',
        kr: ''
    }
    static NotBind = {
        cn: '暂不绑定',
        en: '',
        kr: ''
    }
    static BindSuccess = {
        cn: '绑定成功',
        en: '',
        kr: ''
    }

    static BoxHasBind = {
        cn: '该盒子已经被绑定',
        en: '',
        kr: ''
    }

    static StartDownload = {
        cn: '恢复下载',
        en: '',
        kr: ''
    }
    static StopDownload = {
        cn: '暂停下载',
        en: '',
        kr: ''
    }

    static AKeyBackup = {
        cn: '一键备份图片',
        en: '',
        kr: ''
    }

    static BTSeeds = {
        cn: 'BT种子',
        en: '',
        kr: ''
    }

    static UploadTo = {
        cn: '上传至',
        en: '',
        kr: ''
    }

    static AdviceSubmitInfo = {
        cn: '上传的系统日志包括版本信息、固件信息、系统时间、磁盘信息等，上传的日志受到隐私保护，只用于定位问题，不会对外泄漏。勾选此项表示您同意提供日志信息定位问题。',
        en: '',
        kr: ''
    }

    static BTDetail = {
        cn: '资源详情',
        en: '',
        kr: ''
    }
    static AllDownload = {
        cn: '共下载：',
        en: '',
        kr: ''
    }
    static Introduction = {
        cn: '简介',
        en: '',
        kr: ''
    }
    static FileType = {
        cn: '文件格式',
        en: '',
        kr: ''
    }
    static FileNumber = {
        cn: '文件数',
        en: '',
        kr: ''
    }
    static BTNumber = {
        cn: '种子数',
        en: '',
        kr: ''
    }
    static FileHash = {
        cn: '文件hash',
        en: '',
        kr: ''
    }
    static FileDescription = {
        cn: '描述',
        en: '',
        kr: ''
    }
    static PutMore = {
        cn: '收起更多',
        en: '',
        kr: ''
    }
    static ViewMore = {
        cn: '查看更多',
        en: '',
        kr: ''
    }
    static RelatedImages = {
        cn: '相关图片',
        en: '',
        kr: ''
    }
    static FileList = {
        cn: '文件列表',
        en: '',
        kr: ''
    }
    static PlayError = {
        cn: '您的浏览器不支持 video 标签。',
        en: '',
        kr: ''
    }
    static DownloadSet = {
        cn: '下载设置',
        en: '',
        kr: ''
    }
    static MeanwhileDownloadTask = {
        cn: '同时下载任务',
        en: '',
        kr: ''
    }
    static MeanwhileDownloadTaskNum = {
        cn: '同时运行的最大下载任务数',
        en: '',
        kr: ''
    }
    static SelectSavePath = {
        cn: '选择存储位置',
        en: '',
        kr: ''
    }
    static ChangeTaskConfigSuccess = {
        cn: '更改任务配置成功',
        en: '',
        kr: ''
    }
    static CanUse = {
        cn: '可用',
        en: '',
        kr: ''
    }
    static SaveNowPath = {
        cn: '保存当前路径',
        en: '',
        kr: ''
    }
    static GoBack = {
        cn: '返回上一层',
        en: '',
        kr: ''
    }
    static DownloadTask = {
        cn: '下载任务',
        en: '',
        kr: ''
    }
    static DownloadingNum = {
        cn: '下载中',
        en: '',
        kr: ''
    }
    static AllStop = {
        cn: '全部暂停',
        en: '',
        kr: ''
    }
    static AllStart = {
        cn: '全部开始',
        en: '',
        kr: ''
    }
    static ChangeBtTaskStatusSuccess = {
        cn: '更改任务状态成功',
        en: '',
        kr: ''
    }
    static Prompt = {
        cn: '提示',
        en: '',
        kr: ''
    }
    static SureDeleteTask = {
        cn: '确认删除该任务',
        en: '',
        kr: ''
    }
    static DeleteBoxFile = {
        cn: '同时删除硬盘本地文件',
        en: '',
        kr: ''
    }
    static DeleteTaskSuccess = {
        cn: '删除任务成功',
        en: '',
        kr: ''
    }
    static OldPayPassword = {
        cn: '原支付密码',
        en: '',
        kr: ''
    }
    static NewPayPassword = {
        cn: '新支付密码',
        en: '',
        kr: ''
    }
    static SurePayPassword = {
        cn: '确认支付密码',
        en: '',
        kr: ''
    }
    static TransactionAmount = {
        cn: '交易金额',
        en: '',
        kr: ''
    }
    static EquipmentModel = {
        cn: '设备型号',
        en: '',
        kr: ''
    }
    static SystemVersion = {
        cn: '系统版本',
        en: '',
        kr: ''
    }
    static PrepareUbbeyEquipment = {
        cn: '准备 Ubbey 设备',
        en: '',
        kr: ''
    }
    static EquipmentUbbeyInfo = {
        cn: '将 Ubbey 设备接通电源和插入网线，确认你的手机与 Ubbey 设备处于同一网络（连接同一Wi-Fi）',
        en: '',
        kr: ''
    }
    static Continue = {
        cn: '继续',
        en: '',
        kr: ''
    }
    static Used = {
        cn: '已使用',
        en: '',
        kr: ''
    }
    static ConnectErr = {
        cn: '连接异常',
        en: '',
        kr: ''
    }
    static TheDisc = {
        cn: '主盘',
        en: '',
        kr: ''
    }
    static TheSecondDisc = {
        cn: '扩展',
        en: '',
        kr: ''
    }
    static BindFail = {
        cn: '绑定失败',
        en: '',
        kr: ''
    }
    static DropDownAndSearchAgain = {
        cn: '下拉重新搜索',
        en: '',
        kr: ''
    }
    static Capacity = {
        cn: '容量：',
        en: '',
        kr: ''
    }
    static SerialNumber = {
        cn: '序列号：',
        en: '',
        kr: ''
    }
    static Binded = {
        cn: '已绑定：',
        en: '',
        kr: ''
    }
    static Bind = {
        cn: '绑定',
        en: '',
        kr: ''
    }
    static Find = {
        cn: '找到',
        en: '',
        kr: ''
    }
    static CanUseEquipment = {
        cn: '台可用设备',
        en: '',
        kr: ''
    }
    static CanotUseEquipment = {
        cn: '找不到可用设备',
        en: '',
        kr: ''
    }
    static ScaningEquipment = {
        cn: '正在搜索可用设备...',
        en: '',
        kr: ''
    }
    static Place = {
        cn: '位置',
        en: '',
        kr: ''
    }
    static RecommendedResources = {
        cn: '推荐资源',
        en: '',
        kr: ''
    }
    static Discovery = {
        cn: '',
        en: 'Discovery',
        kr: ''
    }
    static MyFiles = {
        cn: '',
        en: 'My Files',
        kr: ''
    }
    static OtherDisk = {
        cn: '其他磁盘',
        en: '',
        kr: ''
    }
    static File = {
        cn: '文件',
        en: '',
        kr: ''
    }
    static WonderfulWorld = {
        cn: '超越区块链，开启去中心化的未来',
        en: 'Beyond blockchain, open the gate to the decentralized future',
        kr: ''
    }
    static Email = {
        cn: '邮箱',
        en: '',
        kr: ''
    }
    static LoginPassword = {
        cn: '登录密码',
        en: '',
        kr: ''
    }
    static RegisterNow = {
        cn: '没有账号？立即注册',
        en: '',
        kr: ''
    }

    static SeeMoreMining = {
        cn: '查看历史收益',
        en: '',
        kr: ''
	}
	
	static AddNewDevice = {
		cn: '添加新设备',
		en: '',
		kr: ''
	}

	static Extentions = {
		cn: '${num}个扩展设备',
		en: '',
		kr: ''
	}

	static RemoteConnection = {
		cn: '远场连接',
		en: '',
		kr: ''
	}

	static LocalConnection = {
		cn: '近场连接',
		en: '',
		kr: ''
	}

    static OpenUbbeyGetUbbey = {
        cn: '打开挖矿获取UBBEY奖励',
        en: '',
        kr: ''
    }
    static SetPassword = {
        cn: '设置密码',
        en: '',
        kr: ''
    }
    static InputAgain = {
        cn: '再次输入',
        en: '',
        kr: ''
    }
    static ClickNextAgree = {
        cn: '点击下一步即表示接受用户协议',
        en: '',
        kr: ''
    }
    static TheNextStep = {
        cn: '下一步',
        en: '',
        kr: ''
    }
    static DAPP = {
        cn: '',
        en: 'DAPP',
        kr: ''
    }
    static SearchHistory = {
        cn: '搜索历史',
        en: '',
        kr: ''
    }
    static SecuritySettings = {
        cn: '安全设置',
        en: '',
        kr: ''
    }
    static SystemSet = {
        cn: '系统设置',
        en: '',
        kr: ''
    }
    static More = {
        cn: '更多',
        en: '',
        kr: ''
    }
    static UbbeyOrg = {
        cn: 'ubbey.org',
        en: '',
        kr: ''
    }
    static CopyRight = {
        cn: 'Copyright © 2018 Universal Labs. ',
        en: '',
        kr: ''
    }
    static AllRights = {
        cn: 'All Rights Reserved',
        en: '',
        kr: ''
    }
    static Tips = {
        cn: '温馨提示：',
        en: '',
        kr: ''
    }
    static ValidationCode = {
        cn: '· 验证码有效期为30分钟，超时请重新获取',
        en: '',
        kr: ''
    }
    static EmailInfo = {
        cn: '· 如收不到邮件，请检查邮件地址或者检查邮件是否被归类于垃圾邮件',
        en: '',
        kr: ''
    }

    static ClickChangePassword = {
        cn: '点击修改支付密码',
        en: '',
        kr: ''
    }
    static CopyKeyStore = {
        cn: '为保障资产安全，请备份Keystore文件',
        en: '',
        kr: ''
    }  
    
    static Wallet = {
        cn: '',
        en: 'Wallet',
        kr: ''
    }
    static Notices = {
        cn: '',
        en: 'Notices',
        kr: ''
    } 

    static WaitingDownload = {
        cn: '等待下载',
        en: '',
        kr: ''
    }
    static ContinueDownload = {
        cn: '继续下载',
        en: '',
        kr: ''
    } 
    static DownloadError = {
        cn: '下载失败',
        en: '',
        kr: ''
    } 

    static ViewFile = {
        cn: '查看文件',
        en: '',
        kr: ''
    }
    static DownloadAgain = {
        cn: '重新下载',
        en: '',
        kr: ''
    } 

    static TaskViewPC = {
        cn: '在电脑上打开Ubbey客户端，可对您设备里的文件进行管理，下载地址：www.ubbey.org/download',
        en: '',
        kr: ''
    }

    static RenameError = {
        cn: '重命名失败',
        en: '',
        kr: ''
    }
    static RegisterSlogan = {
        cn: "超越区块链，开启去中心化的未来",
        en: "Beyond blockchain, open the gate to the decentralized future",
        kr: "",
    };
    static ResetPasswordSlogan = {
        cn: "设置8-18位字符，支持英文、数字和特殊字符的组合密码",
        en: "",
        kr: "",
    };
    static PlsSetPasswordSlogan = {
        cn: "设置8-18位字符，支持英文、数字和特殊字符的组合密码",
        en: "",
        kr: "",
    };
     static ClearSpaceInfo = {
        cn: "测试链挖矿活动已结束，感谢您对活动的支持。立即清除挖矿文件恢复存储空间",
        en: "",
        kr: "",
    };
    static NowClear = {
        cn: "立即清除",
        en: "",
        kr: "",
    };
    static DirBT = {
        cn: 'BT下载',
        en: '',
        kr: ''
    }
}

