import { NgForOf, NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { Branch } from '../../core/models/branch.model'
import { Bus } from '../../core/models/bus.model'
import { GenContentCheckDirective } from './gen-content-check.directive'
import { LoadContentCheckDirective } from './load-content-check.directive'
import { EditsService } from "../../core/services/edits.service";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Popup that appears when you click on a bus
 *                       Will show information of the bus (load), the generators
 *                       and the transformers at this coordinate
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 08/07/2023		Gwenaëlle Gustin		Last edition for TB release.
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
  ],
})
export class MapPopupBusComponent {
  constructor(public editsService: EditsService) {}
  //ToDo: can be change with BusPoint model
  @Input() buses!: Bus[]
  @Input() transformers!: Branch[]
  protected readonly isNaN = isNaN
}
