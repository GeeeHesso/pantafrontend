import { NgForOf, NgIf } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatTabsModule } from '@angular/material/tabs'
import { Branch } from '../../core/models/branch.model'
import {EditsService} from "../../core/services/edits.service";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       : Popup that appears when you click on a line
 *                       Lines are branches with two different coordinates
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 07/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
@Component({
  selector: 'app-map-popup-branch',
  templateUrl: './map-popup-branch.html',
  styleUrls: ['./map-popup-branch.scss'],
  standalone: true,
  imports: [MatTabsModule, NgIf, NgForOf, MatCardModule, MatIconModule, MatSlideToggleModule],
})
export class MapPopupBranch {
  constructor(public editsService: EditsService) {}
  @Input() branchesFT!: Branch[]
  @Input() branchesTF!: Branch[]
}
