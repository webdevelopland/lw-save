import { Injectable } from '@angular/core';

import { State, Mod, Component, Wire } from '@/core/type';
import { StateService } from './state.service';
import { EncodingService } from './encoding.service';

interface AdrMap { [address: number]: number }
interface WireMap { [id: string]: string }

@Injectable()
export class CombineService {
  state: State;
  address: number = 1; // New counter of addresses
  wsn: number = 1; // New counter of wire states
  adrMap1: AdrMap = {};
  adrMap2: AdrMap = {};
  wireMap1: WireMap = {};
  wireMap2: WireMap = {};
  reverseNidMap: { [name: string]: string } = {}; // name -> nid

  constructor(
    private stateService: StateService,
    private es: EncodingService,
  ) {}

  combine(): void {
    const saveFile = new State();
    this.stateService.stateList.push(saveFile);
    this.state = saveFile;
    const st1 = this.stateService.stateList[0];
    const st2 = this.stateService.stateList[1];
    this.state.binary = st1.binary; // To copy header from here
    this.state.comps = st1.comps + st2.comps;
    this.state.wires = st1.wires + st2.wires;
    this.state.wireStateSize = st1.wireStateSize + st2.wireStateSize;
    // Mod
    st1.mods.forEach(mod => this.addMod(mod));
    st2.mods.forEach(mod => this.addMod(mod));
    // Nid
    Object.values(st1.nidMap).forEach(nid => this.addNid(nid));
    Object.values(st2.nidMap).forEach(nid => this.addNid(nid));
    // Components
    Object.values(st1.compMap).forEach(comp => this.createAddressMap(comp, this.adrMap1));
    Object.values(st2.compMap).forEach(comp => this.createAddressMap(comp, this.adrMap2));
    Object.values(st1.compMap)
      .sort((a, b) => a.parent - b.parent)
      .forEach(comp => this.createComponent(comp, this.adrMap1, this.wireMap1, -30000));
    Object.values(st2.compMap)
      .sort((a, b) => a.parent - b.parent)
      .forEach(comp => this.createComponent(comp, this.adrMap2, this.wireMap2, 30000));
    // Wires
    st1.wireList.forEach(wire => this.createWire(wire, this.wireMap1, this.adrMap1));
    st2.wireList.forEach(wire => this.createWire(wire, this.wireMap2, this.adrMap2));
  }

  createWire(wire: Wire, wMap: WireMap, aMap: AdrMap): void {
    this.updateWireMap(wire.stateID, wMap);
    const newWire = new Wire();
    newWire.stateID = wMap[wire.stateID];
    newWire.rotation = wire.rotation;
    newWire.peg1 = {
      index: wire.peg1.index,
      address: aMap[wire.peg1.address],
      input: wire.peg1.input,
    };
    newWire.peg2 = {
      index: wire.peg2.index,
      address: aMap[wire.peg2.address],
      input: wire.peg2.input,
    };
    this.state.wireList.push(newWire);
  }

  addMod(mod: Mod): void {
    const found = this.state.getMod(mod.id);
    if (!found) {
      this.state.mods.push(mod);
    }
  }

  addNid(name: string): void {
    const nids: string[] = Object.values(this.state.nidMap);
    if (!nids.includes(name)) {
      const index: number = nids.length;
      const hex: string = this.es.numToHex(index, 2);
      this.state.nidMap[hex] = name;
      this.reverseNidMap[name] = hex;
    }
  }

  createAddressMap(comp: Component, aMap: AdrMap): void {
    aMap[comp.address] = this.address;
    this.address++;
  }

  createComponent(comp: Component, aMap: AdrMap, wMap: WireMap, gap = 0): void {
    const newAddress = aMap[comp.address];
    const newComp = new Component(newAddress);
    if (comp.parent !== 0) {
      newComp.parent = aMap[comp.parent];
    }
    comp.inputs.forEach(input => {
      this.updateWireMap(input, wMap);
      newComp.inputs.push(wMap[input]);
    });
    comp.outputs.forEach(output => {
      this.updateWireMap(output, wMap);
      newComp.outputs.push(wMap[output]);
    });
    newComp.x = comp.x;
    newComp.y = comp.y;
    newComp.z = comp.z;
    if (comp.parent === 0) {
      newComp.x += gap;
      newComp.y += gap;
    }
    newComp.rotation = comp.rotation;
    newComp.customData = comp.customData;
    newComp.name = comp.name;
    newComp.nid = this.reverseNidMap[comp.name];
    this.state.compMap[newComp.address] = newComp;
  }

  updateWireMap(id: string, wMap: WireMap): void {
    if (!wMap[id]) {
      const newId: string = this.es.numToHex(this.wsn++);
      wMap[id] = newId;
    }
  }
}
