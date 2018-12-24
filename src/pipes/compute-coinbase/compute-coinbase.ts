import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the ComputeCoinbasePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'computeCoinbase',
})
export class ComputeCoinbasePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(coinbase: string, ...args) {
  	return coinbase ? coinbase.slice(0, 8) + '...' + coinbase.slice(-8) : '';
  }
}
