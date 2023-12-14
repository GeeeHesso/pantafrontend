import { NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapOptions } from '../../core/models/options.model'
import { MapService } from '../../core/services/map.service'
import {DEFAULT_OPTIONS} from "../../core/core.const";


/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Side panel contents legend and display options
 * *
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 15/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 03/09/2023		Gwenaëlle Gustin		New feature: can call local API
 * *
 ******************************************************************/
@Component({
  selector: 'app-sidenav-options',
  templateUrl: './sidenav-options.component.html',
  styleUrls: ['./sidenav-options.component.scss'],
  standalone: true,
  imports: [MatSlideToggleModule, NgIf, MatIconModule, MatButtonModule, MatToolbarModule],
})
export class SidenavOptionsComponent {
  constructor(public mapService: MapService) {}

  /**
   * Apply display options
   */
  applyOptions(options: MapOptions) {
    this.mapService.clearMap()
    this.mapService.drawOnMap(options)
  }

  /**
   * Save display options in local storage
   */
  saveOptions(): void {
    this.mapService.userOptions = this.mapService.selectedOptions
    this.mapService.userOptions.zoom = this.mapService.map.getZoom()
    this.mapService.userOptions.center = this.mapService.map.getCenter()
    localStorage.setItem('Display options', JSON.stringify(this.mapService.userOptions))
    this.applyOptions(this.mapService.userOptions)
    //Check
    const optionLs = localStorage.getItem('Display options')
    if (optionLs == JSON.stringify(this.mapService.userOptions)) {
      this.mapService.showSnackbar('Options saved')
    } else {
      this.mapService.showSnackbar('Options failed to be saved')
    }
  }

  /**
   * Reset display to europe with colored lines and bus
   */
  resetOptions(): void {
    this.mapService.selectedOptions = Object.assign({}, DEFAULT_OPTIONS)
    this.applyOptions(this.mapService.selectedOptions)
    this.mapService.map.flyTo(
      DEFAULT_OPTIONS.center,
      DEFAULT_OPTIONS.zoom,
    )
  }

  /**
   * Reset display to last saved made by user
   */
  reloadOptions(): void {
    const OPTION_LS = localStorage.getItem('Display options')
    this.mapService.selectedOptions = Object.assign({}, JSON.parse(OPTION_LS!))
    this.applyOptions(JSON.parse(OPTION_LS!))
    this.mapService.map.flyTo(this.mapService.userOptions.center, this.mapService.userOptions.zoom)
    this.mapService.updateUrl()
  }

  changeLocalhostMode(checked: boolean): void {
    this.mapService.selectedOptions.localhostMode = checked
    this.mapService.updateUrl()
  }

  changeDevMode(checked: boolean): void {
    this.mapService.selectedOptions.devMode = checked
  }
}
