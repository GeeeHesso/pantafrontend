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
export class Branch {

  constructor(public br_r: number,
              public rate_a: number,
              public shift: number,
              public pt: number,
              public br_x: number,
              public g_to: number,
              public g_fr: number,
              public b_fr: number,
              public f_bus: number, // use the fromBus.index to work with direction
              public br_status: number,
              public t_bus: number, // use the toBus.index to work with direction
              public b_to: number,
              public index: number,
              public qf: number,
              public angmin: number,
              public angmax: number,
              public transformer: boolean,
              public qt: number,
              public tap: number,
              public pf: number,
              // Added properties
              public loadInjected : number,
              public oldLoadInjected : number,
              public totalPowerMW : number,
              public oldTotalPowerMW : number,
              public originalStatus: number,
              public thermalRatingMW : number,
              public losses : number,
              public fromBus : Bus, // !!! correspond to t_bus if pf negative
              public toBus : Bus // !!! correspond to f_bus if pf negative
              ) {

  }
}
