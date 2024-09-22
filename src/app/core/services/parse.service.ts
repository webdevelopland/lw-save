import { Injectable } from '@angular/core';

import { Component, Peg, Wire, State } from '@/core/type';
import { EncodingService } from './encoding.service';
import { StateService } from './state.service';

@Injectable()
export class ParseService {
  state: State;

  constructor(
    private stateService: StateService,
    private encodingService: EncodingService,
  ) {}

  parse(binary: Uint8Array): void {
    const saveFile = new State();
    this.stateService.stateList.push(saveFile);
    this.state = saveFile;
    this.state.binary = binary;
    this.readText(16); // Header
    this.state.skip(1 + 16 + 1); // Skip useless
    // Amount comps & wires
    this.state.comps = this.readInt();
    this.state.wires = this.readInt();
    this.parseMods();
  }

  parseCircuit(): void {
    const len = this.readInt();
    this.state.wireStateSize = len;
    this.state.i += len;
    this.readText(16); // Footer
  }

  parseWires(): void {
    for (let i = 0; i < this.state.wires; i++) {
      const wire = new Wire();
      wire.peg1 = this.readPeg();
      wire.peg2 = this.readPeg();
      wire.stateID = this.readHex(4);
      wire.rotation = this.readBytes(4);
      this.state.wireList.push(wire);
    }
    this.parseCircuit();
  }

  parseComponents(): void {
    for (let i = 0; i < this.state.comps; i++) {
      const address = this.readAddress();
      const comp = new Component(address);
      comp.parent = this.readAddress();
      comp.nid = this.readNid();
      comp.name = this.state.nidMap[comp.nid];
      this.state.compMap[address] = comp;
      comp.x = this.readInt();
      comp.z = this.readInt();
      comp.y = this.readInt();
      comp.rotation = this.readBytes(16);
      const inputs = this.readInt();
      if (inputs > 0) {
        for (let j = 0; j < inputs; j++) {
          const id = this.readHex(4);
          comp.inputs.push(id);
        }
      }
      const outputs = this.readInt();
      if (outputs > 0) {
        for (let j = 0; j < outputs; j++) {
          const id = this.readHex(4);
          comp.outputs.push(id);
        }
      }
      const customDataLen = this.readInt();
      if (customDataLen > 0) {
        comp.customData = this.readBytes(customDataLen);
      } else if (customDataLen === -1) {
        comp.customData = null;
      }
    }
    this.parseWires();
  }

  parseComponentIds(): void {
    const components = this.readInt();
    for (let i = 0; i < components; i++) {
      const nid = this.readNid();
      const len = this.readInt();
      const compName = this.readText(len);
      this.state.nidMap[nid] = compName;
    }
    this.parseComponents();
  }

  parseMods(): void {
    const mods = this.readInt();
    for (let i = 0; i < mods; i++) {
      const len = this.readInt();
      const modName = this.readBytes(len);
      const version = this.readBytes(16);
      const id: string = this.getHex(modName);
      this.state.mods.push({
        id: id,
        name: modName,
        version: version,
      });
    }
    this.parseComponentIds();
  }

  readBytes(size: number): Uint8Array {
    return this.state.binary.slice(this.state.i, this.state.i += size);
  }

  readInt(): number {
    return this.encodingService.uint8ArrayToInt32(this.readBytes(4).reverse());
  }

  readAddress(): number {
    return this.encodingService.uint8ArrayToUint32(this.readBytes(4).reverse());
  }

  readFloat(): number {
    return this.encodingService.uint8ArrayToFloat32(this.readBytes(4));
  }

  readText(size: number): string {
    return this.getText(this.readBytes(size));
  }

  getText(binary: Uint8Array): string {
    return new TextDecoder().decode(binary);
  }

  readVersion(): string {
    const a = this.readInt();
    const b = this.readInt();
    const c = this.readInt();
    let d = this.readInt(); if (d === -1) d = 0;
    return `${a}.${b}.${c}.${d}`;
  }

  readNid(): string {
    return this.readHex(2);
  }

  readHex(size: number): string {
    return this.getHex(this.readBytes(size));
  }

  getHex(binary: Uint8Array): string {
    return Array.from(binary)
      .map((i) => i.toString(16).padStart(2, '0'))
      .join('');
  }

  readPeg(): Peg {
    const input = this.state.binary[this.state.i++];
    const address = this.readInt();
    const index = this.readInt();
    return {
      input: input === 1,
      address: address,
      index: index,
    };
  }

  getComponent(address: number): string {
    return this.state.compMap[address].display();
  }
}
