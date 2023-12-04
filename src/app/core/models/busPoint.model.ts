import {Branch} from "./branch.model";
import {Bus} from "./bus.model";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
export class BusPoint {

  constructor(public bus: Bus,
              public lines: Branch[],
              public transfo: Branch[]) {

  }
}
