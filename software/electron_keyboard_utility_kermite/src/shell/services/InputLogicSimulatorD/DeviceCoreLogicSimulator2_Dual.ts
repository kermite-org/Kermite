import { appGlobal } from '../appGlobal';

//--------------------------------------------------------------------------------
//types

type u8 = number;
type s8 = number;
type u16 = number;
type s16 = number;
type size_t = number;

//--------------------------------------------------------------------------------
//helpers

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

//--------------------------------------------------------------------------------
//assign memory storage

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

//--------------------------------------------------------------------------------
//hid report

const ModFlag_Ctrl = 1;
const ModFlag_Shift = 2;
const ModFlag_Alt = 4;
const ModFlag_OS = 8;

const hidReportBuf: u8[] = Array(8).fill(0);

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

//--------------------------------------------------------------------------------
//assign memory reader

function getAssignsBlockAddressForKey(keyIndex: u8): s16 {
  let pos = 0;
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
    const tt = (data >> 4) & 0b11;
    const numBlockBytes = tt * 2;
    pos += numBlockBytes;
  }
  return -1;
}

const AssignType_None = 0;
const AssignType_Single = 1;
const AssignType_Dual = 2;
const AssignType_Tri = 3;
type AssignType = 0 | 1 | 2 | 3;

interface IAssignSet {
  assignType: AssignType;
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
      const tt = (entryHeaderByte >> 4) & 0b11;
      const isDual = tt === 0b10;
      const isTriple = tt === 0b11;
      const assignType = tt as AssignType;
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
    if (state.layerHoldFlags[i] || i === 0) {
      const res = getAssignSet(i, keyIndex);
      const isDefaultSchemeBlock = state.layerDefaultSchemeFlags[i];
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

//--------------------------------------------------------------------------------
//operation handlers

const state = new (class {
  layerIndex: u8 = 0;
  layerHoldFlags: boolean[] = Array(16).fill(false);
  layerDefaultSchemeFlags: boolean[] = Array(16).fill(false);
})();

const OpType_keyInput = 0b01;
const OpType_layerCall = 0b10;

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
        //shift cancel
        clearModifiers(ModFlag_Shift);
      }
      if (keyCode) {
        setOutputKeyCode(keyCode);
      }
    }
  }
  if (opType === OpType_layerCall) {
    const layerIndex = (opWord >> 8) & 0b1111;
    const withShift = (opWord >> 13) & 0b1;
    const fDS = (opWord >> 12) & 0b1;
    state.layerIndex = layerIndex;
    appGlobal.deviceService.emitLayerChangedEvent(layerIndex);
    state.layerHoldFlags[layerIndex] = true;
    state.layerDefaultSchemeFlags[layerIndex] = !!fDS;
    if (withShift) {
      setModifiers(ModFlag_Shift);
    }
    // console.log(`la`, state.layerIndex);
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
    state.layerIndex = 0;
    appGlobal.deviceService.emitLayerChangedEvent(0);
    const layerIndex = (opWord >> 8) & 0b1111;
    state.layerHoldFlags[layerIndex] = false;
    const withShift = (opWord >> 13) & 0b1;
    if (withShift) {
      clearModifiers(ModFlag_Shift);
    }
    // console.log(`la`, state.layerIndex);
  }
}

//--------------------------------------------------------------------------------
//assign binder

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

//--------------------------------------------------------------------------------
//resolver common

const resolverConfig = {
  debugShowTrigger: false,
  emitOutputStroke: true
};
//resolverConfig.debugShowTrigger = true;
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
  assignType: AssignType_None,
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

//--------------------------------------------------------------------------------
//resolver dummy

function keySlot_dummyResolver(slot: KeySlot): boolean {
  if (slot.inputEdge === 'up') {
    return true;
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver single

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

//--------------------------------------------------------------------------------
//resolver dual

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
      //tap-rehold
      keySlot_pushStepB(slot, 'D');
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= TH) {
    //hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'D' && hold && tick < TH && interrupted) {
    //interrupt hold
    keySlot_pushStepB(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= TH) {
    //slient after tap
    keySlot_pushStepB(slot, '_');
    return true;
  }

  if (inputEdge === 'up') {
    if (steps === 'D' && tick < TH) {
      //tap
      keySlot_pushStepB(slot, 'U');
    }
    if (steps === 'D_' || steps === 'DUD') {
      //hold up, rehold up
      keySlot_clearSteps(slot);
      keySlot_pushStepB(slot, 'U');
      return true;
    }
  }
  return false;
}

//--------------------------------------------------------------------------------
//resolver triple

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
      //down2
      keySlot_pushStepC(slot, 'D');
    } else {
      //down
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'D');
    }
  }

  if (steps === 'D' && hold && tick >= TH) {
    //hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'D' && hold && tick < TH && interrupted) {
    //interrupt hold
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DUD' && hold && tick >= TH) {
    //hold2
    keySlot_pushStepC(slot, '_');
  }

  if (steps === 'DU' && !hold && tick >= TH) {
    //silent after single tap
    keySlot_pushStepC(slot, '_');
    return true;
  }

  if (inputEdge === 'up') {
    if (steps === 'DUD' && tick < TH) {
      //dtap
      keySlot_pushStepC(slot, 'U');
      return true;
    } else if (steps === 'D' && tick < TH) {
      //tap
      keySlot_pushStepC(slot, 'U');
    } else {
      //up
      keySlot_clearSteps(slot);
      keySlot_pushStepC(slot, 'U');
      return true;
    }
  }

  return false;
}

//--------------------------------------------------------------------------------
//resolver root

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

//--------------------------------------------------------------------------------
//entries

export function coreLogic_handleKeyInput(keyIndex: u8, isDown: boolean) {
  triggerResolver_handleKeyInput(keyIndex, isDown);
}

const tickUpdator = createTimeIntervalCounter();

export function coreLogic_processTicker() {
  const elapsedMs = tickUpdator();
  triggerResolver_tick(elapsedMs);
  assignBinder_ticker(elapsedMs);
}
