import { HttpClientModule } from '@angular/common/http'
import { Injector, NgModule } from '@angular/core'
import { createCustomElement } from '@angular/elements'
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BehaviorSubject } from 'rxjs'
import { AppComponent } from './app.component'
import { MapPopupBranch } from './component/3-map-popup-branch/map-popup-branch'
import { MapPopupBusComponent } from './component/3-map-popup-bus/map-popup-bus.component'
import { LayoutComponent } from './component/0-layout/layout.component'
import {PANTAGRUEL_DATA} from './core/core.const'
import {MatFormFieldModule} from "@angular/material/form-field"
import {MatDialogModule} from "@angular/material/dialog";
import {routingModule} from "./core/routing.module";
import {DatePipe} from "@angular/common";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 07/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    routingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LayoutComponent,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: PANTAGRUEL_DATA, useValue: new BehaviorSubject(null) },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000 } },
    { provide: Window, useValue: window },
    DatePipe
  ],
})
export class AppModule {
  constructor(injector: Injector) {
    const BUS_INFO_ELEMENT = createCustomElement(MapPopupBusComponent, {
      injector,
    })
    customElements.define('popup-bus-element', BUS_INFO_ELEMENT)

    const BRANCH_INFO_ELEMENT = createCustomElement(MapPopupBranch, {
      injector,
    })
    customElements.define('popup-branch-element', BRANCH_INFO_ELEMENT)
  }

}
