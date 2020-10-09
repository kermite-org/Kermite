/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */

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

function copyBytes(dst: u8[], src: u8[], len: size_t) {
  for (let i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

function getFieldNameByValue(obj: any, value: string) {
  for (const key in obj) {
    if (obj[key] === value) {
      return key;
    }
  }
  return undefined;
}

function createTimeIntervalCounter() {
  let prevTick = Date.now();
  return () => {
    const tick = Date.now();
    const elapsedMs = tick - prevTick;
    prevTick = tick;
    return elapsedMs;
  };
}

// --------------------------------------------------------------------------------
// assign memory storage

const StorageBufCapacity = 1024;
const storageBuf: u8[] = Array(StorageBufCapacity).fill(0);
let storageBufLength = 0;

export function coreLogic_writeProfileDataBlob(bytes: u8[]) {
  const len = bytes.length;
  if (len < StorageBufCapacity) {
    copyBytes(storageBuf, bytes, len);
    storageBufLength = len;
  }
}

// --------------------------------------------------------------------------------
// hid report

const ModFlag_Ctrl = 1;
const ModFlag_Shift = 2;
const ModFlag_Alt = 4;
const ModFlag_OS = 8;

const hidReportBuf: u8[] = Array(8).fill(0);

function resetHidReportBuf() {
  hidReportBuf.fill(0);
}

export function coreLogic_getOutputHidReport(): u8[] {
  return hidReportBuf;
}

function setModifiers(modFlags: u8) {
  hidReportBuf[0] |= modFlags;
}

function clearModifiers(modFlags: u8) {
  hidReportBuf[0] &= ~modFlags;
}

function setOutputKeyCode(hidKeyCode: u8) {
  hidReportBuf[2] = hidKeyCode;
}

// --------------------------------------------------------------------------------
// assign memory reader

let assignMemoryKeyAssignsDataOffset = 0;
let assignMemoryLayerAttributeBytes: number[] = [];

function initAssignMemoryReader() {
  const numLayers = storageBuf[0];
  assignMemoryLayerAttributeBytes = storageBuf.slice(1, 1 + numLayers * 2);
  assignMemoryKeyAssignsDataOffset = 1 + numLayers * 2;
}

function isLayerDefaultSchemeBlock(layerIndex: u8) {
  const attrByte = assignMemoryLayerAttributeBytes[layerIndex * 2];
  return ((attrByte >> 7) & 1) === 1;
}

function isLayerWithShift(layerIndex: u8) {
  const attrByte = assignMemoryLayerAttributeBytes[layerIndex * 2];
  return ((attrByte >> 6) & 1) === 1;
}

function getAssignsBlockAddressForKey(keyIndex: u8): s16 {
  let pos = assignMemoryKeyAssignsDataOffset;
  while (pos < storageBufLength) {
    const data = storageBuf[pos];
    if (data === 0) {
      break;
    }
    if ((data & 0x80) > 0 && (data & 0x7f) === keyIndex) {
      return pos;
    }
    pos++;
    const bodyLength = storageBuf[pos++];
    pos += bodyLength;
  }
  return -1;
}

const AssignType = {
  None: 0,
  Signle: 1,
  Dual: 2,
  Tri: 3,
  Block: 4,
  Transparent: 5
};

const assignTypeToBodyByteSizeMap: { [key in number]: number } = {
  [AssignType.None]: 0,
  [AssignType.Signle]: 2,
  [AssignType.Dual]: 4,
  [AssignType.Tri]: 6,
  [AssignType.Block]: 0,
  [AssignType.Transparent]: 0
};

function getAssignBlockAddressForLayer(basePos: u8, targetLayerIndex: u8): s16 {
  const buf = storageBuf;
  const len = buf[basePos + 1];
  let pos = basePos + 2;
  const endPos = pos + len;
  while (pos < endPos) {
    const data = buf[pos];
    const layerIndex = data & 0b1111;
    if (layerIndex === targetLayerIndex) {
      return pos;
    }
    pos++;
    const assignType = (data >> 4) & 0b111;
    const numBlockBytes = assignTypeToBodyByteSizeMap[assignType];
    pos += numBlockBytes;
  }
  return -1;
}

interface IAssignSet {
  assignType: u8;
  pri: u16;
  sec: u16;
  ter: u16;
}

function getAssignSet(layerIndex: u8, keyIndex: u8): IAssignSet | undefined {
  const buf = storageBuf;
  const pos0 = getAssignsBlockAddressForKey(keyIndex);
  if (pos0 >= 0) {
    const pos1 = getAssignBlockAddressForLayer(pos0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (pos1 >= 0) {
      const entryHeaderByte = buf[pos1];
      const assignType = (entryHeaderByte >> 4) & 0b111;
      const isBlock = assignType === 4;
      const isTrans = assignType === 5;
      if (isBlock || isTrans) {
        return { assignType, pri: 0, sec: 0, ter: 0 };
      }
      const isDual = assignType === 2;
      const isTriple = assignType === 3;
      const pri = (buf[pos1 + 1] << 8) | buf[pos1 + 2];
      const sec =
        ((isDual || isTriple) && (buf[pos1 + 3] << 8) | buf[pos1 + 4]) || 0;
      const ter = (isTriple && (buf[pos1 + 5] << 8) | buf[pos1 + 6]) || 0;
      return {
        assignType,
        pri,
        sec,
        ter
      };
    }
  }
  return undefined;
}

function getAssignSetL(keyIndex: u8): IAssignSet | undefined {
  for (let i = 15; i >= 0; i--) {
    if (state.layerHoldFlags[i]) {
      const res = getAssignSet(i, keyIndex);
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

// --------------------------------------------------------------------------------
// operation handlers

const OpType_keyInput = 0b01;
const OpType_layerCall = 0b10;

const InvocationMode = {
  Hold: 1,
  TurnOn: 2,
  TurnOff: 3,
  Toggle: 4,
  Base: 5,
  Oneshot: 6,
  Exclusive: 7,
  ClearExclusive: 8
};

const state = new (class {
  baseLayerIndex: u8 = 0;
  excLayerIndex: s8 = -1;
  layerHoldFlags: boolean[] = Array(16).fill(false);
})();

function resetLayerState() {
  state.baseLayerIndex = 0;
  state.excLayerIndex = -1;
  state.layerHoldFlags.fill(false);
  state.layerHoldFlags[0] = true;
}

let layerStateCallback = (flags: boolean[]) => {};

export function coreLogic_setLayerStateCallback(
  proc: (flags: boolean[]) => void
) {
  layerStateCallback = proc;
}

function notifyLayerStateChanged() {
  layerStateCallback(state.layerHoldFlags);
}

const layerMutations = new (class {
  isActive(layerIndex: number) {
    return state.layerHoldFlags[layerIndex];
  }

  activate(layerIndex: number) {
    if (!this.isActive(layerIndex)) {
      state.layerHoldFlags[layerIndex] = true;
      notifyLayerStateChanged();
      // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
      console.log(`layer on ${layerIndex}`);
      const withShift = isLayerWithShift(layerIndex);
      if (withShift) {
        setModifiers(ModFlag_Shift);
      }
    }
  }

  deactivate(layerIndex: number) {
    if (this.isActive(layerIndex)) {
      state.layerHoldFlags[layerIndex] = false;
      notifyLayerStateChanged();
      // console.log(state.layerHoldFlags.map((a) => (a ? 1 : 0)).join(''));
      console.log(`layer off ${layerIndex}`);
      const withShift = isLayerWithShift(layerIndex);
      if (withShift) {
        clearModifiers(ModFlag_Shift);
      }
    }
  }

  toggle(layerIndex: number) {
    !this.isActive(layerIndex)
      ? this.activate(layerIndex)
      : this.deactivate(layerIndex);
  }

  base(layerIndex: number) {
    if (layerIndex !== state.baseLayerIndex) {
      this.deactivate(state.baseLayerIndex);
      this.activate(layerIndex);
      state.baseLayerIndex = layerIndex;
    }
  }

  exclusive(layerIndex: number) {
    if (layerIndex !== state.excLayerIndex) {
      if (state.excLayerIndex !== -1) {
        this.deactivate(state.excLayerIndex);
      }
      this.activate(layerIndex);
      state.excLayerIndex = layerIndex;
    }
  }

  clearExclusive() {
    if (this.isActive(state.excLayerIndex)) {
      this.deactivate(state.excLayerIndex);
      state.excLayerIndex = -1;
    }
  }
})();

function handleOperationOn(opWord: u16) {
  const opType = (opWord >> 14) & 0b11;
  if (opType === OpType_keyInput) {
    const hidKey = opWord & 0x3ff;
    const modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      setModifiers(modFlags);
    }
    if (hidKey) {
      const keyCode = hidKey & 0xff;
      const shiftOn = hidKey & 0x100;
      const shiftOff = hidKey & 0x200;

      const isOtherModifiersClean = (hidReportBuf[0] & 0b1101) === 0;
      if (shiftOn) {
        setModifiers(ModFlag_Shift);
      }
      if (shiftOff && isOtherModifiersClean) {
        // shift cancel
        clearModifiers(ModFlag_Shift);
      }
      if (keyCode) {
        setOutputKeyCode(keyCode);
      }
    }
  }
  if (opType === OpType_layerCall) {
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
    } else if (fInvocationMode === InvocationMode.Base) {
      layerMutations.base(layerIndex);
    } else if (fInvocationMode === InvocationMode.Exclusive) {
      layerMutations.exclusive(layerIndex);
    } else if (fInvocationMode === InvocationMode.ClearExclusive) {
      layerMutations.clearExclusive();
    }
  }
}

function handleOperationOff(opWord: u16) {
  const opType = (opWord >> 14) & 0b11;
  if (opType === OpType_keyInput) {
    const hidKey = opWord & 0x3ff;
    const modFlags = (opWord >> 10) & 0b1111;
    if (modFlags) {
      clearModifiers(modFlags);
    }
    if (hidKey) {
      const keyCode = hidKey & 0xff;
      const shiftOn = hidKey & 0x100;
      const shiftOff = hidKey & 0x200;
      if (shiftOn) {
        clearModifiers(ModFlag_Shift);
      }
      if (shiftOff) {
      }
      if (keyCode) {
        setOutputKeyCode(0);
      }
    }
  }
  if (opType === OpType_layerCall) {
    const layerIndex = (opWord >> 8) & 0b1111;
    const fInvocationMode = (opWord >> 4) & 0b1111;
    if (fInvocationMode === InvocationMode.Hold) {
      layerMutations.deactivate(layerIndex);
    }
  }
}

// --------------------------------------------------------------------------------
// assign binder

interface RecallKeyEntry {
  keyIndex: s8;
  tick: u8;
}

const state1 = new (class {
  keyAttachedOperationWords: u16[] = Array(128).fill(0);
  recallKeyEntries: RecallKeyEntry[] = Array(4)
    .fill(0)
    .map(() => ({
      keyIndex: -1,
      tick: 0
    }));
})();

function resetAssignBinder() {
  state1.keyAttachedOperationWords.fill(0);
  state1.recallKeyEntries = Array(4)
    .fill(0)
    .map(() => ({
      keyIndex: -1,
      tick: 0
    }));
}

function handleKeyOn(keyIndex: u8, opWord: u16) {
  // console.log(`keyOn ${keyIndex} ${opWord}`);
  handleOperationOn(opWord);
  state1.keyAttachedOperationWords[keyIndex] = opWord;
}

function handleKeyOff(keyIndex: u8) {
  const opWord = state1.keyAttachedOperationWords[keyIndex];
  if (opWord) {
    // console.log(`keyOff ${keyIndex} ${opWord}`);
    handleOperationOff(opWord);
    state1.keyAttachedOperationWords[keyIndex] = 0;
  }
}

function recallKeyOff(keyIndex: u8) {
  const ke = state1.recallKeyEntries.find((a) => a.keyIndex === -1);
  if (ke) {
    ke.keyIndex = keyIndex;
    ke.tick = 0;
  }
}

function assignBinder_ticker(ms: u16) {
  for (const ke of state1.recallKeyEntries) {
    if (ke.keyIndex !== -1) {
      ke.tick += ms;
      if (ke.tick > 50) {
        handleKeyOff(ke.keyIndex);
        ke.keyIndex = -1;
      }
    }
  }
}

// --------------------------------------------------------------------------------
// resolver common

const resolverConfig = {
  debugShowTrigger: false,
  emitOutputStroke: true
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

const local = new (class {
  interruptKeyIndex: number = -1;
})();

const fallbackAssignSet: IAssignSet = {
  assignType: AssignType.None,
  pri: 0,
  sec: 0,
  ter: 0
};

const keySlots: KeySlot[] = Array(128)
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
    inputEdge: undefined
  }));

const TH = 200;

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
  Up: 'U'
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
  Up: 'U'
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
    }

    if (steps === TriggerB.Hold) {
      handleKeyOn(keyIndex, assignSet.sec);
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
  Up: 'U'
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
    }

    if (steps === TriggerC.Hold) {
      handleKeyOn(keyIndex, assignSet.sec);
    }

    if (steps === TriggerC.Hold2) {
      handleKeyOn(keyIndex, assignSet.pri);
    }

    if (steps === TriggerC.Tap2) {
      handleKeyOn(keyIndex, assignSet.ter);
      recallKeyOff(keyIndex);
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
  keySlot_tripleResolverC
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

  const intrrupt_kidx = local.interruptKeyIndex;
  slot.interrupted = intrrupt_kidx !== -1 && intrrupt_kidx !== slot.keyIndex;

  if (!slot.resolverProc && slot.inputEdge === 'down') {
    slot.assignSet = getAssignSetL(slot.keyIndex) || fallbackAssignSet;
    slot.resolverProc = keySlotResolverFuncs[slot.assignSet.assignType];
    if (resolverConfig.debugShowTrigger) {
      console.log(
        `resolver attached ${slot.keyIndex} ${slot.assignSet.assignType}`
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
  const hotSlot = keySlots[local.interruptKeyIndex];
  keySlots.forEach((slot) => {
    if (slot !== hotSlot) {
      keySlot_tick(slot, ms);
    }
  });
  if (hotSlot) {
    keySlot_tick(hotSlot, ms);
  }
  local.interruptKeyIndex = -1;
}

function triggerResolver_handleKeyInput(keyIndex: u8, isDown: boolean) {
  const slot = keySlots[keyIndex];
  if (isDown) {
    console.log(`down ${keyIndex}`);
    local.interruptKeyIndex = keyIndex;
    slot.nextHold = true;
  } else {
    console.log(`up ${keyIndex}`);
    slot.nextHold = false;
  }
}

// --------------------------------------------------------------------------------
// entries

export function coreLogic_reset() {
  initAssignMemoryReader();
  resetHidReportBuf();
  resetLayerState();
  resetAssignBinder();
  notifyLayerStateChanged();
}

export function coreLogic_handleKeyInput(keyIndex: u8, isDown: boolean) {
  triggerResolver_handleKeyInput(keyIndex, isDown);
}

const tickUpdator = createTimeIntervalCounter();

export function coreLogic_processTicker() {
  const elapsedMs = tickUpdator();
  triggerResolver_tick(elapsedMs);
  assignBinder_ticker(elapsedMs);
}
