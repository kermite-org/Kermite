type u8 = number;
type s8 = number;
type u16 = number;
type s16 = number;
type size_t = number;

const hidReportBuf: u8[] = new Array(8).fill(0);

const StorageBufSize = 1024;

const writableStorageBuf: u8[] = new Array(StorageBufSize).fill(0);

let storageBufLength = 0;

function helpers_copyBytes(dst: u8[], src: u8[], len: size_t) {
  for (let i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

export function coreLogic_getOutputHidReport(): u8[] {
  return hidReportBuf;
  // return undefined;
}

export function coreLogic_writeProfileDataBlob(bytes: u8[]) {
  const len = bytes.length;
  if (len < StorageBufSize) {
    helpers_copyBytes(writableStorageBuf, bytes, len);
    storageBufLength = len;
  }
}

function getKeyBoundAssignSetHeaderPos(keyIndex: u16): s16 {
  const buf = writableStorageBuf;
  let pos = 0;
  while (pos < storageBufLength) {
    const data = buf[pos];
    if (data === 0) {
      break;
    }
    if ((data & 0x80) > 0 && (data & 0x7f) === keyIndex) {
      return pos;
    }
    pos++;
    const bodyLength = buf[pos++];
    pos += bodyLength;
  }
  return -1;
}

function getLayerBoundAssignEntryHeaderPos(
  basePos: u16,
  targetLayerIndex: u16
): s16 {
  const buf = writableStorageBuf;
  let pos = basePos + 2;
  while (pos < storageBufLength) {
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
  const buf = writableStorageBuf;
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

function strU16Bin(val: u16) {
  return `0000000000000000${val.toString(2)}`.slice(-16);
}

export function coreLogic_handleKeyInput(keyIndex: u8, isDown: boolean) {
  const layerIndex = 0;

  if (isDown) {
    const opWord = getAssignOperationWord(layerIndex, keyIndex, false);
    console.log('op:', strU16Bin(opWord));
  }
}

export function coreLogic_processTicker() {}
