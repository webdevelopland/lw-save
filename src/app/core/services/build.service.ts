import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import { State, Peg } from '@/core/type';
import { mergeUint8Arrays } from '@/core/functions';
import { StateService } from './state.service';
import { EncodingService } from './encoding.service';
import { LoadingService } from './loading.service';

@Injectable()
export class BuildService {
  state: State;
  output: Uint8Array;

  constructor(
    private stateService: StateService,
    private encodingService: EncodingService,
    private ls: LoadingService,
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
    const comps = Object.values(this.state.compMap);
    comps.forEach(comp => {
      this.push(this.getInt(comp.address));
      this.push(this.getInt(comp.parent));
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
      } else {
        this.push(this.getInt(0));
      }
    });
    this.buildWires();
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
    this.output = mergeUint8Arrays(this.output, binary);
  }

  getInt(int: number): Uint8Array {
    return this.encodingService.uint32ToUint8Array(int).reverse();
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
