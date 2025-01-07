import { Gen } from './gen.model'
import { Load } from './load.model'

/*******************************************************************
 * * Copyright         : 2023 Gwenaëlle Gustin
 * * Description       :
 * * Revision History  :
 * * Date				  Author    		          Comments
 * * ---------------------------------------------------------------------------
 * * 01/07/2023		Gwenaëlle Gustin		    Last edition for TB release.
 * * 09/04/2024		Marie-Esther Mabillard	Description of parameter (integrated 08.01.2025)
 * *
 ******************************************************************/
export class Bus {
  constructor(
    // Currently used in frontend
    public coord: number[], // ! coordinates of bus [longitude, latitude]
    public name: string, // ! name of bus
    public status: number, // ! status of bus (0: inactive, 1: active)
    public country: string, // ! country of bus
    public index: number, // ! index of bus
    public population: number, // ! population assigned to this bus
    public base_kv: number, // ! base voltage

    // Currently not used in frontend
    public bus_type: number, // type of bus // PQ bus: Voltage and Reactive Power Controlled Bus // PV bus: Voltage and Active Power Controlled Bus // Slack bus: Swing Bus or Reference Bus // Isolated: Bus that stands alone
    public vmax: number, // maximum allowed voltage
    public load_prop: number, // proportion of the population of the bus country assigned to this specific bus
    public vmin: number, // minimum allowed voltage
    public va: number, // voltage angle
    public vm: number, // voltage angle per unit (vm = 1 means voltage is base voltage)

    // Added properties
    public loads: Load[],
    public gens: Gen[],
  ) {}
}
