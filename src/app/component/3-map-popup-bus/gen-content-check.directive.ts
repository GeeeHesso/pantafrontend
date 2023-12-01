import { Directive, Input } from '@angular/core'
import { Gen } from '../../core/models/gen.model'
import { ContentCheckBase } from './content-check.base.directive'
import {Bus} from "../../core/models/bus.model";

/**
 * Check produceMW value of a gen according to its maximum,
 * calculate pg
 * and save values
 */
@Directive({
  standalone: true,
  selector: '[genContentCheck]',
})
export class GenContentCheckDirective extends ContentCheckBase {
  private _gen!: Gen
  @Input('bus') bus!: Bus
  @Input('gen') set gen(value: Gen) {
    this._gen = value
    this._maxValue = value.maxMW
  }

  protected override _checkValue(value: number): void {
    if (this._gen != undefined) {
      this._gen.newProduceMW = value
      if (this._gen.newProduceMW > this._maxValue) {
        this._elRef.nativeElement.innerText = this._maxValue
      }
      this._editsService.saveGen(this._gen, this.bus)
    }
  }

}
