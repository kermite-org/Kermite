/* eslint-disable @typescript-eslint/no-use-before-define */
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

//--------------------------------------------------------------------------------
//assign memory storage

const StorageBufCapacity = 1024;
const storageBuf: u8[] = new Array(StorageBufCapacity).fill(0);
let storageBufLength = 0;

export function coreLogic_writeProfileDataBlob(bytes: u8[]) {
  const len = bytes.length;
  if (len < StorageBufCapacity) {
    copyBytes(storageBuf, bytes, len);
    storageBufLength = len;
  }
}

//--------------------------------------------------------------------------------
//assign memory reader

function getKeyBoundAssignSetHeaderPos(keyIndex: u8): s16 {
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

function getLayerBoundAssignEntryHeaderPos(
  basePos: u8,
  targetLayerIndex: u8
): s16 {
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
  pri?: u16;
  sec?: u16;
  ter?: u16;
}

function getAssignSet(layerIndex: u8, keyIndex: u8): IAssignSet | undefined {
  const buf = storageBuf;
  const pos0 = getKeyBoundAssignSetHeaderPos(keyIndex);
  if (pos0 >= 0) {
    const pos1 = getLayerBoundAssignEntryHeaderPos(pos0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (pos1 >= 0) {
      const entryHeaderByte = buf[pos1];
      const tt = (entryHeaderByte >> 4) & 0b11;
      const isDual = tt === 0b10;
      const isTriple = tt === 0b11;
      const assignType = tt as AssignType;
      const pri = (buf[pos1 + 1] << 8) | buf[pos1 + 2];
      const sec =
        ((isDual || isTriple) && (buf[pos1 + 3] << 8) | buf[pos1 + 4]) ||
        undefined;
      const ter =
        (isTriple && (buf[pos1 + 5] << 8) | buf[pos1 + 6]) || undefined;
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

//--------------------------------------------------------------------------------
//hid report

const ModFlag_Ctrl = 1;
const ModFlag_Shift = 2;
const ModFlag_Alt = 4;
const ModFlag_OS = 8;

const hidReportBuf: u8[] = new Array(8).fill(0);

export function coreLogic_getOutputHidReport(): u8[] {
  return hidReportBuf;
}

function setModifiers(modFlags: u8) {
  hidReportBuf[0] |= modFlags;
}

function clearModifiers(modFlags: u8) {
  hidReportBuf[0] &= ~modFlags;
}

function setOutputKeyCode(kc: u8) {
  hidReportBuf[2] = kc;
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
    console.log(`la`, state.layerIndex);
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
    console.log(`la`, state.layerIndex);
  }
}

//--------------------------------------------------------------------------------
//input handlers

interface RecallKeyEntry {
  keyIndex: s8;
  tick: u8;
}

const state1 = new (class {
  boundAssigns: u16[] = Array(128).fill(0);
  recallKeyEntries: RecallKeyEntry[] = Array(4)
    .fill(0)
    .map(() => ({
      keyIndex: -1,
      tick: 0
    }));
  preBoundAssignSets: (IAssignSet | undefined)[] = Array(128).fill(undefined);
})();

function handleKeyOn(keyIndex: u8, opWord: u16) {
  console.log(`keyOn ${keyIndex} ${opWord}`);
  handleOperationOn(opWord);
  state1.boundAssigns[keyIndex] = opWord;
}

function handleKeyOff(keyIndex: u8) {
  const opWord = state1.boundAssigns[keyIndex];
  if (opWord) {
    console.log(`keyOff ${keyIndex} ${opWord}`);
    handleOperationOff(opWord);
    state1.boundAssigns[keyIndex] = 0;
  }
}

function recallKeyOff(keyIndex: u8) {
  const ke = state1.recallKeyEntries.find((a) => a.keyIndex === -1);
  if (ke) {
    ke.keyIndex = keyIndex;
    ke.tick = 0;
  }
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
}

function assignBinder_issueInputTrigger(keyIndex: u8, trigger: string) {
  if (trigger === Trigger.Down) {
    state1.preBoundAssignSets[keyIndex] = getAssignSetL(keyIndex);
  }

  const assignSet = state1.preBoundAssignSets[keyIndex];
  if (!assignSet) {
    return;
  }

  const { assignType } = assignSet;

  if (assignType === AssignType_Tri) {
    const { pri, sec, ter } = assignSet;

    if (pri) {
      if (trigger === Trigger.SingleTap) {
        handleKeyOn(keyIndex, pri);
        recallKeyOff(keyIndex);
      }
      if (trigger === Trigger.Hold2) {
        handleKeyOn(keyIndex, pri);
      }
    }
    if (sec) {
      if (trigger === Trigger.Hold) {
        handleKeyOn(keyIndex, sec);
      }
    }
    if (ter) {
      if (trigger === Trigger.DoubleTap) {
        handleKeyOn(keyIndex, ter);
        recallKeyOff(keyIndex);
      }
    }

    if (trigger === Trigger.Up) {
      handleKeyOff(keyIndex);
    }
  }

  if (assignType === AssignType_Dual) {
    const { pri, sec } = assignSet;
    if (pri) {
      if (trigger === Trigger.Tap) {
        handleKeyOn(keyIndex, pri);
        recallKeyOff(keyIndex);
      }
      if (trigger === Trigger.Rehold) {
        handleKeyOn(keyIndex, pri);
      }
    }
    if (sec) {
      if (trigger === Trigger.Hold) {
        handleKeyOn(keyIndex, sec);
      }
    }

    if (trigger === Trigger.Up || trigger === Trigger.DoubleTap) {
      handleKeyOff(keyIndex);
    }
  }

  if (assignType === AssignType_Single) {
    const { pri } = assignSet;
    if (pri) {
      if (trigger === Trigger.Down || trigger === Trigger.Rehold) {
        handleKeyOn(keyIndex, pri);
      }
    }
    if (
      trigger === Trigger.Up ||
      trigger === Trigger.Tap ||
      trigger === Trigger.DoubleTap
    ) {
      handleKeyOff(keyIndex);
    }
  }
}

function assignBinder_ticker(ms: u16) {
  for (const ke of state1.recallKeyEntries) {
    if (ke.keyIndex !== -1) {
      ke.tick += ms;
      if (ke.tick > 10) {
        handleKeyOff(ke.keyIndex);
        ke.keyIndex = -1;
      }
    }
  }
}

//--------------------------------------------------------------------------------

const Trigger = {
  Down: 'D',
  Tap: 'DU', //素早くタップ
  Hold: 'D_', //キーを押した状態で若干待ち
  SingleTap: 'DU_', //1回タップ後若干待ち
  Rehold: 'DUD', //タップした後すぐ同じキーを押下
  Hold2: 'DUD_', //タップした後すぐ同じキーを押下し若干待ち
  DoubleTap: 'DUDU', //2回タップ
  Up: 'U'
};
const triggerValues = Object.values(Trigger);

function getTriggerName(value: string) {
  for (const key in Trigger) {
    if ((Trigger as any)[key] === value) {
      return key;
    }
  }
  return undefined;
}

interface KeySlot {
  keyIndex: u8;
  steps: string;
  hold: boolean;
  nextHold: boolean;
  tick: u16;
}

const local = new (class {
  inerruptKeyIndex: number = -1;
})();

const keySlots: KeySlot[] = Array(128)
  .fill(0)
  .map((_, i) => ({
    keyIndex: i,
    steps: '',
    hold: false,
    nextHold: false,
    tick: 0
  }));

const TH = 200;

function clearSteps(slot: KeySlot) {
  slot.steps = '';
}

function pushStep(slot: KeySlot, s: string) {
  slot.steps += s;

  const isTrigger = triggerValues.some((tr) => slot.steps === tr);
  if (isTrigger) {
    const trigger = slot.steps;
    const triggerName = getTriggerName(trigger);
    console.log(`[TRIGGER] ${slot.keyIndex} ${trigger} ${triggerName}`);
    assignBinder_issueInputTrigger(slot.keyIndex, trigger);
  }
  slot.tick = 0;
}

function keySlot_tick(slot: KeySlot, ms: number) {
  slot.tick += ms;

  if (local.inerruptKeyIndex !== -1) {
    for (const slot of keySlots) {
      if (slot.steps === 'D' && slot.hold && slot.tick < TH) {
        //interrupt hold
        pushStep(slot, '_');
      }
    }
    local.inerruptKeyIndex = -1;
  }

  const { steps, tick, hold, nextHold } = slot;

  if (!hold && nextHold) {
    slot.hold = true;
    if (steps === 'DU' && tick < TH) {
      //rehold
      pushStep(slot, 'D');
    } else {
      //down
      clearSteps(slot);
      pushStep(slot, 'D');
    }
  }

  if (hold && steps === 'D' && tick >= TH) {
    //hold
    pushStep(slot, '_');
  }

  if (hold && steps === 'DUD' && tick >= TH) {
    //hold2
    pushStep(slot, '_');
  }

  if (!hold && steps === 'DU' && tick >= TH) {
    //silent after single tap
    pushStep(slot, '_');
  }

  if (hold && !nextHold) {
    slot.hold = false;
    if ((steps === 'D' || steps === 'DUD') && tick < TH) {
      //tap, dtap
      pushStep(slot, 'U');
    } else {
      //up
      clearSteps(slot);
      pushStep(slot, 'U');
    }
  }
}

function triggerResolver_handleKeyInput(keyIndex: u8, isDown: boolean) {
  const slot = keySlots[keyIndex];
  if (isDown) {
    console.log(`down ${keyIndex}`);
    local.inerruptKeyIndex = keyIndex;
    slot.nextHold = true;
  } else {
    console.log(`up ${keyIndex}`);
    slot.nextHold = false;
  }
}

function triggerResolver_tick(ms: number) {
  keySlots.forEach((slot) => keySlot_tick(slot, ms));
}

//--------------------------------------------------------------------------------
//entries

export function coreLogic_handleKeyInput(keyIndex: u8, isDown: boolean) {
  triggerResolver_handleKeyInput(keyIndex, isDown);
}

let prevTick = Date.now();
export function coreLogic_processTicker() {
  const tick = Date.now();
  const ms = tick - prevTick;
  prevTick = tick;
  triggerResolver_tick(ms);
  assignBinder_ticker(ms);
}
