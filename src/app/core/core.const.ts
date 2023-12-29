import { InjectionToken } from '@angular/core'
import { LatLng } from 'leaflet'
import { BehaviorSubject } from 'rxjs'
import { MapOptions } from './models/options.model'
import { Pantagruel } from './models/pantagruel'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 13/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
export const URL_LOCAL_GRID = './assets/pantagruelLocal.json'

export const DEFAULT_COLOR = '#757575'
export const DEFAULT_COLOR_BLACK = '#000000'
export const INACTIVE_COLOR = '#ffffff'
export const DEFAULT_SIZE_GEN = 5
export const DEFAULT_SIZE_LOAD = 2.5
export const DEFAULT_WIDTH_BRANCH = 1

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
  false,
  false,
)
