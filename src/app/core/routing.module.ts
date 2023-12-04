import { RouterModule, Routes } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import {AppComponent} from "../app.component";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
const ROUTES: Routes = [
  {path: '', component: AppComponent},
  {path: 'scenario/:name', component: AppComponent},
  {path: '**', redirectTo: '/'},
];

export const routingModule: ModuleWithProviders<any> = RouterModule.forRoot(ROUTES);
