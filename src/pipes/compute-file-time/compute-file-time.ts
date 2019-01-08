import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the ComputeCoinbasePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'computeFileTime',
})
export class ComputeFileTimePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(time: any, ...args) {
			var date = new Date(time);
			var month = date.getMonth() + 1;
			var split = '-';
			var needHours = true;
			var Y = date.getFullYear(),
					M = ('00' + month).slice(-2),
					D = ('00' + date.getDate()).slice(-2),
					h = ('00' + date.getHours()).slice(-2),
					m = ('00' + date.getMinutes()).slice(-2),
					s = ('00' + date.getSeconds()).slice(-2);
					if(args && args.length) {
						if(args[0]) {
							split = args[0];
						} 
						if(args[1] != undefined) {
							needHours = args[1];
						} 
					}
					var hours = ' ' + [h, m, s].join(':');
					if(needHours == false) {
						hours = '';
					}
			return [Y, M, D].join(split) + hours;
	}
}
