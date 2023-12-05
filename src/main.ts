import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 13/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
