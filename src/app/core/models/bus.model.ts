import {Load} from "./load.model";
import {Gen} from "./gen.model";

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
