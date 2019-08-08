import { NgModule } from '@angular/core';
import { ClickAndWaitDirective } from './click-and-wait/click-and-wait';
import { RippleEffectDirective } from './ripple-effect/ripple-effect';
@NgModule({
	declarations: [ClickAndWaitDirective,
    RippleEffectDirective],
	imports: [],
	exports: [ClickAndWaitDirective,
    RippleEffectDirective]
})
export class DirectivesModule { }
