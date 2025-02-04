import { NgForOf, NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider'
import { MatTabsModule } from '@angular/material/tabs'
import { MAX_CONS, UNIT_WATT } from 'src/app/core/core.const'
import { Branch } from '../../core/models/branch.model'
import { Bus } from '../../core/models/bus.model'
import { EditsService } from '../../core/services/edits.service'
import { GenContentCheckDirective } from './gen-content-check.directive'
import { LoadContentCheckDirective } from './load-content-check.directive'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Popup that appears when you click on a bus
 *                       Will show information of the bus (load), the generators
 *                       and the transformers at this coordinate
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 08/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 08/01/2025		Gwenaëlle Gustin		Load and gen can be edited with percentage with slider
 * *
 ******************************************************************/
@Component({
  selector: 'app-map-popup-bus',
  templateUrl: './map-popup-bus.component.html',
  styleUrls: ['./map-popup-bus.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,

    // Directives
    GenContentCheckDirective,
    LoadContentCheckDirective,

    // Mat
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSliderModule,
  ],
})
export class MapPopupBusComponent {
  constructor(public editsService: EditsService) {}
  //ToDo: can be change with BusPoint model
  @Input() buses!: Bus[]
  @Input() transformers!: Branch[]
  protected readonly isNaN = isNaN
  public UNIT_WATT = UNIT_WATT
  public MAX_CONS = MAX_CONS

  formatLabel(value: number): string {
    return `${value + '%'}`
  }
}
