type u8 = number;
type s8 = number;
type u16 = number;

const hidReportBuf: u8[] = new Array(8).fill(0);

const StorageBufSize = 1024;

const writableStorageBuf: u8[] = new Array(StorageBufSize).fill(0);

function helpers_copyBytes(src: u8[], dst: u8[], len: number) {
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
  }
}

export function coreLogic_handleKeyInput(keyId: u8, isDown: boolean) {}

export function coreLogic_processTicker() {}
