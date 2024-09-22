export interface DialogData {
  message: string;
}

export interface Point {
  x: number;
  y: number;
}

export class SaveFile {
  name: string;
  size: number;
  binary: Uint8Array;
}

export class Mod {
  id: string;
  name: Uint8Array;
  version: Uint8Array;
}

export class State {
  binary: Uint8Array;
  comps: number;
  wires: number;
  nidMap: { [nid: string]: string } = {};
  compMap: { [address: number]: Component } = {};
  wireList: Wire[] = [];
  mods: Mod[] = [];
  i: number = 0;
  wireStateSize: number;

  skip(step: number): void {
    this.i += step;
  }

  getMod(id: string): Mod {
    for (const mod of this.mods) {
      if (mod.id === id) return mod;
    }
  }
}

export class Component {
  nid: string;
  address: number;
  parent: number;
  name: string;
  x: number;
  y: number;
  z: number;
  rotation: Uint8Array;
  inputs: string[] = [];
  outputs: string[] = [];
  customData: Uint8Array;

  constructor(address: number) {
    this.address = address;
  }

  display() {
    return this.name + '[' + this.address + ']';
  }
}

export interface Peg {
  input: boolean;
  address: number;
  index: number;
}

export class Wire {
  peg1: Peg;
  peg2: Peg;
  stateID: string;
  rotation: Uint8Array;
}
