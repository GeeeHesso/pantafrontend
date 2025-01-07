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
export class Load {
  constructor(
    // Currently used
    public status: number, // ! status  of the load bus
    public load_bus: number, // ! bus the load is attached to
    public index: number, // ! index of load
    public pd: number, // ! active power consumption

    // Currently not used in frontend
    public qd: number, // reactive power consumption

    // Added properties
    public consumeMW: number,
    public coord: number[],
    public pop: number,
    public originalConsumeMW: number,
  ) {}
}
