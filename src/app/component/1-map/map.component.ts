import {Component} from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

/**
 * Leaflet map complete by map service
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [MatIconModule],
})
export class MapComponent{

}
