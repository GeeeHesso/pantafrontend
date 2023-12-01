import { RouterModule, Routes } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import {AppComponent} from "../app.component";

const ROUTES: Routes = [
  {path: '', component: AppComponent},
  {path: 'scenario/:name', component: AppComponent},
  {path: '**', redirectTo: '/'},
];

export const routingModule: ModuleWithProviders<any> = RouterModule.forRoot(ROUTES);
