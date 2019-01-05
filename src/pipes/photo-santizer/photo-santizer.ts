import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the PhotoSantizerPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'photoSantizer',
})
export class PhotoSantizerPipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

  /**
   * Takes a value and makes it lowercase.
   */
  transform(url: string, ...args) {
  	return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
