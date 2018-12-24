import { Directive, ElementRef, EventEmitter, Renderer2, HostListener } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';
import { Util } from '../../providers/Util';


/**
 * Generated class for the ClickAndWaitDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[click-and-wait]' // Attribute selector
})
export class ClickAndWaitDirective {
  disabled:Boolean = false;
  gap = 2000;
  timeName:any;
  constructor (
  	public element: ElementRef, 
    public renderer: Renderer2,
    private global: GlobalService
  ) {
    // GlobalService.consoleLog('Hello ClickAndWaitDirective Directive');
  }

  @HostListener("click")
  onClick() {
    this.toggleClick();
  }

  toggleClick() {
    GlobalService.consoleLog("点击事件！！！");
    // this.renderer.addClass(this.element.nativeElement, 'disabledA');
    /*
    let NowClass = JSON.stringify(this.element.nativeElement.className);
    // this.renderer.setAttribute(this.element.nativeElement, 'disabled', 'true');
    if(NowClass.indexOf('disabledA')>-1){
        clearTimeout(this.timeName);
        this.timeName = setTimeout(()=>{
          // this.renderer.removeAttribute(this.element.nativeElement, 'disabled');
          this.renderer.removeClass(this.element.nativeElement,'disabledA');
          GlobalService.consoleLog("准备返回true");
          return true;
        }, this.gap);
        GlobalService.consoleLog("准备返回false");
        return false;
    }else{
        this.renderer.addClass(this.element.nativeElement, 'disabledA');
        this.timeName = setTimeout(()=>{
          // this.renderer.removeAttribute(this.element.nativeElement, 'disabled');
          this.renderer.removeClass(this.element.nativeElement,'disabledA');
          GlobalService.consoleLog("准备返回true");
          return true;
        }, this.gap);
    }


    */


    
    this.renderer.addClass(this.element.nativeElement, 'disabled');
    setTimeout(()=>{
      // this.renderer.removeAttribute(this.element.nativeElement, 'disabled');
      this.renderer.removeClass(this.element.nativeElement, 'disabled');
    }, this.gap);


    
  }

  ngOnInit(){
  }

}
