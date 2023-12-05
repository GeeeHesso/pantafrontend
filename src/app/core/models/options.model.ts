import { LatLng } from 'leaflet'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 15/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 03/09/2023		Gwenaëlle Gustin		New feature: can call local API
 * *
 ******************************************************************/
export class MapOptions {
  constructor(
    public showGen: boolean,
    public showGenIcon: boolean,
    public showGenSize: boolean,
    public showGenColor: boolean,
    public showBranch: boolean,
    public showBranchColor: boolean,
    public showBranchWidth: boolean,
    public showBranchArrow: boolean,
    public showTransformer: boolean,
    public showTransColor: boolean,
    public showLoad: boolean,
    public showLoadSize: boolean,
    public zoom: number,
    public center: LatLng,
    public devMode: boolean,
  ) {}
}
