import { AsyncPipe, NgForOf, NgIf } from '@angular/common'
import { Component, Inject, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatToolbarModule } from '@angular/material/toolbar'
import { EditsService } from "../../core/services/edits.service";
import { MatRadioModule } from "@angular/material/radio";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { Bus } from "../../core/models/bus.model";
import { PANTAGRUEL_DATA } from "../../core/core.const";
import { BehaviorSubject } from "rxjs";
import { Pantagruel } from "../../core/models/pantagruel";
import { BusPoint } from "../../core/models/busPoint.model";
import { Branch } from "../../core/models/branch.model";
import {Load} from "../../core/models/load.model";
import {Gen} from "../../core/models/gen.model";


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
  imports: [MatSlideToggleModule, NgIf, MatIconModule, MatButtonModule, MatToolbarModule, MatRadioModule, FormsModule, MatCardModule, NgForOf, AsyncPipe],
})
export class SidenavEditsComponent implements OnInit{
  public editedTotalProd:number = 0
  public editedTotalCons:number = 0
  public editedBusPoint:BusPoint[] = []
  constructor(public editsService: EditsService,
              @Inject(PANTAGRUEL_DATA) public _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}
  @Inject(MAT_DIALOG_DATA) public current: string='dc'
  @Inject(MAT_DIALOG_DATA) public flow: string='pf'


  ngOnInit() {
    // Each time the edited total production change, the difference is recalculated
    this.editsService.mapService.dataService.editedTotalProd$.subscribe((val: number) => {
      this.editedTotalProd = val
      const differenceRounded =  Math.abs(Math.round((val-this.editsService.mapService.dataService.editedTotalCons$.getValue())*100)/100)
      this.editsService.mapService.dataService.editedProdMinusEditedCons$.next(differenceRounded)

    })
    // Each time the edited total consumption change, the difference is recalculated
    this.editsService.mapService.dataService.editedTotalCons$.subscribe((val: number) => {
      this.editedTotalCons = val
      const differenceRounded =  Math.abs(Math.round((this.editsService.mapService.dataService.editedTotalProd$.getValue()-val)*100)/100)
      this.editsService.mapService.dataService.editedProdMinusEditedCons$.next(differenceRounded)
    })

    // Init data at first edition
    let data = this._pantagruelData.getValue()

    // Add all lines at a bus coord at each modification of editedBus
    // Shown in html only if value is not the same as original
    this.editsService.mapService.dataService.editedBus$.subscribe((buses: Bus[]) => {

      // if dataService.editedBus$ has been reset "No change" is shown and reload actual data (edited after Calculate button)
      if (buses.length==0){
        this.editsService.editionMade = false
        data = this._pantagruelData.getValue()
      }

      this.editedBusPoint = []
      buses.forEach((b) => {
        const busPoint: BusPoint = {bus: b, lines: [], transfo: []}
        Object.keys(data.branch).forEach((br) => {
          if (data.branch[br].transformer) {
            if (b.index == data.branch[br].fromBus.index || b.index == data.branch[br].toBus.index) {
              busPoint.transfo.push(data.branch[br])
            }
          } else {
            if (b.index == data.branch[br].fromBus.index || b.index == data.branch[br].toBus.index) {
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
    const request = this.flow+"/"+this.current+"_"+this.flow
    this.editsService.mapService.askData(request)
    this.editsService.mapService.map.closePopup()
  }

  /**
   * Handle click on title of the title (of the card)
   * or on a bus element in edits list
   * It's simulated the click on the bus concerned (open popup, center)
   * @param bus
   */
  public goToBus(bus: Bus): void{
    const marker = this.editsService.mapService.busService.busMarkers[bus.index]
    marker.fireEvent('click');
  }

  /**
   * Handle click on a line in edits list
   * It's simulated the click on the line concerned (open popup, center)
   * @param line
   */
  public goToLine(line: Branch): void{
    const marker = this.editsService.mapService.branchService.branchMarker[line.index]
    marker.fireEvent('click');
  }

  /**
   * Handle the cancellation of a load modification
   * @param load
   * @param bus
   */
  public handleButtonCancelEditLoad(load: Load, bus: Bus): void{
    load.newConsumeMW = load.originalConsumeMW
    this.editsService.saveLoad(load, bus)
  }

  /**
   * Handle the cancellation of a gen modification
   * @param gen
   * @param bus
   */
  public handleButtonCancelEditGen(gen: Gen, bus: Bus): void{
    gen.newProduceMW = gen.originalProduceMW
    this.editsService.saveGen(gen, bus)
  }

  /**
   * Handle the cancellation of a branch (line, transformer) modification
   * @param branch
   */
  public handleButtonCancelEditBranch(branch: Branch): void{
    this.editsService.toggleBranch(branch, branch.originalStatus == 1)
  }
}
