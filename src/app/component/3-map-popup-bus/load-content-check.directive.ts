import { Directive, Input } from '@angular/core'
import { Bus } from '../../core/models/bus.model'
import { Load } from '../../core/models/load.model'
import { ContentCheckBase } from './content-check.base.directive'

/**
 * Check consumeMW value of a gen (max 1000 for now),
 * calculate pd,
 * and save values
 */
@Directive({
  standalone: true,
  selector: '[loadContentCheck]',
})
export class LoadContentCheckDirective extends ContentCheckBase {
  @Input('bus') bus!: Bus
  @Input('load') load!: Load

  protected override _maxValue = 1000

  protected override _checkValue(value: number): void {
    if (this.load != undefined) {
      this.load.newConsumeMW = value
      if (this.load.newConsumeMW > this._maxValue) {
        this._elRef.nativeElement.innerText = this._maxValue
      }
      this._editsService.saveLoad(this.load, this.bus)
    }
  }

}
