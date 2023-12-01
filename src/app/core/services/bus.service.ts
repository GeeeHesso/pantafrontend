import { Injectable } from '@angular/core'
import { NgElement, WithProperties } from '@angular/elements'
import * as L from 'leaflet'
import {CircleMarker, LatLng, LatLngExpression} from 'leaflet'
import { MapPopupBusComponent } from '../../component/3-map-popup-bus/map-popup-bus.component'
import {
  DEFAULT_COLOR_BUS,
  DEFAULT_COLOR_GEN,
  DEFAULT_SIZE_GEN,
  DEFAULT_SIZE_LOAD,
  INACTIVE_COLOR,
} from '../core.const'
import { Bus } from '../models/bus.model'
import { Gen } from '../models/gen.model'
import { Pantagruel } from '../models/pantagruel'
import { DataService } from './data.service'

/**
 * Draw buses, laods and gens
 */
@Injectable({
  providedIn: 'root',
})
export class BusService {
  private _sizeGen = DEFAULT_SIZE_GEN
  private _colorGen = DEFAULT_COLOR_GEN
  private _zoomFactor = 0.6 // Factor multiplying zoom value for relative size of gen and load
  public busMarkers : CircleMarker[] = []

  constructor(private _dataService: DataService) {}

  /**
   * Draw bus (simple grey disk) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   */
  public drawBus(map: L.Map, data: Pantagruel): void {
    Object.keys(data.bus).forEach((b) => {
      //Position: WARNING lat long reverse, so [1][0]
      const latLng: LatLngExpression = [data.bus[b].coord[1], data.bus[b].coord[0]]

      // Color
      const color = data.bus[b].status == 1 ? DEFAULT_COLOR_BUS : INACTIVE_COLOR

      // Define icon
      const busIcon = L.circleMarker(latLng, {
        radius: 2,
        pane: 'markerPane', // explicit position,
        fillColor: color,
        fillOpacity: 0.5,
        // invisible stroke to easily click on it
        color: INACTIVE_COLOR,
        opacity: 0,
        weight: 15,
      })
      // Link popup to the icon
      busIcon.bindPopup(() => this._createPopupWithTab(data, data.bus[b]))

      // Center element when clicked
      busIcon.addEventListener('click', function () {
        const bounds = map.getBounds()
        const offset = (bounds.getNorthWest().lat - bounds.getSouthWest().lat) / 5

        const center = new LatLng(latLng[0] + offset, latLng[1])
        map.panTo(center)
      })

      // Add icon to the map
      this.busMarkers[data.bus[b].index] = busIcon.addTo(map)
    })
  }

  /**
   * Draw load (circle) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showSize boolean to define a proportional size or not (population)
   */
  public drawLoad(map: L.Map, data: Pantagruel, showSize: boolean): void {
    const zoom = map.getZoom()
    Object.keys(data.load).forEach((l) => {
      //Position
      const latlon: LatLngExpression = [data.load[l].coord[0], data.load[l].coord[1]]
      const loadIcon = L.circleMarker(latlon, {
        radius: showSize
          ? this._getSizeProportionalMax(data.load[l].pop, this._dataService.BUS_MAX_POP)/2 + zoom*this._zoomFactor
          : DEFAULT_SIZE_LOAD + zoom*this._zoomFactor,
        pane: 'shadowPane',
      })

      // Style
      if (data.bus[data.load[l].load_bus].status == 0) {
        console.warn('Inactive load: ' + data.load[l].index)
        loadIcon.setStyle({
          fillColor: INACTIVE_COLOR,
          color: INACTIVE_COLOR,
          fillOpacity: 0.3,
          opacity: 1,
          weight: 0.5,
        })
      } else
        loadIcon.setStyle({
          fillColor: 'grey',
          color: 'black',
          fillOpacity: 0.1,
          opacity: 1,
          weight: 0.5,
        })

      loadIcon.addTo(map)
    })
  }

  /**
   * Draw generators (square) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showIcon boolean to construct different icon (actual production)
   * @param showSize boolean to construct proportional size (max production)
   * @param showColor boolean to construct icon with different color (category)
   */
  public drawGen(map: L.Map, data: any, showIcon: boolean, showSize: boolean, showColor: boolean): void {
    const zoom = map.getZoom()
    Object.keys(data.gen).forEach((g) => {
      if (showSize) {
        this._sizeGen =
          this._getSizeProportionalMax(data.gen[g].maxMW, this._dataService.GEN_MAX_MAX_PROD) + zoom*this._zoomFactor
      } else {
        this._sizeGen = DEFAULT_SIZE_GEN + zoom*this._zoomFactor
      }

      // Color and type of icon (with cross inactive, full >94, half 6<X<94, empty <6)
      if (showColor) {
        this._colorGen = this._getColorOfGen(data.gen[g])
      } else {
        this._colorGen = DEFAULT_COLOR_GEN
      }

      let svgHtml: string = this._constructFullSquareSVG(data.gen[g])
      if (showIcon) {
        if (data.gen[g].gen_status == 0) {
          console.warn('Inactive gen: ' + data.gen[g].index)
          svgHtml = this._constructCrossSquareSVG(data.gen[g])
        } else if ((data.gen[g].pg / data.gen[g].pmax) * 100 > 94) {
          svgHtml = this._constructFullSquareSVG(data.gen[g])
        } else if ((data.gen[g].pg / data.gen[g].pmax) * 100 < 6) {
          svgHtml = this._constructStrokeSquareSVG(data.gen[g])
        } else {
          svgHtml = this._constructHalfStrokeSquareSVG(data.gen[g])
        }
      }

      // Size of icon
      const svgIcon = L.divIcon({
        html: svgHtml,
        className: 'svg-icon',
        //iconSize: [this._sizeGen, this._sizeGen],
        iconAnchor: [this._sizeGen / 2, this._sizeGen / 2],
        popupAnchor: [0, 0],
      })
      const genIcon = L.marker(data.gen[g].coord, {
        icon: svgIcon,
        pane: 'shadowPane', // important to force bus go over svg (to bind popup)
      })

      genIcon.addTo(map)
    })
  }

  /**
   * Popup with bus information construction
   * @param data
   * @param bus
   * @private
   */
  private _createPopupWithTab(data: any, bus: Bus): NgElement {
    const popupBusEl: NgElement & WithProperties<MapPopupBusComponent> = document.createElement(
      'popup-bus-element',
    ) as any
    // Listen to the close event
    popupBusEl.addEventListener('closed', () => document.body.removeChild(popupBusEl))

    popupBusEl.transformers = []
    Object.keys(data.branch).forEach((br) => {
      if (data.branch[br].transformer) {
        if (bus.index == data.branch[br].fromBus.index || bus.index == data.branch[br].toBus.index) {
          popupBusEl.transformers.push(data.branch[br])
        }
      }
    })

    popupBusEl.buses = []
    popupBusEl.buses.push(bus)
    // Search bus at the same coordinates
    Object.keys(data.bus).forEach((b) => {
      if (data.bus[b].coord.toString() == bus.coord.toString() && data.bus[b].index != bus.index) {
        popupBusEl.buses.push(data.bus[b])
        // Search transfomer at this new  bus
        Object.keys(data.branch).forEach((tr) => {
          // if it's a transformer
          if (data.branch[tr].transformer) {
            // if it is not already in list of transfomer
            if(!popupBusEl.transformers.some(t => t.index == data.branch[tr].index)){
              // if the bus index equal to from or to index bus of the transformer
              if ((data.bus[b].index == data.branch[tr].fromBus.index || data.bus[b].index == data.branch[tr].toBus.index)) {
                popupBusEl.transformers.push(data.branch[tr])
              }
            }
          }
        })
      }
    })


    document.body.appendChild(popupBusEl)
    return popupBusEl
  }

  /**
   * Calculate the size of an element according to max
   * @param val
   * @param maxValue
   * @private
   */
  private _getSizeProportionalMax(val: number, maxValue: number): number {
    let size = (val / maxValue) * 100
    if (size < 2) {
      //console.log("<1: "+ size)
      // set a min
      size = 2
    } else if (size > 10) {
      //console.log(">10: "+ size)
      size = 10
    } else {
      //console.log(size)
    }
    return size
  }

  /**
   * Define the color of a gen based on his category
   * @param gen
   * @private
   */
  private _getColorOfGen(gen: Gen): string {
    let color = '#000000'
    if (gen.category == 'C') color = '#ac4022'
    else if (gen.category == 'F') color = '#afafaf'
    else if (gen.category == 'G') color = '#ff9f36'
    else if (gen.category == 'H') color = '#008cff'
    else if (gen.category == 'N') color = '#ff0000'
    else if (gen.category == 'O') color = '#a233ff'
    else if (gen.category == 'R') color = '#6aff43'
    else if (gen.category == 'X') color = '#000000'

    return color
  }

  /**
   * Generator SVG object when it is more than 94
   * @param gen
   * @private
   */
  private _constructFullSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" fill="` +
      this._colorGen +
      `"></rect>
        </svg>`
    )
  }

  /**
   * Generator SVG object when it is inactive (stroke colored)
   * @param gen
   * @private
   */
  private _constructCrossSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:2;fill-opacity:1;stroke-opacity:1"></rect>
        <path d="M 0 ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0 L ` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      `" style="stroke:` +
      this._colorGen +
      `;stroke-width:1;fill-opacity:0;stroke-opacity:1"></path>
        <path d="M 0 0 L` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0" style="stroke:` +
      this._colorGen +
      `;stroke-width:1;fill-opacity:0;stroke-opacity:1"></path>
        </svg>`
    )
  }

  /**
   * Generator SVG object when it is between 6 and 94 % (stroke colored)
   * @param gen
   * @private
   */
  private _constructHalfStrokeSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:2;fill-opacity:1;stroke-opacity:1"></rect>
        <path d="M 0 ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0 L ` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      `" fill="` +
      this._colorGen +
      `"></path>
        </svg>`
    )
  }

  /**
   * Generator SVG object when it is less than 6% (stroke colored)
   * @param gen
   * @private
   */
  private _constructStrokeSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
       <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:3;fill-opacity:1;stroke-opacity:1"></rect>
    </svg>`
    )
  }
}
