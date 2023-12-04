/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
export class Load {

  constructor(
              public status: number,
              public load_bus: number,
              public qd: number,
              public index: number,
              public pd: number,
              // Addes properties
              public consumeMW: number,
              public coord: number[],
              public pop: number,
              public newConsumeMW: number,
              public originalConsumeMW: number) {

  }
}
