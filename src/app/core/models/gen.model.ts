export class Gen {

  constructor( public pg: number,
               public model: number,
               public qg: number,
               public gen_bus: number,
               public pmax: number,
               public mbase: number,
               public vg: number,
               public category: string,
               public index: number,
               public cost : number[],
               public gen_status: number,
               public qmax: number,
               public qmin: number,
               public type: string,
               public pmin: number,
               public ncost: number,
               // Added properties
               public produceMW: number,
               public maxMW: number,
               public coord: number[],
               public categoryText: string,
               public newProduceMW: number,
               public originalProduceMW: number) {

  }
}
