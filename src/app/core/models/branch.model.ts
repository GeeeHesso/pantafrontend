import { Bus } from './bus.model'

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
export class Branch {
  constructor(
    // Currently used in frontend
    public rate_a: number, // ! thermal rating: how much power the branch can carry
    public pt: number, // ! real power injected at the "to" bus
    public f_bus: number, // ! use the fromBus.index to work with direction -> ! index of the "from" bus
    public br_status: number, // ! branch status (0: inactive, 1: active)
    public t_bus: number, // ! use the toBus.index to work with direction -> ! index of the "to" bus
    public index: number, // ! index of branch
    public transformer: boolean, // ! bool for wether branch is transformer
    public pf: number, // ! real power injected at the "from" bus

    // Currently not used in frontend
    public br_r: number, // branch resistance
    public br_x: number, // branch reactance

    // Not important
    public shift: number, // voltage angle shift, only applicable for transformers, must be present in each entry
    public g_to: number, // branch charging conductance at "to" bus
    public g_fr: number, // branch charging conductance at "from" bus
    public b_fr: number, // branch charging susceptance at the "from" bus
    public b_to: number, // branch charging susceptance at the "to" bus
    public qf: number, // reactive power injected at the "from" bus
    public angmin: number, // minimal allowed voltage difference between "to" and "from" bus
    public angmax: number, // maximal allowed voltage difference between "to" and "from" bus
    public qt: number, // reactive power injected at the "to" bus
    public tap: number, // current tap setting, only applicable for transformers, must be present in each entry

    // Added properties
    public loadInjected: number, // percentage of usage
    public originalLoadInjected: number, // original value of loadInjected
    public totalPowerMW: number, // usage in Watt
    public originalTotalPowerMW: number, // original usage in Watt
    public originalStatus: number,
    public thermalRatingMW: number,
    public losses: number,
    public fromBus: Bus, // !!! correspond to t_bus if pf negative
    public toBus: Bus, // !!! correspond to f_bus if pf negative
  ) {}
}
