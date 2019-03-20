import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the BoxPromotionComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'box-promotion',
  templateUrl: 'box-promotion.html'
})
export class BoxPromotionComponent {
	focusSlide = 0;
	@ViewChild(Slides) slides: Slides;
    @Output() goBindingPage = new EventEmitter < any > ();
    @Output() goBuyBoxPage = new EventEmitter < any > ();

	constructor(private global: GlobalService) {
		// console.log('Hello BoxPromotionComponent Component');
	}

	goBindingBoxPage() {
		this.goBindingPage.emit();
	}

	goPurchaseBoxPage() {
		this.goBuyBoxPage.emit();
	}

	selectSlide(index) {
		// if(this.focusSlide == index) {
		// 	return false;
		// }
		this.focusSlide = index;
		this.slides.slideTo(index, 500);
	}

	slideChanged() {
		let currentIndex = this.slides.getActiveIndex();
		this.focusSlide = currentIndex;
	}
}
