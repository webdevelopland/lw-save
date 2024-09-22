import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import { State, Peg } from '@/core/type';
import { StateService } from './state.service';
import { EncodingService } from './encoding.service';

@Injectable()
export class BuildService {
  state: State;
  output: Uint8Array;
  address: number; // Address counter
  buildMap: { [address: number]: boolean } = { 0: true };

  constructor(
    private stateService: StateService,
    private encodingService: EncodingService,
  ) {}

  build(index: number): void {
    this.state = this.stateService.stateList[index];
    this.state.i = 0;
    if (this.state) {
      this.output = new Uint8Array();
      const header = this.readBytes(34);
      this.push(header);
      this.push(this.getInt(this.state.comps));
      this.push(this.getInt(this.state.wires));
      this.buildMods();
    }
  }

  download(): void {
    const blob = new Blob([this.output]);
    saveAs(blob, 'data.logicworld');
  }

  buildCircuit(): void {
    const len = this.state.wireStateSize;
    this.push(this.getInt(len));
    this.push(this.getZeroBytes(len));
    this.push(this.getText('redstone sux lol'));
    this.download();
  }

  buildWires(): void {
    this.state.wireList.forEach(wire => {
      this.buildPeg(wire.peg1);
      this.buildPeg(wire.peg2);
      this.push(this.getBytes(wire.stateID));
      this.push(wire.rotation);
    });
    this.buildCircuit();
  }

  buildComponents(): void {
    this.address = 1;
    this.buildComponent(this.address);
  }

  buildComponent(address: number, isParent: boolean = false): void {
    const comp = this.state.compMap[address];
    if (!comp) {
      // Not found, probably we built all of them
      this.buildWires();
      return;
    }

    if (!this.buildMap[comp.parent]) {
      // We have to add component only when parent already added
      this.buildComponent(comp.parent, true);
    }
    if (this.buildMap[comp.address]) {
      // Already added. Probably as parent of other component. Skip it.
      this.address++;
      this.buildComponent(this.address);
      return;
    }
    this.push(this.getUint(comp.address));
    this.push(this.getUint(comp.parent));
    this.push(this.getBytes(comp.nid));
    this.push(this.getInt(comp.x));
    this.push(this.getInt(comp.z));
    this.push(this.getInt(comp.y));
    this.push(comp.rotation);

    this.push(this.getInt(comp.inputs.length));
    comp.inputs.forEach(input => {
      this.push(this.getBytes(input));
    });

    this.push(this.getInt(comp.outputs.length));
    comp.outputs.forEach(output => {
      this.push(this.getBytes(output));
    });

    if (comp.customData && comp.customData.length > 0) {
      this.push(this.getInt(comp.customData.length));
      this.push(comp.customData);
    } else if (comp.customData === null) {
      this.push(this.getInt(-1));
    } else {
      this.push(this.getInt(0));
    }
    this.buildMap[address] = true;
    if (!isParent) {
      // Build next
      this.address++;
      this.buildComponent(this.address);
    }
  }

  buildComponentIds(): void {
    const ids = Object.keys(this.state.nidMap);
    this.push(this.getInt(ids.length));
    ids.forEach(nid => {
      const name = this.state.nidMap[nid];
      this.push(this.getBytes(nid));
      this.push(this.getInt(name.length));
      this.push(this.getText(name));
    });
    this.buildComponents();
  }

  buildMods(): void {
    this.push(this.getInt(this.state.mods.length));
    this.state.mods.forEach(mod => {
      this.push(this.getInt(mod.name.length));
      this.push(mod.name);
      this.push(mod.version);
    });
    this.buildComponentIds();
  }

  push(binary: Uint8Array): void {
    this.output = this.encodingService.mergeUint8Arrays(this.output, binary);
  }

  getUint(int: number): Uint8Array {
    return this.encodingService.uint32ToUint8Array(int).reverse();
  }

  getInt(int: number): Uint8Array {
    return this.encodingService.int32ToUint8Array(int).reverse();
  }

  getText(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  getBytes(hex: string): Uint8Array {
    return Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  }

  getZeroBytes(size: number): Uint8Array {
    const array: number[] = [];
    for (let i = 0; i < size; i++) {
      array.push(0);
    }
    return Uint8Array.from(array);
  }

  buildPeg(peg: Peg): void {
    const input: string = peg.input ? '01' : '02';
    this.push(this.getBytes(input));
    this.push(this.getInt(peg.address));
    this.push(this.getInt(peg.index));
  }

  readBytes(size: number): Uint8Array {
    return this.state.binary.slice(this.state.i, this.state.i += size);
  }
}
