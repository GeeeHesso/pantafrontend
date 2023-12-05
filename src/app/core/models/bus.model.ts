import {Load} from "./load.model";
import {Gen} from "./gen.model";

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 01/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * *
 ******************************************************************/
export class Bus {

  constructor(public coord: number[],
              public name: string,
              public bus_type: number,
              public status: number,
              public vmax: number,
              public country: string,
              public load_prop: number,
              public vmin: number,
              public index: number,
              public va: number,
              public population: number,
              public vm: number,
              public base_kv: number,
              // Added properties
              public loads:  Load[],
              public gens:  Gen[]) {
  }
}
