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

/**
 * Popup that appears when you click on a bus
 * Will show information of the bus (load),
 * the generators and the transformers
 * at this coordinate
 */
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
}
