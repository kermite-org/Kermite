import { compareArray, IKermiteStandardKeyboardSpec } from '~/shared';
import { serializeCustomKeyboardSpec } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/CustomKeyboardDataSerializer';
import {
  decodeBytesFromHexFileContent,
  encodeBytesToHexFileContent,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryDataConverter';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';

function replaceArrayContent(dst: number[], dstOffset: number, src: number[]) {
  for (let i = 0; i < src.length; i++) {
    dst[dstOffset + i] = src[i];
  }
}

function getBinaryContentMarkerIndex(
  bytes: number[],
  markerString: string,
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

function getCustomDataLocation(binaryBytes: number[]): number {
  const markerPosition = getBinaryContentMarkerIndex(binaryBytes, 'KMDF');
  if (markerPosition === -1) {
    throw new Error('cannot find marker');
  }
  return markerPosition + 4;
}

export function applyStandardFirmwareBinaryPatch(
  buffer: Uint8Array,
  firmwareBinaryFormat: 'hex' | 'uf2',
  targetKeyboardSpec: IKermiteStandardKeyboardSpec,
  meta: IStandardKeyboardInjectedMetaData,
): Uint8Array {
  const customDataBytes = serializeCustomKeyboardSpec(targetKeyboardSpec, meta);

  if (firmwareBinaryFormat === 'hex') {
    const hexFileContentText = new TextDecoder().decode(buffer);
    const binaryBytes = decodeBytesFromHexFileContent(hexFileContentText);
    const dataLocation = getCustomDataLocation(binaryBytes);
    replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
    const modHexFileContentText = encodeBytesToHexFileContent(binaryBytes);
    return new TextEncoder().encode(modHexFileContentText);
  } else {
    const binaryBytes = [...new Uint8Array(buffer)];
    const dataLocation = getCustomDataLocation(binaryBytes);
    // todo: UF2で512バイトのブロック境界をまたぐ場合の考慮が必要
    replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
    return new Uint8Array(binaryBytes);
  }
}
