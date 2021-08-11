import { serializeCustomKeyboardSpec } from '@/CustomKeyboardDataSerializer';
import { keyboardSpec_astelia, keyboardSpec_dw4 } from '@/KeyboardVariants';
import * as fs from 'fs';

function compareArray(ar1: number[], ar2: number[]): boolean {
  if (ar1.length !== ar2.length) {
    return false;
  }
  for (let i = 0; i < ar1.length; i++) {
    if (ar1[i] != ar2[i]) {
      return false;
    }
  }
  return true;
}

function replaceArrayConent(dst: number[], dstOffset: number, src: number[]) {
  for (let i = 0; i < src.length; i++) {
    dst[dstOffset + i] = src[i];
  }
}

function getBinaryContentMarkerIndex(
  bytes: number[],
  markerString: string
): number {
  const markerBytes = markerString.split('').map((chr) => chr.charCodeAt(0));
  const n = markerBytes.length;
  if (n > bytes.length) {
    return -1;
  }
  for (let i = 0; i < bytes.length - n; i++) {
    const part = bytes.slice(i, i + n);
    if (compareArray(part, markerBytes)) {
      return i;
    }
  }
  return -1;
}

function forgeStandardKeyboardFirmwareAvr() {
  const targetKeyboardSpec = keyboardSpec_astelia;
  // const targetKeyboardSpec = keyboardSpec_dw4;

  const customDataBytes = serializeCustomKeyboardSpec(targetKeyboardSpec);

  const binaryBaseDir = '../build/standard/avr';
  const srcBinaryFilePath = `${binaryBaseDir}/standard_avr.bin`;
  const modBinaryFilePath = `${binaryBaseDir}/standard_avr_patched.bin`;

  const buffer = fs.readFileSync(srcBinaryFilePath);
  const binaryBytes = [...new Uint8Array(buffer)];

  const markerPosition = getBinaryContentMarkerIndex(binaryBytes, 'KMDF');
  if (markerPosition === -1) {
    throw new Error('cannot find marker');
  }
  const dataLocation = markerPosition + 4;
  replaceArrayConent(binaryBytes, dataLocation, customDataBytes);

  const savingBuffer = Buffer.from(binaryBytes);
  fs.writeFileSync(modBinaryFilePath, savingBuffer);

  console.log(`file saved: ${modBinaryFilePath}`);
  console.log('done');
}

function forgeStandardKeyboardFirmwareRp_dev() {
  const binaryBaseDir = '../build/standard/rp';
  const srcBinaryFilePath = `${binaryBaseDir}/standard_rp.uf2`;
  const modBinaryFilePath = `${binaryBaseDir}/standard_rp_patched.uf2`;

  const buffer = fs.readFileSync(srcBinaryFilePath);
  const binaryBytes = [...new Uint8Array(buffer)];

  const markerPosition = getBinaryContentMarkerIndex(binaryBytes, 'KMDF');
  if (markerPosition === -1) {
    throw new Error('cannot find marker');
  }
  const dataLocation = markerPosition + 4;
  replaceArrayConent(binaryBytes, dataLocation, [7]);

  const savingBuffer = Buffer.from(binaryBytes);
  fs.writeFileSync(modBinaryFilePath, savingBuffer);

  console.log(`file saved: ${modBinaryFilePath}`);
  console.log('done');
}

// forgeStandardKeyboardFirmwareAvr();
forgeStandardKeyboardFirmwareRp_dev();
