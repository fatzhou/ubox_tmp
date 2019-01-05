import { NgModule } from '@angular/core';
import { BoxPromotionComponent } from './box-promotion/box-promotion';
import { BindBoxComponent } from './bind-box/bind-box';
@NgModule({
	declarations: [BoxPromotionComponent,
    BindBoxComponent],
	imports: [],
	exports: [BoxPromotionComponent,
    BindBoxComponent]
})
export class ComponentsModule {}
