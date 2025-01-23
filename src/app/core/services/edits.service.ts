import { Inject, Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { MAX_CONS, PANTAGRUEL_DATA } from '../../core/core.const'
import { Branch } from '../models/branch.model'
import { Bus } from '../models/bus.model'
import { Gen } from '../models/gen.model'
import { Load } from '../models/load.model'
import { Pantagruel } from '../models/pantagruel'
import { MapService } from './map.service'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Manage the edits sidenav and the edition of branches/transformers
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Manage the edits sidenav and the edition of branches/transformateur
 ******************************************************************/
@Injectable({ providedIn: 'root' })
export class EditsService {
  public editMode: boolean = false
  public editionMade: boolean = false
  public sidenavOpened: String = 'none'

  constructor(
    public mapService: MapService,
    @Inject(PANTAGRUEL_DATA) protected _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}

  /**
   * Cancel edition:
   * boolean value change, map is reset and panel close
   */
  public cancelEdit(): void {
    this.editMode = false
    this.editionMade = false

    this.mapService.resetData()
    const editsSidenav: HTMLElement = document.getElementById('btnEditsSidenav') as HTMLElement
    this.mapService.dataService.editedBus$.next([])
    this.mapService.dataService.resetTotalEditedProdCons()

    editsSidenav.click()
  }

  public handleEditMode(): void {
    this.editMode = true
    this.handleSidenavInEditMode()
  }

  public handleSidenavInEditMode(): void {
    this.sidenavOpened = 'editsmade'
    const editsSidenav: HTMLElement = document.getElementById('btnEditsSidenav') as HTMLElement
    editsSidenav.click()
  }

  public toggleBranch(branch: Branch, isActive: boolean): void {
    const newBranchStatus = isActive ? 1 : 0
    // Handle edits panel
    if (newBranchStatus != branch.br_status) {
      this.handleSidenavInEditMode()
      this.editionMade = true
    }

    //Change value
    if (newBranchStatus) {
      branch.br_status = 1
      branch.loadInjected = branch.originalLoadInjected
      branch.totalPowerMW = branch.originalTotalPowerMW
    } else {
      branch.br_status = 0
      branch.loadInjected = 0
      branch.totalPowerMW = 0
    }

    this.updateSidePanelAfterBranchEdit(branch, newBranchStatus)
  }

  public updateSidePanelAfterBranchEdit(branch: Branch, newBranchStatus: number) {
    // Edit side panel with all modification
    if (newBranchStatus !== branch.originalStatus) {
      const editedBus = this.mapService.dataService.editedBus$.getValue()
      let fromAlreadyEdited = false
      let toAlreadyEdited = false
      editedBus.forEach((b) => {
        if (b.index == branch.fromBus.index) {
          fromAlreadyEdited = true
        }
        if (b.index == branch.toBus.index) {
          toAlreadyEdited = true
        }
      })
      if (!fromAlreadyEdited) {
        editedBus.push(branch.fromBus)
        this.mapService.dataService.editedBus$.next(editedBus)
      }
      if (!toAlreadyEdited) {
        editedBus.push(branch.toBus)
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    } else {
      if (this.mapService.dataService.isSameAsOriginal(branch.toBus.index)) {
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b, i) => {
          if (b.index == branch.toBus.index) {
            editedBus.splice(i, 1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
      if (this.mapService.dataService.isSameAsOriginal(branch.fromBus.index)) {
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b, i) => {
          if (b.index == branch.fromBus.index) {
            editedBus.splice(i, 1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    }
  }

  public onChangeSliderGen(gen: Gen, bus: Bus, e: Event) {
    gen.produceMW = Math.round((parseInt((e.target as HTMLInputElement).value) / 100) * gen.maxMW)
    if (gen.produceMW > 0) {
      gen.gen_status = 1
    }

    this.updateSidePanelAfterGenEdit(gen, bus)
  }

  public updateSidePanelAfterGenEdit(gen: Gen, bus: Bus): void {
    if (gen.produceMW > gen.maxMW) {
      gen.produceMW = gen.maxMW
    }

    // Balance between production and consumption
    const difference = Math.abs(gen.originalProduceMW - gen.produceMW)
    const newTotal = this.mapService.dataService.TOTAL_PROD + Math.round(difference * 100) / 100
    this.mapService.dataService.editedTotalProd$.next(Math.round(newTotal * 100) / 100)

    // Edit side panel with all modification
    if (gen.produceMW !== gen.originalProduceMW) {
      this.editionMade = true

      const editedBus = this.mapService.dataService.editedBus$.getValue()
      let alreadyEdited = false
      editedBus.forEach((b) => {
        if (b.index == gen.gen_bus) {
          alreadyEdited = true
          this.mapService.dataService.editedBus$.next(editedBus)
        }
      })
      if (!alreadyEdited) {
        editedBus.push(bus)
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    } else {
      if (this.mapService.dataService.isSameAsOriginal(gen.gen_bus)) {
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b, i) => {
          if (b.index == gen.gen_bus) {
            editedBus.splice(i, 1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    }
    this.handleSidenavInEditMode()
  }

  //@todo implement with "(change)="editsService.updateMapAfterGenEdit(gen)" in both input of slider
  public updateMapAfterGenEdit(gen: Gen) {
    //Edit the displayed value
    const data = this._pantagruelData.getValue()
    Object.keys(data.gen).forEach((g) => {
      if (gen.index == data.gen[g].index) {
        data.gen[g].produceMW = gen.produceMW
        data.gen[g].pg = gen.produceMW / data.baseMVA
        return
      }
    })
    this._pantagruelData.next(data)
    this.mapService.drawOnMap()
  }

  public onChangeSliderLoad(load: Load, bus: Bus, e: Event) {
    load.consumeMW = Math.round((parseInt((e.target as HTMLInputElement).value) / 100) * 1000)
    if (load.consumeMW > 0) {
      load.status = 1
    }
    this.updateSidePanelAfterLoadEdit(load, bus)
  }

  public updateSidePanelAfterLoadEdit(load: Load, bus: Bus): void {
    if (load.consumeMW > MAX_CONS) {
      load.consumeMW = MAX_CONS
    }

    // Balance between production and consumption
    const difference = Math.abs(load.consumeMW - load.originalConsumeMW)
    const newTotal = this.mapService.dataService.TOTAL_CONS + Math.round(difference * 100) / 100
    this.mapService.dataService.editedTotalCons$.next(Math.round(newTotal * 100) / 100)

    // Edit side panel with all modification
    if (load.consumeMW !== load.originalConsumeMW) {
      this.editionMade = true

      const editedBus = this.mapService.dataService.editedBus$.getValue()
      let alreadyEdited = false
      editedBus.forEach((b) => {
        if (b.index == load.load_bus) {
          alreadyEdited = true
        }
      })
      if (!alreadyEdited) {
        editedBus.push(bus)
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    } else {
      if (this.mapService.dataService.isSameAsOriginal(load.load_bus)) {
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b, i) => {
          if (b.index == load.load_bus) {
            editedBus.splice(i, 1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    }

    this.handleSidenavInEditMode()
  }

  //@todo implement with "(change)="editsService.updateMapAfterLoadEdit(gen)" in both input of slider
  public updateMapAfterLoadEdit(load: Load) {
    const data = this._pantagruelData.getValue()
    Object.keys(data.load).forEach((l) => {
      if (load.index == data.load[l].index) {
        data.load[l].consumeMW = load.consumeMW
        data.load[l].pd = load.consumeMW / data.baseMVA
        return
      }
    })
    this._pantagruelData.next(data)
    this.mapService.drawOnMap()
  }
}
