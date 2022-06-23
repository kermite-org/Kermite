import {
  compareArray,
  IStandardFirmwareConfig,
  IStandardBaseFirmwareType,
} from '~/shared';
import {
  serializeCommonKeyboardMetadata,
  serializeCustomKeyboardSpec_OddSplit,
  serializeCustomKeyboardSpec_Split,
  serializeCustomKeyboardSpec_Unified,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/customKeyboardDataSerializer';
import { patchHexFileContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/firmwareBinaryModifierHex';
import { patchUf2FileContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/firmwareBinaryModifierUF2';
import { replaceArrayContent } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/helpers';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/types';

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
    metadata: '$KMMD',
    standardKeyboardDefinition: '$KMDF',
  }[type];
  const markerPosition = getBinaryContentMarkerIndex(binaryBytes, markerCode);
  if (markerPosition === -1) {
    throw new Error('cannot find marker');
  }
  return markerPosition + 5;
}

function checkCustomDataBytesValueRange(bytes: number[]) {
  const valid = bytes.every((it) => isFinite(it) && 0 <= it && it <= 0xff);
  if (!valid) {
    throw new Error('invalid custom data bytes');
  }
}

const specSerializerFunctionMap: {
  [key in IStandardBaseFirmwareType]: (
    spec: IStandardFirmwareConfig,
    meta: IStandardKeyboardInjectedMetaData,
  ) => number[];
} = {
  RpUnified: serializeCustomKeyboardSpec_Unified,
  RpSplit: serializeCustomKeyboardSpec_Split,
  RpOddSplit: serializeCustomKeyboardSpec_OddSplit,
};

export function applyFirmwareBinaryPatch(
  buffer: Uint8Array,
  firmwareBinaryFormat: 'hex' | 'uf2',
  meta: IStandardKeyboardInjectedMetaData,
  firmwareConfig?: IStandardFirmwareConfig,
): Uint8Array {
  const patchFileContentFn =
    firmwareBinaryFormat === 'uf2' ? patchUf2FileContent : patchHexFileContent;

  return patchFileContentFn(buffer, (binaryBytes) => {
    const metaDataBytes = serializeCommonKeyboardMetadata(meta);
    checkCustomDataBytesValueRange(metaDataBytes);
    const metaDataLocation = getCustomDataLocation(binaryBytes, 'metadata');
    replaceArrayContent(binaryBytes, metaDataLocation, metaDataBytes);

    if (firmwareConfig) {
      const specSerializerFunc =
        specSerializerFunctionMap[firmwareConfig.baseFirmwareType];
      const customDataBytes = specSerializerFunc(firmwareConfig, meta);
      checkCustomDataBytesValueRange(customDataBytes);
      const definitionDataLocation = getCustomDataLocation(
        binaryBytes,
        'standardKeyboardDefinition',
      );
      replaceArrayContent(binaryBytes, definitionDataLocation, customDataBytes);
    }
  });
}
