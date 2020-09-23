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
    const isDual = tt === 0b10;
    const numBlockBytes = isDual ? 4 : 2;
    pos += numBlockBytes;
  }
  return -1;
}

const AssignType_None = 0;
const AssignType_Single = 1;
const AssignType_Dual = 2;
type AssignType = 0 | 1 | 2;

function getAssignType(layerIndex: u8, keyIndex: u8): AssignType {
  const buf = storageBuf;
  const pos0 = getKeyBoundAssignSetHeaderPos(keyIndex);
  if (pos0 >= 0) {
    const pos1 = getLayerBoundAssignEntryHeaderPos(pos0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (pos1 >= 0) {
      const entryHeaderByte = buf[pos1];
      const tt = (entryHeaderByte >> 4) & 0b11;
      const isDual = tt === 0b10;
      return isDual ? AssignType_Dual : AssignType_Single;
    }
  }
  return AssignType_None;
}

function getAssignOperationWord(
  layerIndex: u8,
  keyIndex: u8,
  readSecondary: boolean
): u16 {
  const buf = storageBuf;
  const pos0 = getKeyBoundAssignSetHeaderPos(keyIndex);
  if (pos0 >= 0) {
    const pos1 = getLayerBoundAssignEntryHeaderPos(pos0, layerIndex);
    // console.log({ keyIndex, layerIndex, pos0: pos0 + 24, pos1: pos1 + 24 });
    if (pos1 >= 0) {
      const entryHeaderByte = buf[pos1];
      const tt = (entryHeaderByte >> 4) & 0b11;
      const isDual = tt === 0b10;
      if (readSecondary) {
        if (isDual) {
          return (buf[pos1 + 3] << 8) | buf[pos1 + 4];
        } else {
          return 0;
        }
      } else {
        return (buf[pos1 + 1] << 8) | buf[pos1 + 2];
      }
    }
  }
  return 0;
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
    state.layerIndex = layerIndex;
    appGlobal.deviceService.emitLayerChangedEvent(layerIndex);
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
    const withShift = (opWord >> 13) & 0b1;
    if (withShift) {
      clearModifiers(ModFlag_Shift);
    }
    // console.log(`la`, state.layerIndex);
  }
}

//--------------------------------------------------------------------------------
//input handlers

const state1 = new (class {
  boundAssigns: u16[] = new Array(128).fill(0);
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

/*
pri: down
sec: none
の場合
input Trigger.Down or Trigger.Rehold --> output Down (bind)
input Trigger.Up or Trigger.Tap --> output Up (bind)

pri: tap
sec: hold
の場合
pri:
 input Trigger.Tap --> instant output Down + Up (delayed)
 input Trigger.Rehold --> output Down (bind)
 input Trigger.Up --> output Up (bind)
sec:
 input Trigger.Hold --> output Down (bind)
 input Trigger.Up --> output Up (bind)
*/
function assignBinder_issueInputTrigger(keyIndex: u8, trigger: Trigger) {
  //todo: 多階層対応
  let assignType = getAssignType(state.layerIndex, keyIndex);

  if (assignType === AssignType_Dual) {
    const pri = getAssignOperationWord(state.layerIndex, keyIndex, false);
    const sec = getAssignOperationWord(state.layerIndex, keyIndex, true);

    if (pri) {
      if (trigger === Trigger.Tap) {
        handleKeyOn(keyIndex, pri);
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

    if (trigger === Trigger.TapDelayedRelease) {
      handleKeyOff(keyIndex);
    }
    if (trigger === Trigger.Up) {
      handleKeyOff(keyIndex);
    }
  }

  if (assignType === AssignType_Single) {
    const pri = getAssignOperationWord(state.layerIndex, keyIndex, false);
    if (trigger === Trigger.Down || trigger === Trigger.Rehold) {
      handleKeyOn(keyIndex, pri);
    }
    if (trigger === Trigger.Up || trigger === Trigger.Tap) {
      handleKeyOff(keyIndex);
    }
  }
}

//--------------------------------------------------------------------------------

//Down-Tap-TapRelease(-Rehold-Up)
//Down-Hold-Up
enum Trigger {
  Down = 'D',
  Up = 'U',
  Tap = 'T',
  Hold = 'H',
  Rehold = 'R',
  TapDelayedRelease = 'V'
}

//event sequence state transition patterns
type TriggerSequenceStr =
  | '' //none
  | 'D' //down
  | 'DT' //down-tap
  | 'DTV' //down-tap-tapRelease
  | 'DH' //down-hold
  | 'DHU' //down-hold-up
  | 'DTVR' //down-tap-tapRelease-rehold
  | 'DTVRU'; //down-tap-tapRelease-rehold-up

interface KeySlot {
  keyIndex: u8;
  strEvents: TriggerSequenceStr;
  // events: u16;
  hold: boolean;
  holdTick: u16;
  releaseTick: u16;
  tapReleaseTick: s16;
}

const keySlots: KeySlot[] = Array(128)
  .fill(0)
  .map((_, i) => ({
    keyIndex: i,
    // events: 0,
    strEvents: '',
    hold: false,
    holdTick: 0,
    releaseTick: 0,
    tapReleaseTick: 0
  }));

function emitTrigger(
  slot: KeySlot,
  trigger: Trigger,
  newState: TriggerSequenceStr
) {
  console.log(`[TRIGGER] ${slot.keyIndex} ${trigger}, ${newState}`);
  slot.strEvents = newState;
  assignBinder_issueInputTrigger(slot.keyIndex, trigger);
}

const TH = 300;
const TapReleaseTime = 10;

function keySlot_inputDown(slot: KeySlot) {
  if (!slot.hold) {
    slot.hold = true;
    slot.holdTick = 0;
    if (slot.strEvents === 'DTV' && slot.releaseTick < TH) {
      emitTrigger(slot, Trigger.Rehold, 'DTVR');
      return;
    }
    slot.strEvents = '';
    emitTrigger(slot, Trigger.Down, 'D');
  }
}

function keySlot_inputUp(slot: KeySlot) {
  if (slot.hold) {
    slot.hold = false;
    if (slot.strEvents === 'D' && slot.holdTick < TH) {
      emitTrigger(slot, Trigger.Tap, 'DT');
      slot.tapReleaseTick = TapReleaseTime;
      return;
    }
    if (slot.strEvents === 'DH') {
      emitTrigger(slot, Trigger.Up, 'DHU');
    }
    if (slot.strEvents === 'DTVR') {
      emitTrigger(slot, Trigger.Up, 'DTVRU');
    }
  }
}

function keySlot_tick(slot: KeySlot, ms: number) {
  if (slot.hold) {
    slot.holdTick += ms;
    if (slot.strEvents === 'D' && slot.holdTick > TH) {
      emitTrigger(slot, Trigger.Hold, 'DH');
    }
  }
  if (slot.strEvents === 'DTV' && slot.releaseTick < 10000) {
    slot.releaseTick += ms;
  }

  if (slot.strEvents === 'DT' && slot.tapReleaseTick > 0) {
    slot.tapReleaseTick -= ms;
    if (slot.tapReleaseTick <= 0) {
      emitTrigger(slot, Trigger.TapDelayedRelease, 'DTV');
      slot.releaseTick = 0;
    }
  }
}

function keySlot_interrupted(slot: KeySlot) {
  if (slot.strEvents === 'D' && slot.hold && slot.holdTick < TH) {
    emitTrigger(slot, Trigger.Hold, 'DH');
  }
}

function triggerResolver_handleKeyInput(keyIndex: u8, isDown: boolean) {
  const slot = keySlots[keyIndex];
  if (isDown) {
    console.log(`down ${keyIndex}`);

    keySlots
      .filter((ks) => ks !== slot && ks.hold)
      .forEach((ks) => keySlot_interrupted(ks));

    keySlot_inputDown(slot);
  } else {
    console.log(`up ${keyIndex}`);
    keySlot_inputUp(slot);
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
}
