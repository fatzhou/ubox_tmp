import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClearCashPage } from './clear-cash';

@NgModule({
  declarations: [
    ClearCashPage,
  ],
  imports: [
    IonicPageModule.forChild(ClearCashPage),
  ],
})
export class ClearCashPageModule {}
