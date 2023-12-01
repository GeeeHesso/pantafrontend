import {initializeApp} from "firebase/app";
import {getStorage} from "firebase/storage";
import {getDatabase} from "firebase/database";
import {Injectable} from "@angular/core";

/**
 * Manage Firebase initialization
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private _firebaseConfig = {
    apiKey: "AIzaSyCYwVC7cB92X0IcMWVM7TPM05A2734v9Qc",
    authDomain: "pantagruel-f2f05.firebaseapp.com",
    databaseURL: "https://pantagruel-f2f05-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pantagruel-f2f05",
    storageBucket: "pantagruel-f2f05.appspot.com",
    messagingSenderId: "150972358346",
    appId: "1:150972358346:web:53dea1f541bded20381e33"
  };
  private readonly _firebaseApp : any
  public readonly firebaseStorage : any
  public readonly firebaseRealtimeDB : any

  constructor() {
    this._firebaseApp = initializeApp(this._firebaseConfig);
    this.firebaseStorage = getStorage(this._firebaseApp)
    this.firebaseRealtimeDB  = getDatabase(this._firebaseApp)
  }

}
