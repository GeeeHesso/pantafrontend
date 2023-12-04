import {Inject, Injectable} from '@angular/core'
import { Branch } from '../models/branch.model'
import { MapService } from './map.service'
import {Load} from "../models/load.model";
import {PANTAGRUEL_DATA} from "../core.const";
import {BehaviorSubject} from "rxjs";
import {Pantagruel} from "../models/pantagruel";
import {Bus} from "../models/bus.model";
import {Gen} from "../models/gen.model";

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

  constructor(public mapService: MapService,
              @Inject(PANTAGRUEL_DATA) protected _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}

  /**
   * Cancel edition:
   * boolean value change, map is reset and panel close
   */
  public cancelEdit(): void  {
    this.editMode = false
    this.editionMade = false

    this.mapService.resetData()
    const editsSidenav: HTMLElement = document.getElementById('btnEditsSidenav') as HTMLElement
    this.mapService.dataService.editedBus$.next([])
    this.mapService.dataService.resetTotalEditedProdCons()

    editsSidenav.click()
  }

  public handleEditMode(): void  {
    this.editMode = true
    this.handleSidenavInEditMode()
  }

  public handleSidenavInEditMode(): void  {
    this.sidenavOpened = 'editsmade'
    const editsSidenav: HTMLElement = document.getElementById('btnEditsSidenav') as HTMLElement
    editsSidenav.click()
  }

  public toggleBranch(branch: Branch, e: boolean): void {
    const branchStatus = e ? 1 : 0
    // Handle edits panel
    if (branchStatus != branch.br_status) {
      this.handleSidenavInEditMode()
      this.editionMade = true
    }

    //Change value
    if (branchStatus) {
      branch.br_status = 1
      branch.loadInjected = branch.oldLoadInjected
      branch.totalPowerMW = branch.oldTotalPowerMW
    } else {
      branch.br_status = 0
      branch.loadInjected = 0
      branch.totalPowerMW = 0
    }

    // Edit side panel with all modification
    if (branchStatus !== branch.originalStatus) {
      const editedBus = this.mapService.dataService.editedBus$.getValue();
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
      if (this.mapService.dataService.isSameAsOriginal(branch.toBus.index)){
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b,i)=>{
          if (b.index == branch.toBus.index){
            editedBus.splice(i,1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
      if (this.mapService.dataService.isSameAsOriginal(branch.fromBus.index)){
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        editedBus.forEach((b,i)=>{
          if (b.index == branch.fromBus.index){
            editedBus.splice(i,1)
          }
        })
        this.mapService.dataService.editedBus$.next(editedBus)
      }
    }

  }

  public saveGen(gen: Gen, bus: Bus): void {
    if (gen.newProduceMW > gen.maxMW) {
      gen.newProduceMW = gen.maxMW
    }
    if (gen.newProduceMW !== gen.produceMW) {
      this.editionMade = true

      // Balance between production and consumption
      const difference = gen.produceMW - gen.newProduceMW
      const newTotal = this.mapService.dataService.editedTotalProd$.getValue() - Math.round(difference*100)/100
      this.mapService.dataService.editedTotalProd$.next(Math.round(newTotal*100)/100)

      // Edit the displayed value
      const data = this._pantagruelData.getValue()
      Object.keys(data.gen).forEach((g) => {
        if (gen.index == data.gen[g].index) {
          data.gen[g].produceMW = gen.newProduceMW
          data.gen[g].pg = gen.newProduceMW / data.baseMVA
          return
        }
      })
      this._pantagruelData.next(data)
      this.mapService.drawOnMap()

      // Edit side panel with all modification
      if (gen.newProduceMW !== gen.originalProduceMW) {
        const editedBus = this.mapService.dataService.editedBus$.getValue()
        let alreadyEdited = false
        editedBus.forEach((b)=>{
          if (b.index == gen.gen_bus){
            alreadyEdited = true
            this.mapService.dataService.editedBus$.next(editedBus)
          }
        })
        if (!alreadyEdited){
          editedBus.push(bus)
          this.mapService.dataService.editedBus$.next(editedBus)
        }
      } else {
        if (this.mapService.dataService.isSameAsOriginal(gen.gen_bus)){
          const editedBus = this.mapService.dataService.editedBus$.getValue()
          editedBus.forEach((b,i)=>{
            if (b.index == gen.gen_bus){
              editedBus.splice(i,1)
            }
          })
          this.mapService.dataService.editedBus$.next(editedBus)
        }
      }

      this.handleSidenavInEditMode()
    }
  }

  public saveLoad(load: Load, bus: Bus): void {
    const _maxValue = 1000
    if (load.newConsumeMW > _maxValue) {
      load.newConsumeMW = _maxValue
    }
    if (load.newConsumeMW !== load.consumeMW) {
      this.editionMade = true

      // Balance between production and consumption
      const difference = (load.consumeMW - load.newConsumeMW)
      const newTotal = this.mapService.dataService.editedTotalCons$.getValue() - Math.round(difference*100)/100
      this.mapService.dataService.editedTotalCons$.next(Math.round(newTotal*100)/100)

      // Edit the displayed value
      const data = this._pantagruelData.getValue()
      Object.keys(data.load).forEach((l) => {
        if (load.index == data.load[l].index) {
          data.load[l].consumeMW = load.newConsumeMW
          data.load[l].pd = load.newConsumeMW / data.baseMVA
          return
        }
      })
      this._pantagruelData.next(data)
      this.mapService.drawOnMap()

      // Edit side panel with all modification
      if (load.newConsumeMW !== load.originalConsumeMW) {
        const editedBus = this.mapService.dataService.editedBus$.getValue();
        let alreadyEdited = false
        editedBus.forEach((b)=>{
          if (b.index == load.load_bus){
            alreadyEdited = true
          }
        })
        if (!alreadyEdited){
          editedBus.push(bus)
          this.mapService.dataService.editedBus$.next(editedBus)
        }
      }else {
        if (this.mapService.dataService.isSameAsOriginal(load.load_bus)){
          const editedBus = this.mapService.dataService.editedBus$.getValue()
          editedBus.forEach((b,i)=>{
            if (b.index == load.load_bus){
              editedBus.splice(i,1)
            }
          })
          this.mapService.dataService.editedBus$.next(editedBus)
        }
      }

      this.handleSidenavInEditMode()
    }
  }
}
