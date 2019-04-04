import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../../providers/GlobalService';

/**
 * Generated class for the ComputeCoinbasePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
	name: 'computeFileSize',
})
export class ComputeFileSizePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(size: any, ...args) {
		if(size == '') {
			return size
		}
		if(size == 0) {
			return '0B';
		}
		let reg = /^[0-9]{1,}$/;
		if (!reg.test(size)) {
			return size;
		}
		if (size < GlobalService.DISK_M_BITS) {
			return (size / GlobalService.DISK_K_BITS).toFixed(2) + "K"
		} else if (size < GlobalService.DISK_G_BITS) {
			return (size / GlobalService.DISK_M_BITS).toFixed(2) + "M"
		} else {
			return (size / GlobalService.DISK_G_BITS).toFixed(2) + "G"
		}
	}
}
