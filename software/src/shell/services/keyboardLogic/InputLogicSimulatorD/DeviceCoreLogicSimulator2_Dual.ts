/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  AssignStorageBaseAddr,
  AssignStorageHeaderLength,
} from '~/shell/services/keyboardLogic/InputLogicSimulatorD/MemoryDefs';
import { KeyboardCoreLogicInterface } from './KeyboardCoreLogicInterface';

// --------------------------------------------------------------------------------
// types

type u8 = number;
type s8 = number;
type u16 = number;
type s16 = number;
type size_t = number;

// --------------------------------------------------------------------------------
// helpers

function strU16Bin(val: u16) {
  return `0000000000000000${val.toString(2)}`.slice(-16);
}

function strU16Hex(val: u16) {
  return `0000${val.toString(16)}`.slice(-4);
}

function getFieldNameByValue(obj: any, value: string) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return undefined;
}

// --------------------------------------------------------------------------------
// assign memory storage

let procConfigStorageReadByte = (addr: u16) => 0;

function setConfigStorageReaderProc(proc: (addr: u16) => u8) {
  procConfigStorageReadByte = proc;
}

function readStorageByte(addr: u16): u8 {
  return procConfigStorageReadByte(addr);
}

function readStorageWordBE(addr: u16): u16 {
  const a = readStorageByte(addr);
  const b = readStorageByte(addr + 1);
  return (a << 8) | b;
}

// --------------------------------------------------------------------------------
// hid report

const ModFlag = {
  Ctrl: 1,
  Shift: 2,
  Alt: 4,
  OS: 8,
};

const NumHidReportBytes = 8;
const NumHidHoldKeySlots = 6;

const hidReportState = new (class {
  hidReportZerosBuf: u8[] = Array(NumHidReportBytes).fill(0);
  hidReportBuf: u8[] = Array(NumHidReportBytes).fill(0);
  layerModFlags: u8 = 0;
  modFlags: u8 = 0;
  adhocModFlags: u8 = 0;
  shiftCancelActive: boolean = false;
  hidKeyCodes: u8[] = Array(NumHidHoldKeySlots).fill(0);
  nextKeyPos: u8 = 0;
})();

function resetHidReportState() {
  const rs = hidReportState;
  rs.hidReportBuf.fill(0);
  rs.layerModFlags = 0;
  rs.modFlags = 0;
  rs.adhocModFlags = 0;
  rs.shiftCancelActive = false;
  rs.hidKeyCodes.fill(0);
  rs.nextKeyPos = 0;
}

function getOutputHidReport(): u8[] {
  const rs = hidReportState;

  let modifiers = rs.layerModFlags | rs.modFlags | rs.adhocModFlags;
  if (rs.shiftCancelActive) {
    modifiers &= ~ModFlag.Shift;
  }
  rs.hidReportBuf[0] = modifiers;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    rs.hidReportBuf[i + 2] = rs.hidKeyCodes[i];
  }
  return rs.hidReportBuf;
}

function getOutputHidReportZeros(): u8[] {
  return hidReportState.hidReportZerosBuf;
}

function setLayerModifiers(modFlags: u8) {
  hidReportState.layerModFlags |= modFlags;
}

function clearLayerModifiers(modFlags: u8) {
  hidReportState.layerModFlags &= ~modFlags;
}

function setModifiers(modFlags: u8) {
  hidReportState.modFlags |= modFlags;
}

function clearModifiers(modFlags: u8) {
  hidReportState.modFlags &= ~modFlags;
}

function setAdhocModifiers(modFlags: u8) {
  hidReportState.adhocModFlags |= modFlags;
}

function clearAdhocModifiers(modFlags: u8) {
  hidReportState.adhocModFlags &= ~modFlags;
}

function rollNextKeyPos() {
  const rs = hidReportState;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    rs.nextKeyPos = (rs.nextKeyPos + 1) % NumHidHoldKeySlots;
    if (rs.hidKeyCodes[rs.nextKeyPos] === 0) {
      break;
    }
  }
  return rs.nextKeyPos;
}

function setOutputKeyCode(hidKeyCode: u8) {
  const pos = rollNextKeyPos();
  hidReportState.hidKeyCodes[pos] = hidKeyCode;
}

function clearOutputKeyCode(hidKeyCode: u8) {
  const rs = hidReportState;
  for (let i = 0; i < NumHidHoldKeySlots; i++) {
    if (rs.hidKeyCodes[i] === hidKeyCode) {
      rs.hidKeyCodes[i] = 0;
    }
  }
}

function startShiftCancel() {
  hidReportState.shiftCancelActive = true;
}

function endShiftCancel() {
  hidReportState.shiftCancelActive = false;
}

function getOutputModifiers() {
  return hidReportState.hidReportBuf[0];
}

// --------------------------------------------------------------------------------
// assign memory reader

const NumLayersMax = 16;
const AssignStorageHeaderLocation = AssignStorageBaseAddr;
const AssignStorageBodyLocation =
  AssignStorageBaseAddr + AssignStorageHeaderLength;
const assignMemoryReaderState = new (class {
  numLayers: u8 = 0;
  assignsStartAddress: u16 = 0;
  assignsEndAddress: u16 = 0;
  layerAttributeWords: u16[] = Array(NumLayersMax).fill(0);
})();

function initAssignMemoryReader() {
  const state = assignMemoryReaderState;
  const numLayers = readStorageByte(AssignStorageHeaderLocation + 8);
  const bodyLength = readStorageWordBE(AssignStorageHeaderLocation + 9);
  state.numLayers = numLayers;
  state.assignsStartAddress = AssignStorageBodyLocation + numLayers * 2;
  state.assignsEndAddress = AssignStorageBodyLocation + bodyLength;
  for (let i = 0; i < NumLayersMax; i++) {
    state.layerAttributeWords[i] =
      (i < numLayers && readStorageWordBE(AssignStorageBodyLocation + i * 2)) ||
      0;
  }
}

function getNumLayers() {
  return assignMemoryReaderState.numLayers;
}

function isLayerDefaultSchemeBlock(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 15) & 1) === 1;
}

function getLayerAttachedModifiers(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return (attrWord >> 8) & 0b1111;
}

function getLayerInitialActive(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return ((attrWord >> 13) & 1) === 1;
}

function getLayerExclusionGroup(layerIndex: u8) {
  const attrWord = assignMemoryReaderState.layerAttributeWords[layerIndex];
  return attrWord & 0b111;
}

function getAssignsBlockAddressForKey(targetKeyIndex: u8): u16 {
  let addr = assignMemoryReaderState.assignsStartAddress;
  while (addr < assignMemoryReaderState.assignsEndAddress) {
    const data = readStorageWordBE(addr);
    const fIsAssign = ((data >> 15) & 1) > 0;
    const fBodyLength = (data >> 8) & 0x3f;
    const fKeyIndex = data & 0xff;

    if (!fIsAssign) {
      break;
    }
    if (fKeyIndex === targetKeyIndex) {
      return addr;
    }

    addr += 2;
    addr += fBodyLength;
  }
  return 0;
}

const AssignType = {
  None: 0,
  Signle: 1,
  Dual: 2,
  Tri: 3,
  Block: 4,
  Transparent: 5,
};

const assignTypeToBodyByteSizeMap: { [key in number]: number } = {
  [AssignType.None]: 0,
  [AssignType.Signle]: 2,
  [AssignType.Dual]: 4,
  [AssignType.Tri]: 6,
  [AssignType.Block]: 0,
  [AssignType.Transparent]: 0,
};

function getAssignBlockAddressForLayer(
  baseAddr: u8,
  targetLayerIndex: u8,
): u16 {
  const len = readStorageByte(baseAddr) & 0x3f;
  let addr = baseAddr + 2;
  const endPos = addr + len;
  while (addr < endPos) {
    const data = readStorageByte(addr);
    const layerIndex = data & 0b1111;
    if (layerIndex === targetLayerIndex) {
      return addr;
    }
    addr++;
    const assignType = (data >> 4) & 0b111;
    const numBlockBytes = assignTypeToBodyByteSizeMap[assignType];
    addr += numBlockBytes;
  }
  return 0;
}

interface IAssignSet {
  assignType: u8;
  pri: u16;
  sec: u16;
  ter: u16;
  layerIndex: s8;
}

function getAssignSetInLayer(
  keyIndex: u8,
  layerIndex: u8,
): IAssignSet | undefined {
  const addr0 = getAssignsBlockAddressForKey(keyIndex);
  if (addr0 > 0) {
    const addr1 = getAssignBlockAddressForLayer(addr0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (addr1 > 0) {
      const entryHeaderByte = readStorageByte(addr1);
      const assignType = (entryHeaderByte >> 4) & 0b111;
      const isBlock = assignType === 4;
      const isTrans = assignType === 5;
      if (isBlock || isTrans) {
        return { assignType, pri: 0, sec: 0, ter: 0, layerIndex: -1 };
      }
      const isDual = assignType === 2;
      const isTriple = assignType === 3;
      const pri = readStorageWordBE(addr1 + 1);
      const sec = isDual || isTriple ? readStorageWordBE(addr1 + 3) : 0;
      const ter = isTriple ? readStorageWordBE(addr1 + 5) : 0;
      return {
        assignType,
        pri,
        sec,
        ter,
        layerIndex,
      };
    }
  }
  return undefined;
}

// --------------------------------------------------------------------------------
// operation handlers

const OpType = {
  KeyInput: 1,
  LayerCall: 2,
  LayerClearExclusive: 3,
};

const InvocationMode = {
  Hold: 1,
  TurnOn: 2,
  TurnOff: 3,
  Toggle: 4,
  Oneshot: 5,
};

const layerState = new (class {
  layerActiveFlags: u16 = 0;
  oneshotLayerIndex: s8 = -1;
  oneshotCancelTick: s8 = -1;
})();

function resetLayerState() {
  layerState.layerActiveFlags = 0;
  const numLayers = getNumLayers();
  for (let i = 0; i < numLayers; i++) {
    const initialActive = getLayerInitialActive(i);
    if (initialActive) {
      layerState.layerActiveFlags |= 1 << i;
    }
  }
  layerState.oneshotLayerIndex = -1;
  layerState.oneshotCancelTick = -1;
}

function getLayerActiveFlags() {
  return layerState.layerActiveFlags;
}

function findAssignInLayerStack(keyIndex: u8): IAssignSet | undefined {
  for (let i = 15; i >= 0; i--) {
    if ((layerState.layerActiveFlags >> i) & 1) {
      const res = getAssignSetInLayer(keyIndex, i);
      const isDefaultSchemeBlock = isLayerDefaultSchemeBlock(i);
      if (res?.assignType === AssignType.Transparent) {
        continue;
      }
      if (res?.assignType === AssignType.Block) {
        return undefined;
      }
      if (!res && isDefaultSchemeBlock) {
        return undefined;
      }
      if (res) {
        return res;
      }
    }
  }
  return undefined;
}

const layerMutations = new (class {
  isActive(layerIndex: number) {
    return ((layerState.layerActiveFlags >> layerIndex) & 1) > 0;
  }

  private turnOffSiblingLayersIfNeed(layerIndex: number) {
    const targetExclusionGroup = getLayerExclusionGroup(layerIndex);
    if (targetExclusionGroup !== 0) {
      this.clearExclusive(targetExclusionGroup, layerIndex);
    }
  }

  activate(layerIndex: number) {
    if (!this.isActive(layerIndex)) {
      this.turnOffSiblingLayersIfNeed(layerIndex);
      layerState.layerActiveFlags |= 1 << layerIndex;
      // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
      console.log(`layer on ${layerIndex}`);
      const modifiers = getLayerAttachedModifiers(layerIndex);
      if (modifiers) {
        setLayerModifiers(modifiers);
      }
    }
  }

  deactivate(layerIndex: number) {
    if (this.isActive(layerIndex)) {
      layerState.layerActiveFlags &= ~(1 << layerIndex);
      // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
      console.log(`layer off ${layerIndex}`);
      const modifiers = getLayerAttachedModifiers(layerIndex);
      if (modifiers) {
        clearLayerModifiers(modifiers);
      }
    }
  }

  toggle(layerIndex: number) {
    !this.isActive(layerIndex)
      ? this.activate(layerIndex)
      : this.deactivate(layerIndex);
  }

  oneshot(layerIndex: number) {
    this.activate(layerIndex);
    layerState.oneshotLayerIndex = layerIndex;
    layerState.oneshotCancelTick = -1;
    console.log('oneshot');
  }

  clearOneshot() {
    if (
      layerState.oneshotLayerIndex !== -1 &&
      layerState.oneshotCancelTick === -1
    ) {
      layerState.oneshotCancelTick = 0;
    }
  }

  oneshotCancellerTicker(ms: u16) {
    if (
      layerState.oneshotLayerIndex !== -1 &&
      layerState.oneshotCancelTick >= 0
    ) {
      layerState.oneshotCancelTick += ms;
      if (layerState.oneshotCancelTick > 50) {
        console.log(`cancel oneshot`);
        this.deactivate(layerState.oneshotLayerIndex);
        layerState.oneshotLayerIndex = -1;
        layerState.oneshotCancelTick = -1;
      }
    }
  }

  clearExclusive(targetExclusiveGroup: number, skipLayerIndex: number = -1) {
    const numLayers = getNumLayers();
    for (let i = 0; i < numLayers; i++) {
      if (i === skipLayerIndex) {
        continue;
      }
      const groupIndex = getLayerExclusionGroup(i);
      const inGroup = groupIndex === targetExclusiveGroup;
      if (inGroup) {
        this.deactivate(i);
      }
    }
  }

  recoverMainLayerIfAllLayeresDisabled() {
    const isAllOff = layerState.layerActiveFlags === 0;
    if (isAllOff) {
      this.activate(0);
    }
  }
})();

function handleOperationOn(opWord: u16) {
  const opType = (opWord >> 14) & 0b11;
  if (opType === OpType.KeyInput) {
    const hidKey = opWord & 0x3ff;
    const modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      setModifiers(modFlags);
    }
    if (hidKey) {
      const keyCode = hidKey & 0xff;
      const shiftOn = hidKey & 0x100;
      const shiftCancel = hidKey & 0x200;

      const outputModifiers = getOutputModifiers();
      const isOtherModifiersClean = (outputModifiers & 0b1101) === 0;
      if (shiftOn) {
        setAdhocModifiers(ModFlag.Shift);
      }
      if (shiftCancel && isOtherModifiersClean) {
        // shift cancel
        startShiftCancel();
      }
      if (keyCode) {
        setOutputKeyCode(keyCode);
      }
    }
  }
  if (opType === OpType.LayerCall) {
    const layerIndex = (opWord >> 8) & 0b1111;
    const fInvocationMode = (opWord >> 4) & 0b1111;

    if (fInvocationMode === InvocationMode.Hold) {
      layerMutations.activate(layerIndex);
    } else if (fInvocationMode === InvocationMode.TurnOn) {
      layerMutations.activate(layerIndex);
    } else if (fInvocationMode === InvocationMode.TurnOff) {
      layerMutations.deactivate(layerIndex);
    } else if (fInvocationMode === InvocationMode.Toggle) {
      layerMutations.toggle(layerIndex);
    } else if (fInvocationMode === InvocationMode.Oneshot) {
      layerMutations.oneshot(layerIndex);
    }
  }
  if (opType === OpType.LayerClearExclusive) {
    const targetGroup = (opWord >> 8) & 0b111;
    layerMutations.clearExclusive(targetGroup);
  }

  if (opType !== OpType.LayerCall) {
    layerMutations.clearOneshot();
  }
  layerMutations.recoverMainLayerIfAllLayeresDisabled();
}

function handleOperationOff(opWord: u16) {
  const opType = (opWord >> 14) & 0b11;
  if (opType === OpType.KeyInput) {
    const hidKey = opWord & 0x3ff;
    const modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      clearModifiers(modFlags);
    }
    if (hidKey) {
      const keyCode = hidKey & 0xff;
      const shiftOn = hidKey & 0x100;
      const shiftCancel = hidKey & 0x200;
      if (shiftOn) {
        clearAdhocModifiers(ModFlag.Shift);
      }
      if (shiftCancel) {
        endShiftCancel();
      }
      if (keyCode) {
        clearOutputKeyCode(keyCode);
      }
    }
  }
  if (opType === OpType.LayerCall) {
    const layerIndex = (opWord >> 8) & 0b1111;
    const fInvocationMode = (opWord >> 4) & 0b1111;
    if (fInvocationMode === InvocationMode.Hold) {
      layerMutations.deactivate(layerIndex);
    }
  }
  layerMutations.recoverMainLayerIfAllLayeresDisabled();
}

// --------------------------------------------------------------------------------
// assign binder

interface RecallKeyEntry {
  keyIndex: s8;
  tick: u8;
}

const NumKeySlotsMax = 255;
const NumRecallKeyEntries = 4;
const ImmediateReleaseStrokeDuration = 50;

const assignBinderState = new (class {
  keyAttachedOperationWords: u16[] = Array(NumKeySlotsMax).fill(0);
  recallKeyEntries: RecallKeyEntry[] = [];
})();

function resetAssignBinder() {
  assignBinderState.keyAttachedOperationWords.fill(0);
  assignBinderState.recallKeyEntries = Array(NumRecallKeyEntries)
    .fill(0)
    .map(() => ({
      keyIndex: -1,
      tick: 0,
    }));
}

function handleKeyOn(keyIndex: u8, opWord: u16) {
  // console.log(`keyOn ${keyIndex} ${opWord}`);
  handleOperationOn(opWord);
  assignBinderState.keyAttachedOperationWords[keyIndex] = opWord;
}

function handleKeyOff(keyIndex: u8) {
  const opWord = assignBinderState.keyAttachedOperationWords[keyIndex];
  if (opWord) {
    // console.log(`keyOff ${keyIndex} ${opWord}`);
    handleOperationOff(opWord);
    assignBinderState.keyAttachedOperationWords[keyIndex] = 0;
  }
}

function recallKeyOff(keyIndex: u8) {
  const ke = assignBinderState.recallKeyEntries.find((a) => a.keyIndex === -1);
  if (ke) {
    ke.keyIndex = keyIndex;
    ke.tick = 0;
  }
}

function assignBinder_ticker(ms: u16) {
  for (const ke of assignBinderState.recallKeyEntries) {
    if (ke.keyIndex !== -1) {
      ke.tick += ms;
      if (ke.tick > ImmediateReleaseStrokeDuration) {
        handleKeyOff(ke.keyIndex);
        ke.keyIndex = -1;
      }
    }
  }
}

// --------------------------------------------------------------------------------
// resolver common

const TH = 200;

const resolverConfig = {
  debugShowTrigger: false,
  emitOutputStroke: true,
};
// resolverConfig.debugShowTrigger = true;
// resolverConfig.emitOutputStroke = false;

interface KeySlot {
  keyIndex: u8;
  steps: string;
  hold: boolean;
  nextHold: boolean;
  tick: u16;
  interrupted: boolean;
  resolving: boolean;
  assignSet: IAssignSet;
  resolverProc: ((slot: KeySlot) => boolean) | undefined;
  inputEdge: 'down' | 'up' | undefined;
}

const resolverState = new (class {
  interruptKeyIndex: number = -1;
  keySlots: KeySlot[] = [];
  assignHitResultWord: number = 0;
})();

const fallbackAssignSet: IAssignSet = {
  assignType: AssignType.None,
  pri: 0,
  sec: 0,
  ter: 0,
  layerIndex: -1,
};

function initResolverState() {
  resolverState.interruptKeyIndex = -1;
  resolverState.assignHitResultWord = 0;
  resolverState.keySlots = Array(NumKeySlotsMax)
    .fill(0)
    .map((_, i) => ({
      keyIndex: i,
      steps: '',
      hold: false,
      nextHold: false,
      tick: 0,
      interrupted: false,
      resolving: false,
      assignSet: fallbackAssignSet,
      resolverProc: undefined,
      inputEdge: undefined,
    }));
}

function storeAssignHitResult(
  slot: KeySlot,
  prioritySpec: number, // 1:pri, 2:sec, 3:ter
) {
  const fKeyIndex = slot.keyIndex;
  const fLayerIndex = slot.assignSet.layerIndex;
  const fSlotSpec = prioritySpec;
  resolverState.assignHitResultWord =
    (1 << 15) | (fSlotSpec << 12) | (fLayerIndex << 8) | fKeyIndex;
}

function peekAssignHitResult() {
  if (resolverState.assignHitResultWord !== 0) {
    const res = resolverState.assignHitResultWord;
    resolverState.assignHitResultWord = 0;
    return res;
  }
  return 0;
}

function keySlot_clearSteps(slot: KeySlot) {
  slot.steps = '';
}

function keySlot_debugShowSlotTrigger(slot: KeySlot, triggerObj: any) {
  const trigger = getFieldNameByValue(triggerObj, slot.steps) || '--';
  console.log(`[TRIGGER] ${slot.keyIndex} ${slot.steps} ${trigger}`);
}

// --------------------------------------------------------------------------------
// resolver dummy

function keySlot_dummyResolver(slot: KeySlot): boolean {
  if (slot.inputEdge === 'up') {
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver single

const TriggerA = {
  Down: 'D',
  Up: 'U',
};

function keySlot_pushStepA(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerA);
  }

  const { keyIndex, assignSet, steps } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerA.Down) {
      handleKeyOn(keyIndex, assignSet.pri);
      storeAssignHitResult(slot, 1);
    }

    if (steps === TriggerA.Up) {
      handleKeyOff(keyIndex);
    }
  }
}

function keySlot_singleResolverA(slot: KeySlot): boolean {
  const { inputEdge } = slot;

  if (inputEdge === 'down') {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, 'D');
  }
  if (inputEdge === 'up') {
    keySlot_clearSteps(slot);
    keySlot_pushStepA(slot, 'U');
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver dual

const TriggerB = {
  Down: 'D',
  Tap: 'DU',
  Hold: 'D_',
  Rehold: 'DUD',
  Up: 'U',
};

function keySlot_pushStepB(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;
  slot.tick = 0;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerB);
  }

  const { steps, keyIndex, assignSet } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerB.Down) {
    }

    if (steps === TriggerB.Tap) {
      handleKeyOn(keyIndex, assignSet.pri);
      recallKeyOff(keyIndex);
      storeAssignHitResult(slot, 1);
    }

    if (steps === TriggerB.Hold) {
      handleKeyOn(keyIndex, assignSet.sec);
      storeAssignHitResult(slot, 2);
    }

    if (steps === TriggerB.Rehold) {
      handleKeyOn(keyIndex, assignSet.pri);
    }

    if (steps === TriggerB.Up) {
      handleKeyOff(keyIndex);
    }
  }
}

function keySlot_dualResolverB(slot: KeySlot): boolean {
  const { inputEdge, hold, steps, tick, interrupted } = slot;

  if (inputEdge === 'down') {
    if (steps === 'DU' && tick < TH) {
      // tap-rehold
      keySlot_pushStepB(slot, 'D');
    } else {
      // down
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= TH) {
    // hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'D' && hold && tick < TH && interrupted) {
    // interrupt hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= TH) {
    // slient after tap
    keySlot_pushStepB(slot, '_');
    return true;
  }

  if (inputEdge === 'up') {
    if (steps === 'D' && tick < TH) {
      // tap
      keySlot_pushStepB(slot, 'U');
    }
    if (steps === 'D_' || steps === 'DUD') {
      // hold up, rehold up
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'U');
      return true;
    }
  }
  return false;
}

// --------------------------------------------------------------------------------
// resolver triple

const TriggerC = {
  Down: 'D',
  Hold: 'D_',
  Tap: 'DU_',
  Hold2: 'DUD_',
  Tap2: 'DUDU',
  Up: 'U',
};

function keySlot_pushStepC(slot: KeySlot, step: 'D' | 'U' | '_') {
  slot.steps += step;
  slot.tick = 0;

  if (resolverConfig.debugShowTrigger) {
    keySlot_debugShowSlotTrigger(slot, TriggerC);
  }

  const { steps, keyIndex, assignSet } = slot;

  if (resolverConfig.emitOutputStroke) {
    if (steps === TriggerC.Down) {
    }

    if (steps === TriggerC.Tap) {
      handleKeyOn(keyIndex, assignSet.pri);
      recallKeyOff(keyIndex);
      storeAssignHitResult(slot, 1);
    }

    if (steps === TriggerC.Hold) {
      handleKeyOn(keyIndex, assignSet.sec);
      storeAssignHitResult(slot, 2);
    }

    if (steps === TriggerC.Hold2) {
      handleKeyOn(keyIndex, assignSet.pri);
    }

    if (steps === TriggerC.Tap2) {
      handleKeyOn(keyIndex, assignSet.ter);
      recallKeyOff(keyIndex);
      storeAssignHitResult(slot, 3);
    }

    if (steps === TriggerC.Up) {
      handleKeyOff(keyIndex);
    }
  }
}
function keySlot_tripleResolverC(slot: KeySlot): boolean {
  const { inputEdge, steps, tick, hold, interrupted } = slot;

  if (inputEdge === 'down') {
    if (steps === 'DU' && tick < TH) {
      // down2
      keySlot_pushStepC(slot, 'D');
    } else {
      // down
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= TH) {
    // hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'D' && hold && tick < TH && interrupted) {
    // interrupt hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DUD' && hold && tick >= TH) {
    // hold2
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= TH) {
    // silent after single tap
    keySlot_pushStepC(slot, '_');
    return true;
  }

  if (inputEdge === 'up') {
    if (steps === 'DUD' && tick < TH) {
      // dtap
      keySlot_pushStepC(slot, 'U');
      return true;
    } else if (steps === 'D' && tick < TH) {
      // tap
      keySlot_pushStepC(slot, 'U');
    } else {
      // up
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'U');
      return true;
    }
  }

  return false;
}

// --------------------------------------------------------------------------------
// resolver root

const keySlotResolverFuncs = [
  keySlot_dummyResolver,
  keySlot_singleResolverA,
  keySlot_dualResolverB,
  keySlot_tripleResolverC,
];

function keySlot_tick(slot: KeySlot, ms: number) {
  slot.tick += ms;

  slot.inputEdge = undefined;
  if (!slot.hold && slot.nextHold) {
    slot.hold = true;
    slot.inputEdge = 'down';
  }
  if (slot.hold && !slot.nextHold) {
    slot.hold = false;
    slot.inputEdge = 'up';
  }

  const intrrupt_kidx = resolverState.interruptKeyIndex;
  slot.interrupted = intrrupt_kidx !== -1 && intrrupt_kidx !== slot.keyIndex;

  if (!slot.resolverProc && slot.inputEdge === 'down') {
    slot.assignSet = findAssignInLayerStack(slot.keyIndex) || fallbackAssignSet;
    slot.resolverProc = keySlotResolverFuncs[slot.assignSet.assignType];
    if (resolverConfig.debugShowTrigger) {
      console.log(
        `resolver attached ${slot.keyIndex} ${slot.assignSet.assignType}`,
      );
    }
  }

  if (slot.resolverProc) {
    const done = slot.resolverProc(slot);
    if (done) {
      slot.resolverProc = undefined;
      if (resolverConfig.debugShowTrigger) {
        console.log(`resolver detached ${slot.keyIndex}`);
      }
    }
  }
}

function triggerResolver_tick(ms: number) {
  const { keySlots } = resolverState;
  const hotSlot = keySlots[resolverState.interruptKeyIndex];
  keySlots.forEach((slot) => {
    if (slot !== hotSlot) {
      keySlot_tick(slot, ms);
    }
  });
  if (hotSlot) {
    keySlot_tick(hotSlot, ms);
  }
  resolverState.interruptKeyIndex = -1;
}

function triggerResolver_handleKeyInput(keyIndex: u8, isDown: boolean) {
  const slot = resolverState.keySlots[keyIndex];
  if (isDown) {
    console.log(`down ${keyIndex}`);
    resolverState.interruptKeyIndex = keyIndex;
    slot.nextHold = true;
  } else {
    console.log(`up ${keyIndex}`);
    slot.nextHold = false;
  }
}

// --------------------------------------------------------------------------------
// entries

let logicActive: boolean = false;

function keyboardCoreLogic_initialize() {
  initAssignMemoryReader();
  resetHidReportState();
  resetLayerState();
  resetAssignBinder();
  initResolverState();
  logicActive = true;
}

function keyboardCoreLogic_getOutputHidReportBytes(): number[] {
  if (logicActive) {
    return getOutputHidReport();
  } else {
    return getOutputHidReportZeros();
  }
}

function keyboardCoreLogic_getLayerActiveFlags(): number {
  if (logicActive) {
    return getLayerActiveFlags();
  } else {
    return 0;
  }
}

function keyboardCoreLogic_peekAssignHitResult(): number {
  if (logicActive) {
    return peekAssignHitResult();
  } else {
    return 0;
  }
}

function keyboardCoreLogic_issuePhysicalKeyStateChanged(
  keyIndex: number,
  isDown: boolean,
) {
  if (logicActive) {
    triggerResolver_handleKeyInput(keyIndex, isDown);
  }
}

function keyboardCoreLogic_processTicker(ms: number) {
  if (logicActive) {
    triggerResolver_tick(ms);
    assignBinder_ticker(ms);
    layerMutations.oneshotCancellerTicker(ms);
  }
}

function keyboardCoreLogic_halt() {
  logicActive = false;
}

export function getKeyboardCoreLogicInterface(): KeyboardCoreLogicInterface {
  return {
    keyboardCoreLogic_setAssignStorageReaderFunc: setConfigStorageReaderProc,
    keyboardCoreLogic_initialize,
    keyboardCoreLogic_getOutputHidReportBytes,
    keyboardCoreLogic_getLayerActiveFlags,
    keyboardCoreLogic_peekAssignHitResult,
    keyboardCoreLogic_issuePhysicalKeyStateChanged,
    keyboardCoreLogic_processTicker,
    keyboardCoreLogic_halt,
  };
}
