import {Inject, Injectable} from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Branch } from '../models/branch.model'
import { Bus } from '../models/bus.model'
import { Gen } from '../models/gen.model'
import { Pantagruel } from '../models/pantagruel'
import {PANTAGRUEL_DATA} from "../core.const";
import {Load} from "../models/load.model";
import {Country} from "../models/country.model";
import {ALPHA_COUNTRY} from "../../../assets/data/ISO_3166-1_alpha-2";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Data Service is called by map Service
 *                       to calculate min and max of the current data set
 *                       and construct a date with value of current data set
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 08/08/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 07/11/2023		Gwenaëlle Gustin		bug fixed: list of edits after recalculate
 *
 ******************************************************************/
@Injectable({
  providedIn: 'root',
})
export class DataService {
  public BUS_MAX_POP!: number
  public BUS_MIN_POP!: number
  public GEN_MAX_MAX_PROD!: number // the higher value of field max prod of gen
  public GEN_MIN_MAX_PROD!: number // the lowest value of field max prod of gen
  public BRANCH_MIN_P_MW!: number
  public BRANCH_MAX_P_MW!: number
  public TOTAL_PROD!: number
  public TOTAL_CONS!: number
  public BASE_MVA!: number
  public COUNTRIES: Country[] = []
  public editedTotalProd$: BehaviorSubject<number> = new BehaviorSubject(0)
  public editedTotalCons$: BehaviorSubject<number> = new BehaviorSubject(0)
  public editedProdMinusEditedCons$: BehaviorSubject<number> = new BehaviorSubject(0)
  public currentDateTime$: BehaviorSubject<Date> = new BehaviorSubject(new Date())
  public editedBus$: BehaviorSubject<Bus[]> = new BehaviorSubject<Bus[]>([])

  constructor(
    @Inject(PANTAGRUEL_DATA) protected _pantagruelData: BehaviorSubject<Pantagruel>
  ) {}

  /**
   * Calculate the constant of a Pantagruel data set
   * @param data Pantagruel received file
   */
  public setConstOfDataSet(data: Pantagruel): void {
    this.BUS_MAX_POP = this._setBusMaxPopulation(data.bus)
    this.BUS_MIN_POP = this._setBusMinPopulation(data.bus)
    this.GEN_MAX_MAX_PROD = this._setGenMaxOfMaxProduction(data.gen)
    this.GEN_MIN_MAX_PROD = this._setGenMinOfMaxProduction(data.gen)
    this.BRANCH_MAX_P_MW = this._setBranchMaxPf(data.branch)
    this.BRANCH_MIN_P_MW = this._setBranchMinPf(data.branch)
    this.BASE_MVA = data.baseMVA
    this._setCountries(data)
    this.setTotalProdCons(data)
  }

  /**
   * Change date time base on data set receive
   * @param data Pantagruel received file
   */
  public setDateOfDataSet(data: Pantagruel): void {
      let dateTime = new Date(data.date.year, data.date.month - 1, data.date.day, data.date.hour)
      this.currentDateTime$.next(dateTime)
  }


  /**
   * Find the max population value of buses
   * @param buses
   * @private
   */
  private _setBusMaxPopulation(buses: { [key: string]: Bus }): number {
    let max: number = 0
    Object.keys(buses).forEach((b) => {
      if (max < buses[b].population) {
        max = buses[b].population
      }
    })
    return Math.round(max)
  }

  /**
   * Find the min population value of buses
   * @param buses
   * @private
   */
  private _setBusMinPopulation(buses: { [key: string]: Bus }): number {
    let min: number = this.BUS_MAX_POP
    Object.keys(buses).forEach((b) => {
      if (min > buses[b].population) {
        min = buses[b].population
      }
    })
    return Math.round(min)
  }

  /**
   * Find the highest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMaxOfMaxProduction(gens: { [key: string]: Gen }): number{
    let max: number = 0
    Object.keys(gens).forEach((b) => {
      if (max < gens[b].maxMW) {
        max = gens[b].maxMW
      }
    })
    return max
  }

  /**
   * Find the smallest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMinOfMaxProduction(gens: { [key: string]: Gen }): number {
    let min: number = this.GEN_MAX_MAX_PROD
    Object.keys(gens).forEach((b) => {
      if (min > gens[b].maxMW) {
        min = gens[b].maxMW
      }
    })
    return min
  }

  /**
   * Find the highest value among the thermal limits of the lines
   * @param branches
   * @private
   */
  private _setBranchMaxPf(branches: { [key: string]: Branch }): number {
    let max: number = 0
    Object.keys(branches).forEach((b) => {
      if (max < branches[b].thermalRatingMW) {
        max = branches[b].thermalRatingMW
      }
    })
    return Math.round(max)
  }

  /**
   * Find the smallest value among the thermal limits of the lines
   * @param branches
   * @private
   */
  private _setBranchMinPf(branches: { [key: string]: Branch }): number {
    let min: number = this.BRANCH_MAX_P_MW
    Object.keys(branches).forEach((b) => {
      if (min > branches[b].thermalRatingMW) {
        min = branches[b].thermalRatingMW
      }
    })
    return Math.round(min)
  }

  /**
   * Set totals of production and consumption and copy to the edited value (to initialise)
   * @param data
   * @private
   */
  private setTotalProdCons(data: Pantagruel): void {
    this.TOTAL_PROD = this._getTotalProduction(data.gen)
    this.TOTAL_CONS = this._getTotalConsumption(data.load)
    this.resetTotalEditedProdCons()
  }

  /**
   * Reset edited total of production and consumption
   */
  public resetTotalEditedProdCons(){
    this.editedTotalProd$.next(Math.round((this.TOTAL_PROD+ Number.EPSILON) * 100) / 100)
    this.editedTotalCons$.next(Math.round((this.TOTAL_CONS+ Number.EPSILON) * 100) / 100)
  }

  /**
   * Calculate the sum of all production of gens
   * @param gens
   * @private
   */
  private _getTotalProduction(gens: { [key: string]: Gen }): number {
    let total: number = 0
    Object.keys(gens).forEach((b) => {
      total = total + gens[b].pg
    })
    return total * this.BASE_MVA
  }

  /**
   * Calculate the sum of all consumption of loads
   * @param loads
   * @private
   */
  private _getTotalConsumption(loads: { [key: string]: Load }): number {
    let total: number = 0
    Object.keys(loads).forEach((l) => {
      total = total + loads[l].pd
    })
    return total * this.BASE_MVA
  }

  /**
   * Return false if one element attached to the given bus has been edited
   * @param indexBus
   */
  public isSameAsOriginal(indexBus: number): boolean{
    const editedBus = this.editedBus$.getValue()
    let isSameAsOriginal = true

    // Get all branch (line, transformer) connect to the bus
    const branchs: Branch[] = []
    const data = this._pantagruelData.getValue()
    Object.keys(data.branch).forEach((br) => {
      if (indexBus == data.branch[br].fromBus.index || indexBus == data.branch[br].toBus.index) {
        branchs.push(data.branch[br])
      }
    })

    editedBus.forEach((b)=>{
      if (b.index == indexBus){
        b.gens.forEach((g)=>{
          if (g.originalProduceMW != g.newProduceMW){
            isSameAsOriginal = false
          }
        })
        b.loads.forEach((l)=>{
          if (l.originalConsumeMW != l.newConsumeMW){
            isSameAsOriginal = false
          }
        })
        branchs.forEach((br)=>{
          if (br.originalStatus != br.br_status){
            isSameAsOriginal = false
          }
        })
      }
    })
    return isSameAsOriginal
  }

  /**
   * Calculate sum of production by country
   * @param data
   * @private
   */
  private _setCountries(data: Pantagruel) {
    this.COUNTRIES = []
    Object.keys(data.load).forEach((l) => {
      Object.keys(data.bus).forEach((b)=>{
        if (data.bus[b].index == data.load[l].load_bus){
          let index = this.COUNTRIES.findIndex(x => x.alpha == data.bus[b].country)
          if (index === -1){
            // @ts-ignore
            const countryName: string = ALPHA_COUNTRY[data.bus[b].country]
            index = this.COUNTRIES.push({alpha: data.bus[b].country, countryName: countryName, pd: 0, qd: 0 }) -1
          }
          this.COUNTRIES[index].pd = this.COUNTRIES[index].pd + data.load[l].pd
          //this.COUNTRIES[index].qd = this.COUNTRIES[index].qd + data.load[l].qd
          return
        }
      })
    })
    this.COUNTRIES.forEach((c) => {
      c.pd = Math.round(c.pd * this.BASE_MVA)
    })
  }
}
