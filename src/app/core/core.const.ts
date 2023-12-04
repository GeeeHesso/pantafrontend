import { InjectionToken } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Pantagruel } from './models/pantagruel'
import {MapOptions} from "./models/options.model";
import {LatLng} from "leaflet";

export const URL_LOCAL_GRID = '/assets/data/pantagruelDate.json'

export const INACTIVE_COLOR = '#ffffff'
export const DEFAULT_SIZE_GEN = 5
export const DEFAULT_COLOR_GEN = '#000000'
export const DEFAULT_SIZE_LOAD = 2.5
export const DEFAULT_WIDTH_BRANCH = 1
export const DEFAULT_COLOR_BRANCH = '#B5B5B5'
export const DEFAULT_COLOR_BUS = '#757575'

export const PANTAGRUEL_DATA = new InjectionToken<BehaviorSubject<Pantagruel>>(
  'pantagruel.data.token',
)

export const DEFAULT_OPTIONS: MapOptions = new MapOptions(
  false,
  true,
  true,
  true,
  true,
  true,
  false,
  false,
  false,
  true,
  false,
  false,
  6,
  new LatLng(48, 10),
  false
)
