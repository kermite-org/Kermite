import { compareArray, IKermiteStandardKeyboaredSpec } from '~/shared';
import { serializeCustomKeyboardSpec } from '~/shell/services/firmwareUpdation/firmwareBinaryPatchApplier/CustomKeyboardDataSerializer';

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

export function applyStandardFirmwareBinaryPatch(
  buffer: Uint8Array,
  firmwareBinaryFormat: 'hex' | 'uf2',
  targetKeyboardSpec: IKermiteStandardKeyboaredSpec,
): Uint8Array {
  const customDataBytes = serializeCustomKeyboardSpec(targetKeyboardSpec);
  const binaryBytes = [...new Uint8Array(buffer)];

  if (firmwareBinaryFormat === 'hex') {
    throw new Error('patching hex file is not supported yet');
    // eslint-disable-next-line no-unreachable
    const markerPosition = getBinaryContentMarkerIndex(binaryBytes, 'KMDF');
    if (markerPosition === -1) {
      throw new Error('cannot find marker');
    }
    const dataLocation = markerPosition + 4;
    // todo: hexファイルのデコード/エンコードが必要
    replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
  } else {
    const markerPosition = getBinaryContentMarkerIndex(binaryBytes, 'KMDF');
    if (markerPosition === -1) {
      throw new Error('cannot find marker');
    }
    const dataLocation = markerPosition + 4;
    // todo: UF2で512バイトのブロック境界をまたぐ場合の考慮が必要
    replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
  }
  return new Uint8Array(binaryBytes);
}
