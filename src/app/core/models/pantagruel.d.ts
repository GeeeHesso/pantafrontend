import {Bus} from "./bus.model";
import {Gen} from "./gen.model";
import {Branch} from "./branch.model";
import {Load} from "./load.model";

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


