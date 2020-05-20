type u8 = number;
type s8 = number;
type u16 = number;
type s16 = number;
type size_t = number;

const hidReportBuf: u8[] = new Array(8).fill(0);

const StorageBufCapacity = 1024;
const storageBuf: u8[] = new Array(StorageBufCapacity).fill(0);
let storageBufLength = 0;

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

export function coreLogic_getOutputHidReport(): u8[] {
  return hidReportBuf;
}

export function coreLogic_writeProfileDataBlob(bytes: u8[]) {
  const len = bytes.length;
  if (len < StorageBufCapacity) {
    copyBytes(storageBuf, bytes, len);
    storageBufLength = len;
  }
}

function getKeyBoundAssignSetHeaderPos(keyIndex: u16): s16 {
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
  basePos: u16,
  targetLayerIndex: u16
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

function getAssignOperationWord(
  layerIndex: number,
  keyIndex: number,
  isSecondary: boolean
): u16 {
  const buf = storageBuf;
  const pos0 = getKeyBoundAssignSetHeaderPos(keyIndex);
  if (pos0 >= 0) {
    const pos1 = getLayerBoundAssignEntryHeaderPos(pos0, layerIndex);
    if (pos1 >= 0) {
      const entryHeaderByte = buf[pos1];
      const tt = (entryHeaderByte >> 4) & 0b11;
      const isDual = tt === 0b10;
      if (isDual && isSecondary) {
        return (buf[pos1 + 3] << 8) | buf[pos1 + 4];
      } else {
        return (buf[pos1 + 1] << 8) | buf[pos1 + 2];
      }
    }
  }
  return 0;
}

const state = new (class {
  layerIndex: number = 0;
  boundAssigns: number[] = new Array(128).fill(0);
})();

const OpType_keyInput = 0b01;
const OpType_layerCall = 0b10;

function handleKeyInputDown(keyIndex: u8) {
  let opWord = getAssignOperationWord(state.layerIndex, keyIndex, false);
  if (!opWord) {
    opWord = getAssignOperationWord(0, keyIndex, false);
  }
  if (opWord) {
    // console.log('op', strU16Hex(opWord));
    const opType = (opWord >> 14) & 0b11;
    if (opType === OpType_keyInput) {
      const hidKey = opWord & 0x3ff;
      const modFlag = (opWord >> 10) & 0b1111;
      if (modFlag) {
        hidReportBuf[0] |= modFlag;
      }
      if (hidKey) {
        const keyCode = hidKey & 0xff;
        const shiftOn = hidKey & 0x100;
        const shiftOff = hidKey & 0x200;
        if (shiftOn) {
          hidReportBuf[0] = 2;
        }
        if (shiftOff) {
          hidReportBuf[0] = 0;
        }
        if (keyCode) {
          hidReportBuf[2] = keyCode;
        }
      }
    }
    if (opType === OpType_layerCall) {
      const layerIndex = (opWord >> 8) & 0b1111;
      const withShift = (opWord >> 13) & 0b1;
      state.layerIndex = layerIndex;
      if (withShift) {
        hidReportBuf[0] = 2;
      }
      // console.log(`la`, state.layerIndex);
    }
    state.boundAssigns[keyIndex] = opWord;
  }
}

function handleKeyInputUp(keyIndex: u8) {
  const opWord = state.boundAssigns[keyIndex];
  if (opWord) {
    const opType = (opWord >> 14) & 0b11;
    if (opType === OpType_keyInput) {
      const hidKey = opWord & 0x3ff;
      const modFlag = (opWord >> 10) & 0b1111;
      if (modFlag) {
        hidReportBuf[0] &= ~modFlag;
      }
      if (hidKey) {
        const keyCode = hidKey & 0xff;
        const shiftOn = hidKey & 0x100;
        const shiftOff = hidKey & 0x200;
        if (shiftOn) {
          hidReportBuf[0] = 0;
        }
        if (shiftOff) {
        }
        if (keyCode) {
          hidReportBuf[2] = 0;
        }
      }
    }
    if (opType === OpType_layerCall) {
      state.layerIndex = 0;
      const withShift = (opWord >> 13) & 0b1;
      if (withShift) {
        hidReportBuf[0] = 0;
      }
      // console.log(`la`, state.layerIndex);
    }
    state.boundAssigns[keyIndex] = 0;
  }
}

export function coreLogic_handleKeyInput(keyIndex: u8, isDown: boolean) {
  if (isDown) {
    handleKeyInputDown(keyIndex);
  } else {
    handleKeyInputUp(keyIndex);
  }
}

export function coreLogic_processTicker() {}
