import { LatLng } from 'leaflet'

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
