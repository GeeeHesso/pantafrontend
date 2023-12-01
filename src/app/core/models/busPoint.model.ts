import {Branch} from "./branch.model";
import {Bus} from "./bus.model";

export class BusPoint {

  constructor(public bus: Bus,
              public lines: Branch[],
              public transfo: Branch[]) {

  }
}
