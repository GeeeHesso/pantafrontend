import { LatLng } from 'leaflet'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 15/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 03/09/2023		Gwenaëlle Gustin		New feature: can call local API
 * * 04/02/2025		Gwenaëlle Gustin    New feature: can disable color of line
 * *
 ******************************************************************/
export class MapOptions {
  constructor(
    public showGen: boolean,
    public showGenIcon: boolean,
    public showGenSize: boolean,
    public showGenColor: boolean,
    public showBranch: boolean,
    public showBranchColor: BranchColorValue,
    public showBranchWidth: boolean,
    public showBranchArrow: boolean,
    public showTransformer: boolean,
    public showTransColor: BranchColorValue,
    public showLoad: boolean,
    public showLoadSize: boolean,
    public zoom: number,
    public center: LatLng,
    public localhostMode: boolean,
    public devMode: boolean,
  ) {}
}

export enum BranchColorValue {
  Voltage = 'voltage',
  Load = 'load',
  None = 'none',
}
