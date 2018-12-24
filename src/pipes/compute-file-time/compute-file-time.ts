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
			var Y = ('00' + date.getFullYear()).slice(-2),
					M = ('00' + month).slice(-2),
					D = ('00' + date.getDate()).slice(-2),
					h = ('00' + date.getHours()).slice(-2),
					m = ('00' + date.getMinutes()).slice(-2),
					s = ('00' + date.getSeconds()).slice(-2);
			return [Y, M, D].join('-') + ' ' + [h, m, s].join(':');
	}
}
