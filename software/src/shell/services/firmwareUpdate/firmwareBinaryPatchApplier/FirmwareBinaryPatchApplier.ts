import {
  compareArray,
  IKermiteStandardKeyboardSpec,
  IStandardBaseFirmwareType,
} from '~/shared';
import {
  serializeCommonKeyboardMetaData,
  serializeCustomKeyboardSpec_Split,
  serializeCustomKeyboardSpec_Unified,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/CustomKeyboardDataSerializer';
import { patchHexFileContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryModifierHex';
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

function getCustomDataLocation(
  binaryBytes: number[],
  type: 'metadata' | 'standardKeyboardDefinition',
): number {
  const markerCode = {
    metadata: '$KMFC',
    standardKeyboardDefinition: '$KMDF',
  }[type];
  const markerPosition = getBinaryContentMarkerIndex(binaryBytes, markerCode);
  if (markerPosition === -1) {
    throw new Error('cannot find marker');
  }
  return markerPosition + 5;
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

export function applyFirmwareBinaryPatch(
  buffer: Uint8Array,
  firmwareBinaryFormat: 'hex' | 'uf2',
  meta: IStandardKeyboardInjectedMetaData,
  targetKeyboardSpec?: IKermiteStandardKeyboardSpec,
): Uint8Array {
  const patchFileContentFn =
    firmwareBinaryFormat === 'uf2' ? patchUf2FileContent : patchHexFileContent;

  return patchFileContentFn(buffer, (binaryBytes) => {
    const metaDataBytes = serializeCommonKeyboardMetaData(meta);
    const metaDataLocation = getCustomDataLocation(binaryBytes, 'metadata');
    replaceArrayContent(binaryBytes, metaDataLocation, metaDataBytes);

    if (targetKeyboardSpec) {
      const specSerializerFunc =
        specSerializerFunctionMap[targetKeyboardSpec.baseFirmwareType];
      const customDataBytes = specSerializerFunc(targetKeyboardSpec, meta);
      checkCustomDataBytes(customDataBytes);
      const definitionDataLocation = getCustomDataLocation(
        binaryBytes,
        'standardKeyboardDefinition',
      );
      replaceArrayContent(binaryBytes, definitionDataLocation, customDataBytes);
    }
  });
}
