import { Directive, AfterViewInit, ElementRef, Renderer2, Host } from '@angular/core';
// import { DomController } from '@ionic/angular';

@Directive({
    selector: '[ripple-effect]', // Attribute selector
    host: {
        'tappable': '',
        'role': 'button',
        'style': 'overflow: hidden'
    }
})
export class RippleEffectDirective {
    rippleEffect;

    constructor(private element: ElementRef, private renderer: Renderer2) {
        // const div = renderer.createElement('div');
        // renderer.addClass(div, 'button-effect');
        // renderer.appendChild(host.nativeElement, div);
    }

    ngAfterViewInit() {
        this.rippleEffect = this.renderer.createElement('ion-ripple-effect');
        this.renderer.insertBefore(this.element.nativeElement, this.rippleEffect, this.element.nativeElement.firstChild);
        // this.renderer.setStyle(this.element.nativeElement, 'position', 'relative');
        this.renderer.addClass(this.element.nativeElement, 'ion-activatable');
    }
}

