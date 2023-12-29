import { Injectable } from '@angular/core'
import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { environment } from 'src/environments/environment'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Manage Firebase initialization
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 07/07/2023		Gwenaëlle Gustin		Manage Firebase initialization
 ******************************************************************/
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private _firebaseConfig = {
    apiKey: environment.FIREBASE_API_KEY,
    authDomain: environment.FIREBASE_AUTH_DOMAIN,
    databaseURL: environment.FIREBASE_DATABASE_URL,
    projectId: environment.FIREBASE_PROJECT_ID,
    storageBucket: environment.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: environment.FIREBASE_MESSAGE_SENDER_ID,
    appId: environment.FIREBASE_APP_ID,
  }
  private readonly _firebaseApp: any
  public readonly firebaseStorage: any
  public readonly firebaseRealtimeDB: any

  constructor() {
    this._firebaseApp = initializeApp(this._firebaseConfig)
    this.firebaseStorage = getStorage(this._firebaseApp)
    this.firebaseRealtimeDB = getDatabase(this._firebaseApp)
  }
}
