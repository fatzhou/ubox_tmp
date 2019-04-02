import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the PretifyNumberPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
	name: 'pretifyNumber',
})
export class PretifyNumberPipe implements PipeTransform {
	/**
	 * Takes a value and makes it lowercase.
	 */
	transform(value, ...args) {
		let splitLen = 3,
			splitToken = ' ';
		value = value.toString();
		if(args && args.length) {
			if(args[0]) {
				splitLen = args[0];
			}
			if(args[1]) {
				splitToken = args[1];
			}
		}
		let match = value.toString().match(/^(\d+)(\.\d+)?$/);
		let fragment = match && match[1],
			fraction = match && match[2] || "";
		if(fragment.length <= splitLen) {
			return value;
		}
		let start = fragment.length % splitLen;
		let reg = new RegExp("(\\d{" + splitLen + "})", 'g');
		let ret = fragment.slice(0, start) + splitToken + fragment.slice(start).replace(reg, "$1" + splitToken).replace(/\s+$/, '');
		return ret + fraction.toString().replace(/^0\./, ".");
	}
}
