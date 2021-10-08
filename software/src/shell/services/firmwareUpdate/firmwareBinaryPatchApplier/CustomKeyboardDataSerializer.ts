import { IKermiteStandardKeyboardSpec, isNumberInRange } from '~/shared';
import { PinNameToPinNumberMap } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/DataTables';
import {
  convertArrayElementsToBytes,
  isStringPrintableAscii,
  padByteArray,
  stringToEmbedBytes,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Helpers';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';

function mapPinNameToPinNumber(pinName: string | undefined): number {
  const pinNumber = PinNameToPinNumberMap[pinName || ''];
  if (pinNumber === undefined) {
    throw new Error(`invalid pinName ${pinName}`);
  }
  return pinNumber;
}

function checkKeyboardSpec(spec: IKermiteStandardKeyboardSpec): boolean {
  const {
    baseFirmwareType,
    useBoardLedsProMicroAvr,
    useBoardLedsProMicroRp,
    useBoardLedsRpiPico,
    useMatrixKeyScanner,
    matrixRowPins,
    matrixColumnPins,
    useDirectWiredKeyScanner,
    directWiredPins,
    useEncoder,
    encoderPins,
    useLighting,
    lightingPin,
    lightingNumLeds,
    singleWireSignalPin,
  } = spec;

  const isAvr =
    baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit';
  const isRp =
    baseFirmwareType === 'RpUnified' || baseFirmwareType === 'RpSplit';

  const isSplit =
    baseFirmwareType === 'AvrSplit' || baseFirmwareType === 'RpSplit';

  if (isAvr) {
    if (useBoardLedsProMicroRp || useBoardLedsRpiPico) {
      return false;
    }
  } else if (isRp) {
    if (useBoardLedsProMicroAvr) {
      return false;
    }
  } else {
    return false;
  }

  if (isSplit && !singleWireSignalPin) {
    return false;
  }

  if (
    useMatrixKeyScanner &&
    !(
      matrixRowPins &&
      matrixColumnPins &&
      matrixRowPins.length > 0 &&
      matrixColumnPins.length > 0
    )
  ) {
    return false;
  }
  if (
    useDirectWiredKeyScanner &&
    !(directWiredPins && directWiredPins.length > 0)
  ) {
    return false;
  }
  if (useEncoder) {
    const valid =
      encoderPins &&
      ((!isSplit && [2, 4, 6].includes(encoderPins.length)) ||
        (isSplit && encoderPins.length === 2));
    if (!valid) {
      return false;
    }
  }
  if (
    useLighting &&
    !(
      lightingPin &&
      lightingNumLeds !== undefined &&
      isNumberInRange(lightingNumLeds, 0, 256)
    )
  ) {
    return false;
  }
  return true;
}

export function serializeCommonKeyboardMetadata(
  meta: IStandardKeyboardInjectedMetaData,
): number[] {
  if (
    !(
      meta.keyboardName.length < 32 && isStringPrintableAscii(meta.keyboardName)
    )
  ) {
    throw new Error(
      `invalid keyboard name ${meta.keyboardName} for embedded attribute`,
    );
  }
  return [
    ...stringToEmbedBytes(meta.projectId, 7),
    ...stringToEmbedBytes(meta.variationId, 3),
    ...stringToEmbedBytes(meta.deviceInstanceCode, 9),
    ...stringToEmbedBytes(meta.keyboardName, 33),
  ];
}

export function serializeCustomKeyboardSpec_Unified(
  spec: IKermiteStandardKeyboardSpec,
): number[] {
  if (!checkKeyboardSpec(spec)) {
    throw new Error(`invalid keyboard spec ${JSON.stringify(spec)}`);
  }
  let numMatrixRows = 0;
  let numMatrixColumns = 0;
  let numDirectWiredKeys = 0;
  let numEncoders = 0;
  const keyScannerPins: string[] = [];
  if (
    spec.useMatrixKeyScanner &&
    !!spec.matrixRowPins &&
    !!spec.matrixColumnPins
  ) {
    numMatrixRows = spec.matrixRowPins.length;
    numMatrixColumns = spec.matrixColumnPins.length;
    keyScannerPins.push(...spec.matrixRowPins, ...spec.matrixColumnPins);
  }
  if (spec.useDirectWiredKeyScanner && !!spec.directWiredPins) {
    numDirectWiredKeys = spec.directWiredPins.length;
    keyScannerPins.push(...spec.directWiredPins);
  }
  if (spec.useEncoder && !!spec.encoderPins) {
    numEncoders = spec.encoderPins.length / 2;
    keyScannerPins.push(...spec.encoderPins);
  }

  if (keyScannerPins.length > 32) {
    throw new Error(`maximum number of key scanner pins (32) exceeded`);
  }

  const pinDefinitionsBytes = padByteArray(
    keyScannerPins.map(mapPinNameToPinNumber),
    32,
    0xff,
  );

  return convertArrayElementsToBytes([
    spec.useBoardLedsProMicroAvr,
    spec.useBoardLedsProMicroRp,
    spec.useBoardLedsRpiPico,
    spec.useDebugUart,
    spec.useMatrixKeyScanner,
    spec.useDirectWiredKeyScanner,
    spec.useEncoder,
    spec.useLighting,
    spec.useLcd,
    numMatrixRows,
    numMatrixColumns,
    numDirectWiredKeys,
    numEncoders,
    ...pinDefinitionsBytes,
    spec.useLighting ? mapPinNameToPinNumber(spec.lightingPin) : 0xff,
    spec.lightingNumLeds,
  ]);
}

// Symmetrical Split
export function serializeCustomKeyboardSpec_Split(
  spec: IKermiteStandardKeyboardSpec,
): number[] {
  if (!checkKeyboardSpec(spec)) {
    throw new Error(`invalid keyboard spec ${JSON.stringify(spec)}`);
  }
  let numMatrixRows = 0;
  let numMatrixColumns = 0;
  let numDirectWiredKeys = 0;
  let numEncoder = 0;
  const keyScannerPins: string[] = [];
  if (
    spec.useMatrixKeyScanner &&
    !!spec.matrixRowPins &&
    !!spec.matrixColumnPins
  ) {
    numMatrixRows = spec.matrixRowPins.length;
    numMatrixColumns = spec.matrixColumnPins.length;
    keyScannerPins.push(...spec.matrixRowPins, ...spec.matrixColumnPins);
    keyScannerPins.push(...spec.matrixRowPins, ...spec.matrixColumnPins); // Right
  }
  if (spec.useDirectWiredKeyScanner && !!spec.directWiredPins) {
    numDirectWiredKeys = spec.directWiredPins.length;
    keyScannerPins.push(...spec.directWiredPins);
    keyScannerPins.push(...spec.directWiredPins); // Right
  }
  if (spec.useEncoder && !!spec.encoderPins) {
    numEncoder = 1;
    keyScannerPins.push(...spec.encoderPins);
    keyScannerPins.push(...spec.encoderPins); // Right
  }

  if (keyScannerPins.length > 32) {
    throw new Error(`maximum number of key scanner pins (32) exceeded`);
  }

  const pinDefinitionsBytes = padByteArray(
    keyScannerPins.map(mapPinNameToPinNumber),
    32,
    0xff,
  );

  return convertArrayElementsToBytes([
    spec.useBoardLedsProMicroAvr,
    spec.useBoardLedsProMicroRp,
    spec.useBoardLedsRpiPico,
    spec.useDebugUart,
    spec.useMatrixKeyScanner,
    spec.useDirectWiredKeyScanner,
    spec.useEncoder,
    spec.useLighting,
    spec.useLcd,
    numMatrixRows,
    numMatrixColumns,
    numMatrixRows, // Right
    numMatrixColumns, // Right
    numDirectWiredKeys,
    numDirectWiredKeys, // Right
    numEncoder,
    numEncoder, // Right
    ...pinDefinitionsBytes,
    spec.useLighting ? mapPinNameToPinNumber(spec.lightingPin) : 0xff,
    spec.lightingNumLeds,
    spec.lightingNumLeds, // Right
    mapPinNameToPinNumber(spec.singleWireSignalPin),
  ]);
}
