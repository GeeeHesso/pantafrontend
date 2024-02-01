import { HttpClient } from '@angular/common/http'
import { Inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import * as L from 'leaflet'
import { BehaviorSubject } from 'rxjs'
import { environment } from 'src/environments/environment'
import { DEFAULT_OPTIONS, PANTAGRUEL_DATA, URL_LOCAL_GRID } from '../core.const'
import { MapOptions } from '../models/options.model'
import { Pantagruel } from '../models/pantagruel'
import { BranchService } from './branch.service'
import { BusService } from './bus.service'
import { DataService } from './data.service'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Initialise the display option, the map and load data
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 21/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 08/08/2023		Gwenaëlle Gustin		Limit date fixed dynamically
 * * 03/09/2023		Gwenaëlle Gustin		New feature: can call local API
 * * 05/12/2023		Gwenaëlle Gustin		New feature: can upload json file
 * * 18/01/2024		Gwenaëlle Gustin		Bug fix: ask data with date load EU map (not loaded map)
 ******************************************************************/

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public map!: L.Map
  public devMode: boolean = false
  public scenarioMode: boolean = false
  public uploadMode: boolean = false
  public fileName: string = 'Uploaded file'

  public URL_API_BASE!: string
  public URL_API_DEFAULT_GRID!: string
  public URL_API_AVAILABLE_DATES!: string
  public URL_API_DC_OPF_COUNTRY!: string
  public URL_API_AC_OPF_COUNTRY!: string
  public URL_API_DC_OPF_ENTSOE!: string

  public isDataLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true)

  public userOptions!: MapOptions
  public selectedOptions: MapOptions = DEFAULT_OPTIONS

  public entsoeAvailableDate!: [String]
  public minDate: Date = new Date(2015, 0, 1)
  public maxDate: Date = new Date(2023, 1, 28)
  private _originalData!: Pantagruel
  private _lastResultData!: Pantagruel
  private _localPantagruelData!: Pantagruel
  constructor(
    public dataService: DataService,
    public busService: BusService,
    public branchService: BranchService,
    private _snackBar: MatSnackBar,
    private _http: HttpClient,

    @Inject(PANTAGRUEL_DATA) private _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {}

  /**
   * Initialise preferred option from local storage
   */
  public initOptionsFromLS(): void {
    const OPTION_LS = localStorage.getItem('Display options')
    if (OPTION_LS) {
      this.userOptions = JSON.parse(OPTION_LS!)
      this.selectedOptions = JSON.parse(OPTION_LS!)
    } else {
      this.selectedOptions = Object.assign({}, DEFAULT_OPTIONS)
    }
    this.updateUrl()
  }

  /**
   * Initialise the map according to option
   */
  public initMap(): void {
    this.map = L.map('map', {
      center: this.selectedOptions.center,
      zoom: this.selectedOptions.zoom,
      minZoom: 4,
      maxZoom: 13,
    })
    this.map.on('zoomend', () => {
      this.drawOnMap()
    })
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    tiles.addTo(this.map)

    this._getAvailableDate()
    this._loadLocalData() // @todo: useless for now, failed displayed before end of reading
  }

  public updateUrl(): void {
    if (this.selectedOptions.localhostMode) {
      this.URL_API_BASE = 'http://127.0.0.1:8080/'
    } else {
      this.URL_API_BASE = environment.apiUrl
    }
    console.log('URL of the API is now: ' + this.URL_API_BASE)
    this.URL_API_DEFAULT_GRID = this.URL_API_BASE + 'networks/pantagruel'
    this.URL_API_AVAILABLE_DATES = this.URL_API_BASE + 'entsoe/available_dates'
    this.URL_API_DC_OPF_COUNTRY = this.URL_API_BASE + 'opf/dc_opf_country'
    this.URL_API_AC_OPF_COUNTRY = this.URL_API_BASE + 'opf/ac_opf_country'
    this.URL_API_DC_OPF_ENTSOE = this.URL_API_BASE + 'panta/dc_opf_entsoe'
  }

  /**
   * Display data on the map according to option
   */
  public drawOnMap(option: MapOptions = this.selectedOptions): void {
    const PANTAGRUEL_DATA = this._pantagruelData.getValue()

    this.clearMap()
    if (option.showBranch)
      this.branchService.drawBranch(
        this.map,
        PANTAGRUEL_DATA,
        option.showBranchColor,
        option.showBranchWidth,
        option.showBranchArrow,
      )
    if (option.showTransformer)
      this.branchService.drawTransformer(this.map, PANTAGRUEL_DATA, option.showTransColor)
    if (option.showLoad) this.busService.drawLoad(this.map, PANTAGRUEL_DATA, option.showLoadSize)
    if (option.showGen)
      this.busService.drawGen(
        this.map,
        PANTAGRUEL_DATA,
        option.showGenIcon,
        option.showGenSize,
        option.showGenColor,
      )
    this.busService.drawBus(this.map, PANTAGRUEL_DATA)
  }

  /**
   * Clear actual map of drawn elements
   */
  public clearMap(): void {
    this.map.eachLayer((layer) => {
      layer.remove()
    })
    const TILES = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        '| Bachelor\'s thesis 2023 by <a href="https://www.linkedin.com/in/gwena%C3%ABlle-gustin-09a228194/">Gwenaëlle Gustin</a> with <a href="https://www.hevs.ch/en/applied-research/research-institute-informatics/easilab-13431">Professor David Wannier</a> for <a href="https://etranselec.ch/">Professor Philippe Jacquod</a> ' +
        '| Load data from  <a href="https://transparency.entsoe.eu/">entose Transparency Platform</a>',
    })
    TILES.addTo(this.map)
  }

  /**
   * Display a snack bar with the content in parameter
   * @param content
   */
  public showSnackbar(content: string): void {
    this._snackBar.open(content)
  }

  /**
   * Get all available date of ENTSOE data set
   */
  private _getAvailableDate(): any {
    this._http.get<any>(this.URL_API_AVAILABLE_DATES).subscribe({
      next: (data) => {
        this.entsoeAvailableDate = data
        this.minDate = new Date(data[0])
        this.maxDate = new Date(data[data.length - 1])
      },
      error: (error) => {
        console.warn('There was an error when request available date.', error)
      },
    })
  }

  /**
   * Retrieve json data from file passed
   * and display on the map
   * @param file
   */
  public async getDataFromFile(file: any) {
    const formattedPantagruelData = this._getFormattedPantagruelData(file)
    this._pantagruelData.next(formattedPantagruelData)

    this._originalData = structuredClone(formattedPantagruelData)
    this._lastResultData = structuredClone(formattedPantagruelData)

    this.drawOnMap()
    this.isDataLoading$.next(false)
  }

  /**
   * GET HTTP method
   * Retrieve json data from url passed
   * (usually Firebase url in layout component)
   * of by default ask the API for default data
   * @param url where retrieve json file
   */
  public getDataFromURL(url: string = this.URL_API_DEFAULT_GRID): void {
    this.isDataLoading$.next(true)

    this._http.get<Pantagruel>(url).subscribe({
      next: (data) => {
        const formattedPantagruelData = this._getFormattedPantagruelData(data)

        this._pantagruelData.next(formattedPantagruelData)
        this.drawOnMap()
        this.isDataLoading$.next(false)

        // SCENARIO mode is true whe url is not /
        if (this.scenarioMode) {
          //If URL does not correspond to a file in Firebase, it redirects to /
          // and ask again getData
          if (this.scenarioMode && url === this.URL_API_DEFAULT_GRID) {
            this.showSnackbar("This scenario doesn't exist")
            this.scenarioMode = false
          } else {
            this.showSnackbar('Work with data from scenario')
          }
        } else {
          // NORMAL mode ask API data
          this.showSnackbar(
            'Work with API data (GET) from ' +
              data.date.day +
              '/' +
              data.date.month +
              '/' +
              data.date.year +
              ' (DD/MM/YYYY) ' +
              data.date.hour +
              ':00',
          )

          // To handle cancel after edit
          this._originalData = structuredClone(formattedPantagruelData)
          // To handle if edited data cannot be resolved by the API
          this._lastResultData = structuredClone(formattedPantagruelData)
        }
      },
      //TODO: if get saved data failed go back to main in scenario mode
      error: (error) => {
        this._handleError(error)
      },
    })
  }

  /**
   * POST HTTP datetime
   * Edit data with passed data,
   * pass the data to the API url in parameter
   * and read returned data
   * @param date after selection
   */
  public askDataDateTime(date: any): void {
    this.showSnackbar('Requesting API (with date)...')

    const data: Pantagruel = structuredClone(this._localPantagruelData)
    data.date = date // Change the only value that is important for the API

    this._http.post<Pantagruel>(this.URL_API_DC_OPF_ENTSOE, data).subscribe({
      next: (resultData: Pantagruel) => {
        const formattedPantagruelData = this._getFormattedPantagruelData(resultData)
        this._pantagruelData.next(formattedPantagruelData)

        this.drawOnMap()
        this.isDataLoading$.next(false)

        // To handle cancel after edit
        this._originalData = structuredClone(formattedPantagruelData)
        // To handle if edited data cannot be resolved by the API
        this._lastResultData = structuredClone(formattedPantagruelData)

        this.showSnackbar(
          'SUCCESS with API : data from ' +
            data.date.day +
            '/' +
            data.date.month +
            '/' +
            data.date.year +
            ' (DD/MM/YYYY) ' +
            data.date.hour +
            ':00',
        )
      },
      error: (error) => {
        this._handleError(error)
      },
    })
  }

  public askDataDispatchCountry(data: Pantagruel, url: string): void {
    this.showSnackbar('Requesting API (with country value)...')

    this._http.post<Pantagruel>(url, data).subscribe({
      next: (resultData: Pantagruel) => {
        const formattedPantagruelData = this._getFormattedPantagruelData(resultData)
        this._pantagruelData.next(formattedPantagruelData)

        this.drawOnMap()
        this.isDataLoading$.next(false)

        // To handle cancel after edit
        this._originalData = structuredClone(formattedPantagruelData)
        // To handle if edited data cannot be resolved by the API
        this._lastResultData = structuredClone(formattedPantagruelData)

        this.showSnackbar('SUCCESS with API : EDITED country values')
      },
      error: (error) => {
        this._handleError(error)
      },
    })
  }

  /**
   * POST HTTP dcpf
   * Pass the edited data to the API url in parameter
   * and read returned data
   */
  public askData(url: string): void {
    this.isDataLoading$.next(true)
    this.showSnackbar('Requesting API ' + url)

    const data = this._pantagruelData.getValue()

    this._http.post<Pantagruel>(this.URL_API_BASE + url, data).subscribe({
      next: (resultData) => {
        this.showSnackbar('SUCCESS with API : EDITED data.')

        const formattedPantagrualData = this._getFormattedPantagruelData(resultData)
        this._pantagruelData.next(formattedPantagrualData)

        this.drawOnMap()
        this._lastResultData = structuredClone(formattedPantagrualData)

        // Reset value in side panel Edits
        this.dataService.editedBus$.next([])

        this.isDataLoading$.next(false)
      },
      error: (error) => {
        this._handleError(error)
      },
    })
  }

  /**
   * Reset Pantagruel data with original in case of error
   * or cancelling edition
   */
  public resetData(): void {
    this._pantagruelData.next(structuredClone(this._originalData))
    this._lastResultData = structuredClone(this._originalData)
    this.drawOnMap()
    this.isDataLoading$.next(false)
  }

  private _loadLocalData(): any {
    this._http.get<Pantagruel>(URL_LOCAL_GRID).subscribe((data) => {
      this._localPantagruelData = this._getFormattedPantagruelData(data)
      console.log(this._localPantagruelData)
    })
  }

  /**
   * Handle error when loading data from the API
   * @param error
   */
  private _handleError(error: any) {
    console.warn('There was an ERROR with HTTP request', error)

    if (error.status == 422) {
      this.showSnackbar('Error ' + error.status + ' : data not valid.')
      this.resetData()
      // Reset value in side panel Edits
      this.dataService.editedBus$.next([])
    } else if (error.status == 500) {
      this.showSnackbar('Error : ' + error.error)

      // Error 0 is when the API cannot be accessed
    } else if (error.status == 0) {
      // if no data at all is stored, read the local default value

      if (this._pantagruelData.getValue() == null) {
        this.showSnackbar(
          'Error ' +
            error.status +
            ' :  the API could not be accessed. The LOCAL data are displayed.',
        )

        //@todo: is same code as _loadLocalData()
        this._http.get<Pantagruel>(URL_LOCAL_GRID).subscribe((data) => {
          this._localPantagruelData = this._getFormattedPantagruelData(data)
          this.getDataFromFile(this._localPantagruelData)
        })

        return
      } else {
        //If there is some data stored, reset to the last result data set
        this.showSnackbar(
          'Error ' +
            error.status +
            ' :  the API could not be accessed. LAST LOADED data are displayed.',
        )
        this._pantagruelData.next(this._lastResultData)
      }
    } else {
      //ToDo: simulated this case
      this.showSnackbar('Other error with data : ' + error.statusText + ' (' + error.status + ').')
      this._pantagruelData.next(this._lastResultData)
      this.isDataLoading$.next(false)
      return
    }

    this.drawOnMap()
    this.isDataLoading$.next(false)
  }

  /**
   * Complete data sata with value use in display
   * branch: loadInjected, totalPowerMW, losses, from bus coordinates, to bus coordinates
   * gen: bus coordinates
   * load: bus coordinates, bus population
   */
  private _getFormattedPantagruelData(pantagruelData: Pantagruel): Pantagruel {
    // WARNING lat long reverse, so [1][0]
    Object.keys(pantagruelData.gen).forEach((g) => {
      pantagruelData.gen[g].coord = [
        pantagruelData.bus[pantagruelData.gen[g].gen_bus].coord[1],
        pantagruelData.bus[pantagruelData.gen[g].gen_bus].coord[0],
      ]
      pantagruelData.gen[g].produceMW =
        Math.round((pantagruelData.gen[g].pg * pantagruelData.baseMVA + Number.EPSILON) * 100) / 100
      pantagruelData.gen[g].newProduceMW =
        Math.round((pantagruelData.gen[g].pg * pantagruelData.baseMVA + Number.EPSILON) * 100) / 100
      pantagruelData.gen[g].originalProduceMW =
        Math.round((pantagruelData.gen[g].pg * pantagruelData.baseMVA + Number.EPSILON) * 100) / 100
      pantagruelData.gen[g].maxMW =
        Math.round((pantagruelData.gen[g].pmax * pantagruelData.baseMVA + Number.EPSILON) * 100) /
        100

      // Switzerland case
      if (pantagruelData.gen[g].category == undefined) {
        if (pantagruelData.gen[g].type.includes('hydro')) {
          pantagruelData.gen[g].category = 'H'
        }
      }

      switch (pantagruelData.gen[g].category) {
        case 'C': {
          pantagruelData.gen[g].categoryText = 'Coal'
          break
        }
        case 'N': {
          pantagruelData.gen[g].categoryText = 'Nuclear'
          break
        }
        case 'F': {
          pantagruelData.gen[g].categoryText = 'Fossil oil'
          break
        }
        case 'O': {
          pantagruelData.gen[g].categoryText = 'Other'
          break
        }
        case 'G': {
          pantagruelData.gen[g].categoryText = 'Gas'
          break
        }
        case 'H': {
          pantagruelData.gen[g].categoryText = 'Hydro'
          break
        }
        case 'R': {
          pantagruelData.gen[g].categoryText = 'Renewables'
          break
        }
        case 'X': {
          pantagruelData.gen[g].categoryText = 'Unknown'
          break
        }
        default: {
          pantagruelData.gen[g].categoryText = 'UNKNOWN'
          break
        }
      }

      if (pantagruelData.gen[g].pg == undefined) {
        console.warn('Gen without power: ' + pantagruelData.gen[g].index)
      } else if (pantagruelData.gen[g].gen_status == 0) {
        console.warn('Inactive gen: ' + pantagruelData.gen[g].index)
      }
    })

    Object.keys(pantagruelData.load).forEach((l) => {
      //  WARNING lat long reverse, so [1][0]
      pantagruelData.load[l].coord = [
        pantagruelData.bus[pantagruelData.load[l].load_bus].coord[1],
        pantagruelData.bus[pantagruelData.load[l].load_bus].coord[0],
      ]
      pantagruelData.load[l].pop = Math.round(
        pantagruelData.bus[pantagruelData.load[l].load_bus].population,
      )
      pantagruelData.load[l].consumeMW =
        Math.round((pantagruelData.load[l].pd * pantagruelData.baseMVA + Number.EPSILON) * 100) /
        100
      pantagruelData.load[l].newConsumeMW =
        Math.round((pantagruelData.load[l].pd * pantagruelData.baseMVA + Number.EPSILON) * 100) /
        100
      pantagruelData.load[l].originalConsumeMW =
        Math.round((pantagruelData.load[l].pd * pantagruelData.baseMVA + Number.EPSILON) * 100) /
        100

      if (pantagruelData.load[l].status == 0) {
        console.warn('Inactive load: ' + pantagruelData.load[l].index)
      }
    })

    Object.keys(pantagruelData.bus).forEach((b) => {
      pantagruelData.bus[b].loads = []
      pantagruelData.bus[b].gens = []
      Object.keys(pantagruelData.load).forEach((l) => {
        if (pantagruelData.load[l].load_bus == pantagruelData.bus[b].index) {
          pantagruelData.bus[b].loads.push(pantagruelData.load[l])
        }
      })
      Object.keys(pantagruelData.gen).forEach((g) => {
        if (pantagruelData.gen[g].gen_bus == pantagruelData.bus[b].index) {
          pantagruelData.bus[b].gens.push(pantagruelData.gen[g])
        }
      })

      if (pantagruelData.bus[b].status == 0) {
        console.warn('Inactive bus: ' + pantagruelData.bus[b].index)
      }
    })

    Object.keys(pantagruelData.branch).forEach((br) => {
      pantagruelData.branch[br].originalStatus = pantagruelData.branch[br].br_status
      pantagruelData.branch[br].loadInjected = Math.round(
        (Math.abs(pantagruelData.branch[br].pf) / pantagruelData.branch[br].rate_a +
          Number.EPSILON) *
          100,
      )
      pantagruelData.branch[br].oldLoadInjected = Math.round(
        (Math.abs(pantagruelData.branch[br].pf) / pantagruelData.branch[br].rate_a +
          Number.EPSILON) *
          100,
      )
      pantagruelData.branch[br].totalPowerMW =
        Math.round(
          (Math.abs(pantagruelData.branch[br].pf) * pantagruelData.baseMVA + Number.EPSILON) * 100,
        ) / 100
      pantagruelData.branch[br].oldTotalPowerMW =
        Math.round(
          (Math.abs(pantagruelData.branch[br].pf) * pantagruelData.baseMVA + Number.EPSILON) * 100,
        ) / 100
      pantagruelData.branch[br].thermalRatingMW =
        Math.round(
          (Math.abs(pantagruelData.branch[br].rate_a) * pantagruelData.baseMVA + Number.EPSILON) *
            100,
        ) / 100
      pantagruelData.branch[br].losses =
        Math.round(
          Math.abs(
            (Math.abs(pantagruelData.branch[br].pf) - Math.abs(pantagruelData.branch[br].pt)) *
              pantagruelData.baseMVA +
              Number.EPSILON,
          ) * 100,
        ) / 100

      // Define the direction of the branch depends on the value of pf (negative go other way)
      if (pantagruelData.branch[br].pf >= 0) {
        pantagruelData.branch[br].fromBus = pantagruelData.bus[pantagruelData.branch[br].f_bus]
        pantagruelData.branch[br].toBus = pantagruelData.bus[pantagruelData.branch[br].t_bus]
      } else {
        pantagruelData.branch[br].fromBus = pantagruelData.bus[pantagruelData.branch[br].t_bus]
        pantagruelData.branch[br].toBus = pantagruelData.bus[pantagruelData.branch[br].f_bus]
      }

      if (pantagruelData.branch[br].transformer) {
        if (pantagruelData.branch[br].br_status == 0)
          console.warn('Inactive transformer: ' + pantagruelData.branch[br].index)
        if (pantagruelData.branch[br].pf == undefined)
          console.warn('Transformer without power: ' + pantagruelData.branch[br].index)
        if (
          pantagruelData.branch[br].fromBus.coord[0] != pantagruelData.branch[br].toBus.coord[0] ||
          pantagruelData.branch[br].fromBus.coord[1] != pantagruelData.branch[br].toBus.coord[1]
        )
          console.warn(
            'Transformer' + pantagruelData.branch[br].index + ' has 2 coordinates different',
          )
      } else {
        if (pantagruelData.branch[br].br_status == 0)
          console.warn('Inactive line: ' + pantagruelData.branch[br].index)
        if (pantagruelData.branch[br].pf == undefined)
          console.warn('Line without power: ' + pantagruelData.branch[br].index)
        if (
          pantagruelData.branch[br].fromBus.coord[0] == pantagruelData.branch[br].toBus.coord[0] &&
          pantagruelData.branch[br].fromBus.coord[1] == pantagruelData.branch[br].toBus.coord[1]
        )
          console.warn(
            'The branch ' +
              pantagruelData.branch[br].index +
              ' cannot be display. The FROM coordinates are the same as the TO coordinates',
          )
      }
    })

    this.dataService.setConstOfDataSet(pantagruelData)
    if (pantagruelData.date) {
      this.dataService.setDateOfDataSet(pantagruelData)
    }

    return pantagruelData
  }
}
