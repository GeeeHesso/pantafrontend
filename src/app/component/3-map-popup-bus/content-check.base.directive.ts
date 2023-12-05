import { Directive, ElementRef, HostListener, Inject } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { PANTAGRUEL_DATA } from '../../core/core.const'
import { Pantagruel } from '../../core/models/pantagruel'
import { EditsService } from "../../core/services/edits.service";


/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Parent directive of GenContentCheckDirective and LoadContentCheckDirective
 *                       Use to authorise only number format with decimal
 *                       and some other key (delete, arrow,...)
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
@Directive()
export class ContentCheckBase {
  protected _maxValue!: number

  constructor(
    protected _editsService: EditsService,
    protected _elRef: ElementRef,
    @Inject(PANTAGRUEL_DATA) protected _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}

  @HostListener('keydown', ['$event']) onKeydown(e: KeyboardEvent) {
    const valueStr = this._elRef.nativeElement.innerText
    const key = Number(e.key)

    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      const value = Number(valueStr)
      e.preventDefault()

      this._checkValue(value)
    } else if (
      e.code === 'Backspace' ||
      e.code === 'Delete' ||
      e.code === 'ArrowRight' ||
      e.code === 'ArrowLeft'
    ) {
      // allow delete and arrows
    } else if ((e.code === 'Period' || e.code === 'NumpadDecimal') && !valueStr.includes('.')) {
      // allow one decimal
    } else if (isNaN(key) || e.key === null || e.key === ' ') {
      e.preventDefault()
    }
  }

  protected _checkValue(value: number): void {
    // @see child
  }
}
