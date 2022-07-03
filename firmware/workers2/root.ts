import { serializeCustomKeyboardSpec } from '@/customKeyboardDataSerializer';
import { keyboardSpec_km60, keyboardSpec_mp2105 } from '@/keyboardVariants';
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

function forgeStandardKeyboardFirmwareRp() {
  // const targetKeyboardSpec = keyboardSpec_mp2105;
  const targetKeyboardSpec = keyboardSpec_km60;
  const customDataBytes = serializeCustomKeyboardSpec(targetKeyboardSpec);

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
  //todo: UF2で512バイトのブロック境界をまたぐ場合の考慮が必要
  replaceArrayConent(binaryBytes, dataLocation, customDataBytes);

  const savingBuffer = Buffer.from(binaryBytes);
  fs.writeFileSync(modBinaryFilePath, savingBuffer);

  console.log(`file saved: ${modBinaryFilePath}`);
  console.log('done');
}

forgeStandardKeyboardFirmwareRp();
