import {AsyncPipe, DatePipe, NgForOf, NgIf, NgStyle} from '@angular/common'
import { Component, Inject, OnInit, ViewChild } from '@angular/core'
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatNativeDateModule } from '@angular/material/core'
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BehaviorSubject,} from 'rxjs'
import {PANTAGRUEL_DATA} from '../../core/core.const'
import { Pantagruel } from '../../core/models/pantagruel'
import { MapService } from '../../core/services/map.service'
import { MapComponent } from '../1-map/map.component'
import { getDownloadURL, ref as refStorage, uploadString} from "firebase/storage"
import { ref as refDb, set, get, child} from "firebase/database";
import { MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import { ResolveEnd, Router} from "@angular/router";
import { Clipboard } from '@angular/cdk/clipboard';
import { FirebaseService } from "../../core/services/firebase.service";
import { SidenavOptionsComponent } from "../2-sidenav-options/sidenav-options.component";
import { SidenavEditsComponent } from "../2-sidenav-edits/sidenav-edits.component";
import { EditsService } from "../../core/services/edits.service";
import { MatRadioModule } from "@angular/material/radio";
import { MatTableModule } from "@angular/material/table";
import { Country } from "../../core/models/country.model";
import { MatSortModule, Sort } from "@angular/material/sort";
// @ts-ignore
import domToImageMore from 'dom-to-image-more';

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Main layout contains toolbar,
 * *                     calls side panels, map, dialog window
 * *
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 21/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 17/12/2023		Gwenaëlle Gustin		New feature: JSON download + file exported with timestamp name
 * * 
 ******************************************************************/
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    ReactiveFormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MapComponent,
    SidenavEditsComponent,
    SidenavOptionsComponent,
    MatSelectModule,
    NgStyle,
  ],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav', { static: false }) sidenav!: MatSidenav
  public defaultDate!: FormControl
  public timeInput!: number
  public title!: string
  private _dateInput!: Date
  private _jsonFileName!: string

  constructor(
    public mapService: MapService,
    public editsService: EditsService,
    public firebaseService: FirebaseService,
    @Inject(PANTAGRUEL_DATA) private _pantagruelData: BehaviorSubject<Pantagruel>,
    @Inject(Window) private _window: Window,
    private _dialog: MatDialog,
    private _router: Router,
  ) {
    this._router.events.subscribe((routerData) => {
      if (routerData instanceof ResolveEnd) {

        this.mapService.initOptionsFromLS()


        /*if (this.mapService.selectedOptions.devMode){
          this.mapService.URL_API_BASE = 'http://127.0.0.1:8080/'
        } else {
          this.mapService.URL_API_BASE = 'https://pantagruelapi.p645.hevs.ch/'
        }

      if (this._window.location.origin.includes("dev")
          || this._window.location.origin.includes("localhost")) {
          this.mapService.devMode = true
        }*/

        // In case of normal app (not scenario url)
        if (!routerData.url.includes("?scenario=")) {
          this.mapService.initMap()
          this.mapService.getDataFromURL()

        } else { // In case of scenario url
          this._jsonFileName = routerData.url.substring(11)
          const fileName = routerData.url.slice(11, -5)
          this.title = routerData.url.slice(30, -5).replace(/-/g, ' ')
          const fileRef = "scenarios/"+this._jsonFileName
          const dataRef = refStorage(this.firebaseService.firebaseStorage, fileRef);
          this.mapService.scenarioMode = true

          getDownloadURL(dataRef)
            .then((FirebaseUrl) => {
              this.mapService.getDataFromURL(FirebaseUrl)

              // Define options with the options of saved scenario
              const path = "ScenarioOptions/"+fileName
              get(child(refDb(this.firebaseService.firebaseRealtimeDB), path)).then((snapshot) => {
                if (snapshot.exists()) {
                  this.mapService.selectedOptions = snapshot.val()
                  this.mapService.initMap()
                } else {
                  throw new Error("DataSnapshot doesn't exist")
                }
              }).catch((error) => {
                this.mapService.initMap()
                console.warn("Options of this scenarios not available. Detailed error above")
                console.error(error)
              });
            })
            .catch((error) => {
              console.error(error)
              this._router.navigate(['']).then(()=> {
                this.mapService.initMap()
                this.mapService.getDataFromURL()
              })
            });
        }
      }
    })
  }

  ngOnInit() {
    /**
     * Date and time input field change with the value given by the json file
     */
    this.mapService.dataService.currentDateTime$.subscribe((date: Date) => {
      this.defaultDate = new FormControl(date)
      this._dateInput = date
      this.timeInput = date.getHours()
    })
  }

  /**
   * Handle button to provide consumption by country
   */
  public handleButtonUpload(): void {
    this._dialog.open(DialogUpload)
  }

  /**
   * Update date value each time the hour input is edited
   * @param event
   */
  dateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this._dateInput = event.value
    }
  }

  /**
   * Validate the new dateTime selected to charge new data
   */
  handleButtonSendDateTime(): void {
    if (!this.mapService.isDataLoading$.getValue()){
      this.mapService.isDataLoading$.next(true)
      const year = this._dateInput.getFullYear()
      const month = this._dateInput.getMonth() + 1
      const day = this._dateInput.getDate()
      const hour = this.timeInput

      // String date for check in entsoeAvailableDate
      let hourStr = hour.toString()
      if (hour<10){
        hourStr = '0'+hour
      }
      let dayStr = day.toString()
      if (day<10){
        dayStr = '0'+day
      }
      let monthStr = month.toString()
      if (month<10){
        monthStr = '0'+month
      }
      const stringToCompare = year+'-'+monthStr+'-'+dayStr+"T"+hourStr+':00:00.0'

      if(this.mapService.entsoeAvailableDate==undefined || this.mapService.entsoeAvailableDate?.includes(stringToCompare)){
        const dateTime = {
          year: year,
          month: month,
          day: day,
          hour: hour,
        }

        this.mapService.askDataDateTime(dateTime)
        console.log(
          'POST API data : ' +
          dateTime.day +
          '/' +
          dateTime.month +
          '/' +
          dateTime.year +
          ' ' +
          dateTime.hour +
          ':00',
        )
      } else {
        console.warn("Date "+
          'POST API data : ' +
          day +  '/' + month + '/' + year + ' ' +
          hour + ':00' +
          " not in the available ENTSO-E data.")
        this.mapService.showSnackbar("Date not in the available ENTSO-E data.")
        this.mapService.isDataLoading$.next(false)
      }
    }
  }

  /**
   * Handle button to provide consumption by country
   */
  public handleButtonConsumptionByCountry(): void {
    this._dialog.open(DialogCountry)
  }

  /**
   * Handle button that leave the scenario mode by reload the main page
   */
  public handleButtonCancelScenarioMode(): void {
    this._router.navigate(['']).then(() => window.location.reload())
  }

  /**
   * Handle click on edits buttons
   */
  public handleButtonEdits(): void {
    // If side panel already open with the edits --> close the edits panel
    if (this.editsService.sidenavOpened == 'edits') {
      this.editsService.sidenavOpened = 'none'
      this.sidenav.close()
      // If side panel closed or open with options --> open the edits panel
    } else {
      this.editsService.sidenavOpened = 'edits'
      this.sidenav.open()
    }
  }

  /**
   * Handle button to export image button
   */
  public handleButtonExport() : void {
    this._dialog.open(DialogDownload, {
      data: {fileType: 'json'},
    });
  }

  /**
   * Handle button to create a shareable link
   */
  public handleButtonShareScenario(): void {
    this._dialog.open(DialogLink, {
      data: {fileName: this._jsonFileName},
    });
  }

  /**
   * Handle click on options buttons
   */
  public handleButtonOptions(): void {
    // If side panel already open with the option --> close the option panel
    if (this.editsService.sidenavOpened == 'options') {
      this.editsService.sidenavOpened = 'none'
      this.sidenav.close()

      // If side panel closed or open with edits --> open the option panel
    } else {
      this.editsService.sidenavOpened = 'options'
      this.sidenav.open()
    }
  }

}

@Component({
  selector: 'dialog-download',
  templateUrl: 'dialog-download.html',
  styles: ['mat-spinner { margin: auto; }'],
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, NgIf, MatRadioModule, MatProgressSpinnerModule, AsyncPipe],
})
export class DialogDownload {
  public isExportLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public fileType: string
  private _link: HTMLAnchorElement

  constructor(
    public dialogRef: MatDialogRef<DialogDownload>,
    @Inject(PANTAGRUEL_DATA) private _pantagruelData: BehaviorSubject<Pantagruel>,
    public mapService: MapService
  ) {
    this.fileType = "json"
    this._link = document.createElement("a")
  }

  public onCancelClick(): void {
    this.dialogRef.close();
  }

  /**
   * Prepare data to be downloaded
   */
  public async onDownloadClick(): Promise<void> {
    this.isExportLoading$.next(true)

    // without timeout, loading spinner not working
    await new Promise(f => setTimeout(f, 100));

    const { DateTime } = require("luxon");
    this._link.download = DateTime.now().toFormat('yyyy-LL-dd-HH-mm')+"-PanTaGruEl-Export."+this.fileType

    if (this.fileType == "json"){
      const PANTAGRUEL_DATA = this._pantagruelData.getValue()
      var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(PANTAGRUEL_DATA));
      this.download("data:" + data)

    } else {
      const leafletMapPane = document.getElementsByClassName('leaflet-map-pane') as HTMLCollectionOf<Element>
      const map = leafletMapPane[0]
      const mapforSize = document.getElementById('map') as HTMLElement
      const width = mapforSize.clientWidth
      const height = mapforSize.clientHeight
      
      if (this.fileType == "jpg")
      {
        domToImageMore.toJpeg(map, {width, height})
        .then((dataUrl: string) => {
          this.download(dataUrl)
        })
      } else if (this.fileType == "png") {
        domToImageMore.toPng(map, {width, height})
        .then((dataUrl: string) => {
          this.download(dataUrl)
        })
      } else if (this.fileType == "svg") {
        domToImageMore.toSvg(map, {width, height})
        .then((dataUrl: string) => {
          this.download(dataUrl)
        })
      }

    }
  }

  /**
   * Download data to default downlaod folder on computer
   * @param dataUrl downloaded
   */
  public download(dataUrl: string){
    this._link.href = dataUrl
    this._link.click()
    this.isExportLoading$.next(false)
    this.dialogRef.close()
    this._link.remove()
  }
}

@Component({
  selector: 'dialog-upload',
  templateUrl: 'dialog-upload.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, NgIf, ReactiveFormsModule],
})
export class DialogUpload {
  public file: any
  public fileString: any
  constructor(
    public dialogRef: MatDialogRef<DialogLink>,
    public mapService: MapService,
  ) {}

  public onCancelClick(): void {
    this.dialogRef.close();
  }

  public onFileSelected(event:any):void {
    this.file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.fileString = fileReader.result;
    }
    fileReader.readAsText(this.file);
  }

  public onUploadClick(): void {
    const jsonData = JSON.parse(this.fileString)
    this.mapService.getDatafromFile(jsonData)
    this.dialogRef.close();
  }
}

@Component({
  selector: 'dialog-link',
  templateUrl: 'dialog-link.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, NgIf, ReactiveFormsModule],
})
export class DialogLink {
  private _jsonFileName!: string
  public fileName = new FormControl('', [Validators.required])
  public link: string = ""

  constructor(
    public dialogRef: MatDialogRef<DialogLink>,
    @Inject(PANTAGRUEL_DATA) private _pantagruelData: BehaviorSubject<Pantagruel>,
    @Inject(Window) private _window: Window,
    private _clipboard: Clipboard,
    private _datePipe: DatePipe,
    public mapService: MapService,
    public firebaseService: FirebaseService,
  ) {}

  public onCancelClick(): void {
    this.dialogRef.close();
  }

  getErrorMessage() {
    /*if (this.fileName.hasError('firebase')) {
      return 'Error during sending data. Try again later.';
    }*/

    return this.fileName.hasError('required') ? 'You must enter a name' : '';
  }

  public createLink(): void {
    if (this.fileName.value !== "" && this.fileName.value !== null && this.fileName.value !== undefined){
      const fileName = this.fileName.value
      const nowDate = new Date()
      const nowStr = this._datePipe.transform(nowDate, "yyyy-MM-dd-hh-mm-ss")
      const inputWithoutSpecialChar = fileName.replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "")
      const nameWithDateTime = nowStr+inputWithoutSpecialChar
      this._jsonFileName = nameWithDateTime+".json"

      //Json to Firebase
      const dataRef = refStorage(this.firebaseService.firebaseStorage, "scenarios/"+this._jsonFileName)
      const PantagruelSTR = JSON.stringify(this._pantagruelData.getValue())

        uploadString(dataRef, PantagruelSTR).then(() => {
          console.log("Data send to Firebase")
          this.link  = this._window.location.origin+this._window.location.pathname +"?scenario="+this._jsonFileName

          //Option to Firebase
          const optionsToSaved = this.mapService.selectedOptions
          optionsToSaved.center = this.mapService.map.getCenter()
          optionsToSaved.zoom = this.mapService.map.getZoom()
          set(refDb(this.firebaseService.firebaseRealtimeDB, 'ScenarioOptions/' + nameWithDateTime), optionsToSaved )
            .then(() => {
              console.log("Options send to Firebase")
            })
        }).catch((error) => {
          //Options not send to firebase
          console.error(error)
          // ToDo: delete scenarios in storage ?
        })

    }else {
      this.fileName.setErrors([Validators.required])
    }
  }

  public copyToClipboard(): void{
    this._clipboard.copy(this.link)
    this.mapService.showSnackbar("Link copied to clipboard!")
  }
}

@Component({
  selector: 'dialog-country',
  templateUrl: 'dialog-country.html',
  standalone: true,
  imports: [MatDialogModule, MatTableModule, MatButtonModule, FormsModule, MatSortModule, NgForOf, NgIf],
})
export class DialogCountry {
  public countryList: Country[] = []

  constructor(public dialogRef: MatDialogRef<DialogCountry>,
              public mapService: MapService,
              @Inject(PANTAGRUEL_DATA) private _pantagruelData: BehaviorSubject<Pantagruel>,
  ) {
    this.countryList = structuredClone(this.mapService.dataService.COUNTRIES)
    this.sortCountry({
      "active": "alpha",
      "direction": "asc"
    })
    dialogRef.afterClosed().subscribe(() => {
      this.countryList = structuredClone(this.mapService.dataService.COUNTRIES)
    });
  }

  public sortCountry(sort: Sort) {
  this.countryList.sort((a: Country, b: Country) =>{
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
          case 'alpha': return this.compare(a.alpha, b.alpha, isAsc);
          case 'name': return this.compare(a.countryName, b.countryName, isAsc);
          case 'pd': return this.compare(a.pd, b.pd, isAsc);
          //case 'qd': return this.compare(a.qd, b.qd, isAsc);
          default: return 0;
        }
    })
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  public sendCountry(current: string):void{
    if (!this.mapService.isDataLoading$.getValue()){
      this.mapService.isDataLoading$.next(true)
      let pantagruel = structuredClone(this._pantagruelData.getValue())
      pantagruel.country = {}
      for (const c in this.countryList){

        let country = {pd: Number(this.countryList[c].pd), qd: Number(this.countryList[c].qd)}
        let alpha: string = this.countryList[c].alpha
        pantagruel.country[alpha] = country
      }

      let url = this.mapService.URL_API_DC_OPF_COUNTRY
      if (current == "AC"){
        url = this.mapService.URL_API_AC_OPF_COUNTRY
      }
      this.mapService.askDataDispatchCountry(pantagruel, url)
      this.dialogRef.close()
    }
  }
}
