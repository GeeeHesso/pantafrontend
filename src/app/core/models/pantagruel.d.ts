import {Bus} from "./bus.model";
import {Gen} from "./gen.model";
import {Branch} from "./branch.model";
import {Load} from "./load.model";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
export interface Pantagruel {
  bus: {[key: string]: Bus }
  name: string
  dcline: {}
  gen: {[key: string]: Gen }
  branch: {[key: string]: Branch }
  storage: {}
  switch: {}
  multinetwork: boolean
  baseMVA: number
  per_unit: boolean
  shunt: {}
  multiinfrastructure: boolean
  load: {[key: string]: Load }
  date: {day: number, month: number, year: number, hour: number}
  country: {[key:string]: {pd: number, qd: number}}
}


