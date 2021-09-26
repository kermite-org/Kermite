import {
  compareArray,
  IKermiteStandardKeyboardSpec,
  IStandardBaseFirmwareType,
} from '~/shared';
import {
  serializeCustomKeyboardSpec_Split,
  serializeCustomKeyboardSpec_Unified,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/CustomKeyboardDataSerializer';
import {
  decodeBytesFromHexFileContent,
  encodeBytesToHexFileContent,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryDataConverter';
import { patchUf2FileContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryModifierUF2';
import { replaceArrayContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';

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

function checkCustomDataBytes(bytes: number[]) {
  const valid = bytes.every((it) => isFinite(it) && 0 <= it && it <= 0xff);
  if (!valid) {
    throw new Error('invalid custom data bytes');
  }
}

const specSerializerFunctionMap: {
  [key in IStandardBaseFirmwareType]: (
    spec: IKermiteStandardKeyboardSpec,
    meta: IStandardKeyboardInjectedMetaData,
  ) => number[];
} = {
  AvrUnified: serializeCustomKeyboardSpec_Unified,
  RpUnified: serializeCustomKeyboardSpec_Unified,
  AvrSplit: serializeCustomKeyboardSpec_Split,
  RpSplit: serializeCustomKeyboardSpec_Split,
};

export function applyStandardFirmwareBinaryPatch(
  buffer: Uint8Array,
  firmwareBinaryFormat: 'hex' | 'uf2',
  targetKeyboardSpec: IKermiteStandardKeyboardSpec,
  meta: IStandardKeyboardInjectedMetaData,
): Uint8Array {
  const specSerializerFunc =
    specSerializerFunctionMap[targetKeyboardSpec.baseFirmwareType];
  const customDataBytes = specSerializerFunc(targetKeyboardSpec, meta);
  checkCustomDataBytes(customDataBytes);

  if (firmwareBinaryFormat === 'hex') {
    const hexFileContentText = new TextDecoder().decode(buffer);
    const binaryBytes = decodeBytesFromHexFileContent(hexFileContentText);
    const dataLocation = getCustomDataLocation(binaryBytes);
    replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
    const modHexFileContentText = encodeBytesToHexFileContent(binaryBytes);
    return new TextEncoder().encode(modHexFileContentText);
  } else {
    const srcUf2FileContentBytes = [...new Uint8Array(buffer)];
    const modUf2FileContentBytes = patchUf2FileContent(
      srcUf2FileContentBytes,
      (binaryBytes) => {
        const dataLocation = getCustomDataLocation(binaryBytes);
        replaceArrayContent(binaryBytes, dataLocation, customDataBytes);
      },
    );
    return new Uint8Array(modUf2FileContentBytes);
  }
}
