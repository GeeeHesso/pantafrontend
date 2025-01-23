/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		      Comments
 * * ---------------------------------------------------------------------------
 * * 27/07/2023		Gwenaëlle Gustin		Last edition for TB release.
 * * 09/04/2024		Marie-Esther Mabillard	Description of parameter (integrated 08.01.2025)
 * *
 ******************************************************************/
export class Gen {
  constructor(
    // Currently used
    public pg: number, // ! active power generated
    public gen_bus: number, // ! bus to which generator is connected
    public pmax: number, // ! active power generation capacity
    public category: string, // ! category of generator (C, N, F, O, G, H, R, X)
    public index: number, // ! index of generator
    public gen_status: number, // ! status (0: out of service, 1: in service)
    public type: string, // ! type of generator (Hydro, Nuclear, etc)

    // Currently not used in frontend
    public mbase: number, //  base power of generator (should be the same as baseMVA) // ! baseMVA used instead
    public vg: number, // voltage of generator
    public pmin: number, // minimum active power generation (most of the time it's 0)

    // Not important
    public model: number, // generation cost model (1: piecewise linear, 2: polynomial)
    public qg: number, // reactive power generated // might be used in the future
    public cost: number[], // cost of generation, vector which lengths depends on order of cost function
    public qmax: number, // maximum reactive power generation
    public qmin: number, // minimum reactive power generation
    public ncost: number, // order of cost model

    // Added properties
    public produceMW: number, // production in Watt
    public maxMW: number, // max production in Watt
    public coord: number[],
    public categoryText: string,
    public originalProduceMW: number, // original production in Watt
  ) {}
}
