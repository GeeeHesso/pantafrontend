import { Injectable } from '@angular/core'
import { NgElement, WithProperties } from '@angular/elements'
import * as L from 'leaflet'
import 'leaflet-polylinedecorator'
import { MapPopupBranch } from '../../component/3-map-popup-branch/map-popup-branch'
import { DEFAULT_COLOR_BRANCH, DEFAULT_WIDTH_BRANCH, INACTIVE_COLOR } from '../core.const'
import { Branch } from '../models/branch.model'
import { Pantagruel } from '../models/pantagruel'
import {LatLng, Polyline} from "leaflet";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Draw branches and transformers
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
@Injectable({
  providedIn: 'root',
})
export class BranchService {
  public branchMarker : Polyline[] = []

  constructor() {}

  /**
   * Draw each branches/lines on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showColor boolean to show color of branch (actual load)
   * @param showWidth boolean to show proportional width (thermal rate)
   * @param showArrow boolean to show arrow when zoom is fairly high
   */
  public drawBranch(map: L.Map, data: Pantagruel, showColor: boolean, showWidth: boolean, showArrow: boolean): void {
    const zoom = map.getZoom()

    // Draw all the branches
    Object.keys(data.branch).forEach((b) => {
      //Position: WARNING lat long reverse, so [1][0]
      const pointA = new L.LatLng(data.branch[b].fromBus.coord[1], data.branch[b].fromBus.coord[0])
      const pointB = new L.LatLng(data.branch[b].toBus.coord[1], data.branch[b].toBus.coord[0])
      const pointList = [pointA, pointB]

      // Style of line
      const weight = showWidth ? this._getWidth(data.branch[b].rate_a) : DEFAULT_WIDTH_BRANCH
      const color = showColor ? this._getColorOfBranch(data.branch[b]) : DEFAULT_COLOR_BRANCH

      // Define line
      const branch = new L.Polyline(pointList, {
        weight: weight + zoom/3,
        color: color,
      })

      // Draw arrow if necessary
      if (zoom > 7 && showArrow){
       const arrowHead = L.polylineDecorator(branch, {
          patterns: [
            {offset: '50%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: (weight+zoom), polygon: true, pathOptions:
                  {stroke: true, color: color}})}
          ]})
        arrowHead.bindPopup(() => this._createPopupWithTab(data, data.branch[b]))
        arrowHead.addTo(map)
      }

      // Link popup to the line
      branch.bindPopup(() => this._createPopupWithTab(data, data.branch[b]))

      // Center element when clicked
      branch.on('click', function (e: any) {
        const latLng = map.mouseEventToLatLng(e.originalEvent)

        const bounds = map.getBounds()
        const offset = (bounds.getNorthWest().lat - bounds.getSouthWest().lat) / 5

        const center = new LatLng(latLng.lat + offset, latLng.lng)
        map.panTo(center)
      })

      // Add branch to the layer
      this.branchMarker[data.branch[b].index] = branch.addTo(map)
    })

    // Draw a dashed branches over the other if  load injected > 150
    if (showColor){
      // WARNING lat long reverse, so [1][0]
      Object.keys(data.branch).forEach((b) => {
        if (data.branch[b].loadInjected > 100) {
          //Position: WARNING lat long reverse, so [1][0]
          const pointA = new L.LatLng(data.branch[b].fromBus.coord[1],data.branch[b].fromBus.coord[0])
          const pointB = new L.LatLng(data.branch[b].toBus.coord[1], data.branch[b].toBus.coord[0])
          const pointList = [pointA, pointB]

          // Style of line
          const weight = showWidth ? this._getWidth(data.branch[b].rate_a) : DEFAULT_WIDTH_BRANCH

          // Define line
          const dashedBranch = new L.Polyline(pointList, {
            weight: weight + zoom/3,
            color: 'black',
            dashArray: '5, 10',
          })

          // Link popup to the line
          dashedBranch.bindPopup(() => this._createPopupWithTab(data, data.branch[b]))

          // Center element when clicked
          dashedBranch.on('click', function (e: any) {
            const latLng = map.mouseEventToLatLng(e.originalEvent)

            const bounds = map.getBounds()
            const offset = (bounds.getNorthWest().lat - bounds.getSouthWest().lat) / 5

            const center = new LatLng(latLng.lat + offset, latLng.lng)
            map.panTo(center)
          })

          // Add branch to the layer
          dashedBranch.addTo(map)
        }
      })
    }
  }

  /**
   * Popup with branch information construction
   * @param branch
   * @param data to search branch with same coord
   * @private
   */
  private _createPopupWithTab(data: any, branch: Branch): NgElement {
    const PopupBranchEl: NgElement & WithProperties<MapPopupBranch> = document.createElement(
      'popup-branch-element',
    ) as any

    // Listen to the close event
    PopupBranchEl.addEventListener('closed', () => document.body.removeChild(PopupBranchEl))

    // Init the values
    PopupBranchEl.branchesFT = []
    PopupBranchEl.branchesTF = []
    // Add the current branch
    PopupBranchEl.branchesFT.push(branch)

    // Add branch with same coords and same direction (from to)
    Object.keys(data.branch).forEach((br) => {
      if (
        data.branch[br].fromBus.coord[0] == branch.fromBus.coord[0] &&
        data.branch[br].fromBus.coord[1] == branch.fromBus.coord[1] &&
        data.branch[br].toBus.coord[0] == branch.toBus.coord[0] &&
        data.branch[br].toBus.coord[1] == branch.toBus.coord[1] &&
        data.branch[br].index !== branch.index
      ) {
        PopupBranchEl.branchesFT.push(data.branch[br])
      }
    })

    // Add branch with same coords and opposite direction (to from)
    Object.keys(data.branch).forEach((br) => {
      if (data.branch[br].fromBus.coord[0] == branch.toBus.coord[0] &&
        data.branch[br].fromBus.coord[1] == branch.toBus.coord[1] &&
        data.branch[br].toBus.coord[0] == branch.fromBus.coord[0] &&
        data.branch[br].toBus.coord[1] == branch.fromBus.coord[1]) {
        //console.log(data.branch[br].index + ' is opposite of ' + branch.index)
        PopupBranchEl.branchesTF.push(data.branch[br])
      }
    })

    document.body.appendChild(PopupBranchEl)
    return PopupBranchEl
  }

  /**
   * Draw each transformer with SVG object on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showColor boolean to construct with color (actual load)
   */
  public drawTransformer(map: L.Map, data: Pantagruel, showColor: boolean): void {
    const zoom = map.getZoom()

    Object.keys(data.branch).forEach((b) => {
      if (data.branch[b].transformer) {
        if (
          data.branch[b].fromBus.coord[0] != data.branch[b].toBus.coord[0] ||
          data.branch[b].fromBus.coord[1] != data.branch[b].toBus.coord[1]
        ) {
          console.warn(
            'The transformer on branch ' + data.branch[b].index + ' has 2 coordinates different',
          )
        }

        //Uncomment to display one transformer > 150%
        /*if (data.branch[b].index == 8279) {
          data.branch[b].loadInjected = 150
        }*/

        // Color
        const color = showColor ? this._getColorOfBranch(data.branch[b]): DEFAULT_COLOR_BRANCH
        const strokeColor  = showColor
          ? data.branch[b].loadInjected > 100
            ? '#ff0000'
            : '#000000'
          : '#000000'

        // Construct SVG icon
        const svgHtml = this._constructTransformerSVG(color, strokeColor)
        const width = zoom/8*11
        const height = zoom/8*25
        const svgIcon = L.divIcon({
          html: svgHtml,
          className: 'svg-icon',
          iconAnchor: [width/2, height/2],
          popupAnchor: [0, 0],
          iconSize: [width, height],
        })

        // Construct icon
        //  WARNING lat long reverse, so [1][0]
        const branchIcon = L.marker(
          [data.branch[b].fromBus.coord[1], data.branch[b].fromBus.coord[0]],
          {
            icon: svgIcon,
            //icon are ordered by the load injected, -1000 is for being under bus icon (linked popup)
            zIndexOffset : data.branch[b].loadInjected - 1000
          },
        )

        // Add icon to the map
        map.addLayer(branchIcon)

      } else {
        if (
          data.branch[b].fromBus.coord[0] == data.branch[b].toBus.coord[0] &&
          data.branch[b].fromBus.coord[1] == data.branch[b].toBus.coord[1]
        ) {
          console.warn(
            'The branch ' +
            data.branch[b].index +
            ' cannot be display. The FROM coordinates are the same as the TO coordinates',
          )
        }
      }
    })
  }

  /**
   * Transformer SVG object
   * @param color inside the circle
   * @param colorStroke of the line and circle
   * @private
   */
  private _constructTransformerSVG(color: string, colorStroke: string): string {
    return (
      `<svg viewBox="0 0 22 50" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="0" width="2" height="10" style="fill:` +
      colorStroke +
      `; stroke:` +
      colorStroke +
      `;"></rect>
        <ellipse cx="11" cy="20" rx="10" ry="10" style="stroke:` +
      colorStroke +
      `; stroke-width: 2px; fill:` +
      color +
      `; fill-opacity: 0.5" ></ellipse>
        <ellipse cx="11" cy="30" rx="10" ry="10" style="stroke:` +
      colorStroke +
      `; stroke-width: 2px; fill:` +
      color +
      `; fill-opacity: 0.5" ></ellipse>
        <rect x="10" y="40" width="2" height="10" style="fill:` +
      colorStroke +
      `;" ></rect>
    </svg>`
    )
  }

  /**
   * Definition of the color of the branch/transformer
   * @param branch use to know if the object is inactive and the %
   * @private
   */
  private _getColorOfBranch(branch: Branch): string {
    // Without power
    if (isNaN(branch.loadInjected)){
      console.warn('Branch without power: ' + branch.index)
      return DEFAULT_COLOR_BRANCH
    }
    // Inactive branches
    if (branch.br_status == 0) {
      console.warn('Inactive branch: ' + branch.index)
      return INACTIVE_COLOR
    }

    const percentage = branch.loadInjected
    let r = 255
    let g = 255
    let b = 255

    if (percentage > 100) {
      return this._rgbToHex(255, 0, 0)
    }
    // if 50% --> green
    else if (percentage == 50) {
      r = 0
      b = 0
    }
    // if < 50 % --> blue to cyan
    if (percentage < 50) {
      r = 0
      // if < 25 --> blue
      if (percentage < 25) {
        g = (percentage / 25) * 255
      }
      // if 25 < X < 50 --> cyan
      else {
        b = 255 - ((percentage - 25) / 25) * 255
      }
    }
    // if > 50 % --> yellow to red
    else {
      b = 0
      // if 50 < X < 75 --> yellow
      if (percentage < 75) {
        r = ((percentage - 50) / 25) * 255
      }
      // if > 75 --> red
      else {
        g = 255 - ((percentage - 75) / 25) * 255
      }
    }
    return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b))
  }

  /**
   * Transform r, g, b value to hexadecimal color
   * @param r red value on 255
   * @param g green value on 255
   * @param b blue value on 255
   */
  private _rgbToHex(r: number, g: number, b: number): string {
    return '#' + this._componentToHex(r) + this._componentToHex(g) + this._componentToHex(b)
  }

  /**
   * Transform a color value to hexadecimal
   * @param c : color value on 255
   * @private
   */
  private _componentToHex(c: number): string  {
    const hex = c.toString(16)
    return hex.length == 1 ? '0' + hex : hex
  }

  /**
   * Define the width of a branch/line
   * @param rate_a
   * @private
   */
  private _getWidth(rate_a: number): number {
    let width = rate_a / 6 // increase difference
    if (width < 0.5) {
      // set a min
      //console.log("<0.5: "+width)
      width = 0.5
    }else if (width > 2.5) {
      // set a max
      //console.log(">2.5: "+width)
      width = 2.5
    } else {
      //console.log(width)
    }
    return width
  }
}
