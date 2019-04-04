import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { NgModule, ErrorHandler } from '@angular/core';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SuperTabsModule } from 'ionic2-super-tabs';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
// import { StatusBar } from '@ionic-native/status-bar';


import { IonicStorageModule } from '@ionic/storage';
import { Lang } from '../providers/Language';
import { CheckUpdate } from '../providers/CheckUpdate';

//根页面
import { UboxApp } from './app.component';

//自定义页面
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { ChangePasswdPage } from '../pages/change-passwd/change-passwd';
import { DeviceListPage } from '../pages/device-list/device-list';
import { ResultPage } from '../pages/result/result';
import { VerifyEmailPage } from '../pages/verify-email/verify-email';
import { ResetPasswdPage } from '../pages/reset-passwd/reset-passwd';
import { ListPage } from '../pages/list/list';
import { UserPage } from '../pages/user/user';
import { MiningPage } from '../pages/mining/mining';
import { TabsPage } from '../pages/tabs/tabs';
import { MiningListPage } from '../pages/mining-list/mining-list';
import { MiningTestListPage } from '../pages/mining-test-list/mining-test-list';
import { MiningSettingPage } from '../pages/mining-setting/mining-setting';
import { WalletImportPage } from '../pages/wallet-import/wallet-import';
import { WalletGeneratorPage } from '../pages/wallet-generator/wallet-generator';
import { WalletNameModifyPage } from '../pages/wallet-name-modify/wallet-name-modify';
import { DeviceManagementPage } from '../pages/device-management/device-management';
import { AboutDevicePage } from '../pages/about-device/about-device';
import { WalletSelectPage } from '../pages/wallet-select/wallet-select';
import { WalletDetailPage } from '../pages/wallet-detail/wallet-detail';
import { LanguageSelectPage } from '../pages/language-select/language-select';
import { WalletInfoPage } from '../pages/wallet-info/wallet-info';
import { WalletCoinbasePage } from '../pages/wallet-coinbase/wallet-coinbase';
import { AboutUsPage } from '../pages/about-us/about-us';
import { ExportKeystorePage } from '../pages/export-keystore/export-keystore';
import { TaskListPage } from '../pages/task-list/task-list';
import { GuidancePage } from '../pages/guidance/guidance';
import { AgreementPage } from '../pages/agreement/agreement';
import { SystemSettingPage } from '../pages/system-setting/system-setting';
import { WalletSettingPage } from '../pages/wallet-setting/wallet-setting';
import { ChangePayPasswordPage } from '../pages/change-pay-password/change-pay-password';
import { UpdateAssitantPage } from '../pages/update-assitant/update-assitant';
import { AdviceSubmitPage } from '../pages/advice-submit/advice-submit';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { CoinGetPage } from '../pages/coin-get/coin-get';
import { CoinSendPage } from '../pages/coin-send/coin-send';
import { CoinTransactionPage } from '../pages/coin-transaction/coin-transaction';
import { CoinUnitPage } from '../pages/coin-unit/coin-unit';
import { NoticeListPage } from '../pages/notice-list/notice-list'
import { NoticeDetailPage } from '../pages/notice-detail/notice-detail'
import { SelectUploadFolderPage } from '../pages/select-upload-folder/select-upload-folder'
import { PreviewImagePage } from '../pages/preview-image/preview-image';
import { PreviewOtherPage } from '../pages/preview-other/preview-other';
import { SelectImgPage } from '../pages/select-img/select-img';
import { SelectAudioVideoPage } from '../pages/select-audio-video/select-audio-video';
import { SelectFolderPage } from '../pages/select-folder/select-folder'
import { SelectAlbumPage } from '../pages/select-album/select-album'
import { ClassifyListPage } from '../pages/classify-list/classify-list';
import { CopyPhotoPage } from '../pages/copy-photo/copy-photo';
import { PermissionPage } from '../pages/permission/permission';
import { SearchPage } from '../pages/search/search';
import { AppDetailPage } from '../pages/app-detail/app-detail';
import { SearchBtPage } from '../pages/search-bt/search-bt';
import { BtDetailPage } from '../pages/bt-detail/bt-detail';
import { BtSetPage } from '../pages/bt-set/bt-set';
import { BtTaskPage } from '../pages/bt-task/bt-task';
import { BtSetPathPage } from '../pages/bt-set-path/bt-set-path';
import { BtSetDiskPage } from '../pages/bt-set-disk/bt-set-disk';
import { FindPage } from '../pages/find/find';
import { BtPlayPage } from '../pages/bt-play/bt-play';
import { FileDetailPage } from '../pages/file-detail/file-detail';
import { DeviceSearchPage } from '../pages/device-search/device-search';
import { DeviceGuidancePage } from '../pages/device-guidance/device-guidance';
import { DeviceDetailPage } from '../pages/device-detail/device-detail';
import { DeviceManagePage } from '../pages/device-manage/device-manage';

//自定义组件
import { DropdownFolderComponent } from '../components/dropdown-folder/dropdown-folder';
import { AddFileComponent } from '../components/add-file/add-file';
import { NavTabsComponent } from '../components/nav-tabs/nav-tabs';
import { DeviceComponent } from '../components/device/device';
import { NewsNoticeComponent } from '../components/news-notice/news-notice';
import { FileDetailComponent } from '../components/file-detail/file-detail';
import { FileFooterComponent } from '../components/file-footer/file-footer';
import { PermissionComponent } from '../components/permission/permission';
import { ConnectionPopupComponent } from '../components/connection-popup/connection-popup';
import { BoxPromotionComponent } from '../components/box-promotion/box-promotion';
import { BindBoxComponent } from '../components/bind-box/bind-box';
import { ClassifyComponent } from '../components/classify/classify';


//插件providers
import { File } from '@ionic-native/file';
import { Camera } from '@ionic-native/camera';
import { FileOpener } from '@ionic-native/file-opener';
import { Clipboard } from '@ionic-native/clipboard';
import { Network } from '@ionic-native/network';
import { HTTP } from '@ionic-native/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Zip } from '@ionic-native/zip/ngx';
import { FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer/ngx';

import { NgxQRCodeModule } from 'ngx-qrcode2';
import { DirectivesModule } from '../directives/directives.module';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { Keyboard } from '@ionic-native/keyboard/ngx';

//自定义providers
import { HttpService } from "../providers/HttpService";
import { GlobalService } from "../providers/GlobalService";
import { Util } from "../providers/Util";
import { FileDownloader } from '../providers/FileDownloader';
import { FileUploader } from '../providers/FileUploader';
import { Web3Service } from '../providers/Web3Service';
import { FileTransport } from '../providers/FileTransport';
import { FileManager } from '../providers/FileManager';
import { AppsInstalled } from '../providers/AppsInstalled';
import { AppsInterface } from '../providers/AppsInterface';
import { UappPlatform } from '../providers/UappPlatform';

import { ComputeCoinbasePipe } from '../pipes/compute-coinbase/compute-coinbase'
import { ComputeFileSizePipe } from '../pipes/compute-file-size/compute-file-size'
import { ComputeFileTimePipe } from '../pipes/compute-file-time/compute-file-time'
import { PhotoSantizerPipe } from '../pipes/photo-santizer/photo-santizer'
import { PretifyNumberPipe } from '../pipes/pretify-number/pretify-number'

@NgModule({
  declarations: [
    UboxApp,
    HomePage,
    LoginPage,
    RegisterPage,
    ChangePasswdPage,
    VerifyEmailPage,
    DeviceListPage,
    ResultPage,
    ResetPasswdPage,
    ListPage,
    DropdownFolderComponent,
    DeviceComponent,
    AddFileComponent,
    NavTabsComponent,
    NewsNoticeComponent,
    FileDetailComponent,
    FileFooterComponent,
    PermissionComponent,
    ConnectionPopupComponent,
    BoxPromotionComponent,
    BindBoxComponent,
    ClassifyComponent,
    UserPage,
    MiningPage,
    TabsPage,
    MiningListPage,
    MiningTestListPage,
    MiningSettingPage,
    WalletImportPage,
    WalletGeneratorPage,
    WalletNameModifyPage,
    DeviceManagementPage,
    AboutDevicePage,
    WalletSelectPage,
    WalletDetailPage,
    LanguageSelectPage,
    WalletInfoPage,
    WalletCoinbasePage,
    AboutUsPage,
    ExportKeystorePage,
    TaskListPage,
    GuidancePage,
    AgreementPage,
    PrivacyPolicyPage,
    CoinGetPage,
    CoinSendPage,
    CoinTransactionPage,
    CoinUnitPage,
    NoticeListPage,
    NoticeDetailPage,
    WalletSettingPage,
    SystemSettingPage,
    ChangePayPasswordPage,
    SelectFolderPage,
    PreviewImagePage,
    PreviewOtherPage,
    SelectUploadFolderPage,
    ComputeCoinbasePipe,
    ComputeFileSizePipe,
    ComputeFileTimePipe,
	PhotoSantizerPipe,
	PretifyNumberPipe,
    SelectImgPage,
    SelectAudioVideoPage,
    SelectAlbumPage,
    ClassifyListPage,
    CopyPhotoPage,
    PermissionPage,
    UpdateAssitantPage,
    AdviceSubmitPage,
    SearchPage,
    AppDetailPage,
    BtTaskPage,
    BtSetPage, 
    BtDetailPage, 
    SearchBtPage,
    BtSetPathPage,
    BtSetDiskPage,
    FindPage,
    BtPlayPage,
    FileDetailPage,
    DeviceSearchPage,
    DeviceGuidancePage,
    DeviceDetailPage,
	DeviceManagePage,
    // ClickAndWaitDirective,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    DirectivesModule,
    NgxQRCodeModule,
    IonicModule.forRoot(UboxApp, {
      iconMode: 'ios',
      mode: 'ios',
      // tabsPlacement: 'bottom',
      pageTransition: 'ios-transition',
      backButtonText: '',
      backButtonIcon: 'arrow-round-back'
    }),
    IonicStorageModule.forRoot(
        {
            name: '__mydb',
            driverOrder: ['indexeddb', 'sqlite', 'websql']            
        }
    ),
    SuperTabsModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    UboxApp,
    HomePage,
    LoginPage,
    RegisterPage,
    ChangePasswdPage,
    VerifyEmailPage,
    DeviceListPage,
    ResultPage,
    ResetPasswdPage,
    ListPage,
    UserPage,
    MiningPage,
    TabsPage,
    MiningListPage,
    MiningTestListPage,
    MiningSettingPage,
    WalletImportPage,
    WalletGeneratorPage,
    WalletNameModifyPage,
    DeviceManagementPage,
    AboutDevicePage,
    WalletSelectPage,
    WalletDetailPage,
    LanguageSelectPage,
    WalletInfoPage,
    WalletCoinbasePage,
    AboutUsPage,
    ExportKeystorePage,
    TaskListPage,
    GuidancePage,
    AgreementPage,
    PrivacyPolicyPage,
    CoinGetPage,
    CoinSendPage,
    CoinTransactionPage,
    CoinUnitPage,
    NoticeListPage,
    NoticeDetailPage,
    WalletSettingPage,
    SystemSettingPage,
    ChangePayPasswordPage,
    SelectFolderPage,
    PreviewImagePage,
    PreviewOtherPage,
    SelectUploadFolderPage,
    SelectImgPage,
    SelectAudioVideoPage,
    SelectAlbumPage,
    ClassifyListPage,
    CopyPhotoPage,
    PermissionPage,
    UpdateAssitantPage,
    AdviceSubmitPage,
    SearchPage,
    AppDetailPage,
    BtTaskPage,
    BtSetPage, 
    BtDetailPage, 
    SearchBtPage,
    BtSetPathPage,
    BtSetDiskPage,
    FindPage,
    BtPlayPage,
    FileDetailPage,
    DeviceSearchPage,
    DeviceGuidancePage,
    DeviceDetailPage,
	DeviceManagePage,
  ],
  providers: [
    UboxApp,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    InAppBrowser,
    Network,
    // StatusBar,
    SplashScreen,
    File,
    Camera,
    // ImagePicker,
    HttpService,
    GlobalService,
    BarcodeScanner,
    SocialSharing,
    FileManager,
    // WebrtcService,
    CheckUpdate,
    Web3Service,
    Util,
    HTTP,
    FileOpener,
    Zip,
    FileTransfer,
    Clipboard,
    Lang,
    FileDownloader,
    FileUploader,
    FileTransport,
    PhotoLibrary,
    UappPlatform,
    AppsInstalled,
    AppsInterface,
    Keyboard
  ]
})
export class AppModule {}
