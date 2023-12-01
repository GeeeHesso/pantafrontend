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
