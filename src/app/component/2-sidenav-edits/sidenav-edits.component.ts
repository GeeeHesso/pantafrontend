import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { Component, Inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatRadioModule } from '@angular/material/radio'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BehaviorSubject } from 'rxjs'
import { Gen } from 'src/app/core/models/gen.model'
import { PANTAGRUEL_DATA, UNIT_WATT } from '../../core/core.const'
import { Branch } from '../../core/models/branch.model'
import { Bus } from '../../core/models/bus.model'
import { BusPoint } from '../../core/models/busPoint.model'
import { Load } from '../../core/models/load.model'
import { Pantagruel } from '../../core/models/pantagruel'
import { EditsService } from '../../core/services/edits.service'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Side panel contents element for edition mode
 * *
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 21/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 07/11/2023		Gwenaëlle Gustin		bug fixed: list of edits after recalculate
 * *
 ******************************************************************/
@Component({
  selector: 'app-sidenav-edits',
  templateUrl: './sidenav-edits.component.html',
  styleUrls: ['./sidenav-edits.component.scss'],
  standalone: true,
  imports: [
    MatSlideToggleModule,
    NgIf,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatRadioModule,
    FormsModule,
    MatCardModule,
    NgForOf,
    AsyncPipe,
  ],
})
export class SidenavEditsComponent implements OnInit {
  public editedTotalProd: number = 0
  public editedTotalCons: number = 0
  public editedBusPoint: BusPoint[] = []
  public UNIT_WATT = UNIT_WATT
  constructor(
    public editsService: EditsService,
    @Inject(PANTAGRUEL_DATA) public _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}
  @Inject(MAT_DIALOG_DATA) public current: string = 'dc'
  @Inject(MAT_DIALOG_DATA) public flow: string = 'pf'
  protected readonly isNaN = isNaN

  ngOnInit() {
    // Each time the edited total production change, the difference is recalculated
    this.editsService.mapService.dataService.editedTotalProd$.subscribe((val: number) => {
      this.editedTotalProd = val
      const differenceRounded = Math.abs(
        Math.round(
          (val - this.editsService.mapService.dataService.editedTotalCons$.getValue()) * 100,
        ) / 100,
      )
      this.editsService.mapService.dataService.editedProdMinusEditedCons$.next(differenceRounded)
    })
    // Each time the edited total consumption change, the difference is recalculated
    this.editsService.mapService.dataService.editedTotalCons$.subscribe((val: number) => {
      this.editedTotalCons = val
      const differenceRounded = Math.abs(
        Math.round(
          (this.editsService.mapService.dataService.editedTotalProd$.getValue() - val) * 100,
        ) / 100,
      )
      this.editsService.mapService.dataService.editedProdMinusEditedCons$.next(differenceRounded)
    })

    // Init data at first edition
    let data = this._pantagruelData.getValue()

    // Add all lines at a bus coord at each modification of editedBus
    // Shown in html only if value is not the same as original
    this.editsService.mapService.dataService.editedBus$.subscribe((buses: Bus[]) => {
      // if dataService.editedBus$ has been reset "No change" is shown and reload actual data (edited after Calculate button)
      if (buses.length == 0) {
        this.editsService.editionMade = false
        data = this._pantagruelData.getValue()
      }

      this.editedBusPoint = []
      buses.forEach((b) => {
        const busPoint: BusPoint = { bus: b, lines: [], transfo: [] }
        Object.keys(data.branch).forEach((br) => {
          if (data.branch[br].transformer) {
            if (
              b.index == data.branch[br].fromBus.index ||
              b.index == data.branch[br].toBus.index
            ) {
              busPoint.transfo.push(data.branch[br])
            }
          } else {
            if (
              b.index == data.branch[br].fromBus.index ||
              b.index == data.branch[br].toBus.index
            ) {
              busPoint.lines.push(data.branch[br])
            }
          }
        })
        this.editedBusPoint.push(busPoint)
      })
    })
  }

  /**
   * Handle "Calculate" button with parameter of radio button (AC/DC, optimal/normal power flow)
   */
  public handleButtonCalculateGrid(): void {
    const request = this.flow + '/' + this.current + '_' + this.flow
    this.editsService.mapService.askData(request)
    this.editsService.mapService.map.closePopup()
  }

  /**
   * Handle the cancellation of a load modification
   * @param load
   * @param bus
   */
  public handleButtonCancelEditLoad(load: Load, bus: Bus): void {
    load.consumeMW = load.originalConsumeMW
    this.editsService.updateSidePanelAfterLoadEdit(load, bus)
  }

  public handleCancel() {
    this.editsService.mapService.dataService.editedBus$.next([])
    this.editsService.mapService.dataService.resetTotalEditedProdCons()
    this.editsService.editionMade = false
  }

  /**
   * Handle the cancellation of a gen modification
   * @param gen
   * @param bus
   */
  public handleButtonCancelEditGen(gen: Gen, bus: Bus): void {
    gen.produceMW = gen.originalProduceMW
    this.editsService.updateSidePanelAfterGenEdit(gen, bus)
  }

  /**
   * Handle the cancellation of a branch (line, transformer) modification
   * @param branch
   */
  public handleButtonCancelEditBranch(branch: Branch): void {
    branch.br_status = branch.originalStatus
    branch.loadInjected = branch.originalLoadInjected
    branch.totalPowerMW = branch.originalTotalPowerMW
    this.editsService.updateSidePanelAfterBranchEdit(branch, branch.originalStatus)
  }
}
