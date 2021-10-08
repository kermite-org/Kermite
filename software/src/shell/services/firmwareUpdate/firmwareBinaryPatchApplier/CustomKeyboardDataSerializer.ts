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

const checkMatrixPins = (
  rowsPins: string[] | undefined,
  columnsPins: string[] | undefined,
) => rowsPins && columnsPins && rowsPins.length > 0 && columnsPins.length > 0;

const checkDirectWiredPins = (pins: string[] | undefined) =>
  pins && pins.length > 0;

const checkEncoderPins = (pins: string[] | undefined, isSplit: boolean) =>
  pins &&
  ((!isSplit && [2, 4, 6].includes(pins.length)) ||
    (isSplit && pins.length === 2));

const checkLightingNumLeds = (num: number | undefined) =>
  num !== undefined && isNumberInRange(num, 1, 256);

const checkMatrixPins2 = (
  rowsPins: string[] | undefined,
  columnsPins: string[] | undefined,
) =>
  (rowsPins && columnsPins && rowsPins.length > 0 && columnsPins.length > 0) ||
  (!rowsPins && !columnsPins);

const checkDirectWiredPins2 = (pins: string[] | undefined) =>
  pins ? pins.length > 0 : true;

const checkEncoderPins2 = (pins: string[] | undefined, isSplit: boolean) =>
  (pins &&
    ((!isSplit && [2, 4, 6].includes(pins.length)) ||
      (isSplit && pins.length === 2))) ||
  true;

const checkLightingNumLeds2 = (num: number | undefined) =>
  num !== undefined ? isNumberInRange(num, 1, 256) : true;

function checkKeyboardSpec(spec: IKermiteStandardKeyboardSpec): boolean {
  const {
    baseFirmwareType: fw,
    useBoardLedsProMicroAvr,
    useBoardLedsProMicroRp,
    useBoardLedsRpiPico,
    useMatrixKeyScanner,
    useDirectWiredKeyScanner,
    useEncoder,
    matrixRowPins,
    matrixColumnPins,
    directWiredPins,
    encoderPins,
    matrixRowPinsR,
    matrixColumnPinsR,
    directWiredPinsR,
    encoderPinsR,
    useLighting,
    lightingPin,
    lightingNumLeds,
    lightingNumLedsR,
    singleWireSignalPin,
  } = spec;

  const isAvr =
    fw === 'AvrUnified' || fw === 'AvrSplit' || fw === 'AvrOddSplit';
  const isRp = fw === 'RpUnified' || fw === 'RpSplit' || fw === 'RpOddSplit';
  const isSplit =
    fw === 'AvrSplit' ||
    fw === 'RpSplit' ||
    fw === 'AvrOddSplit' ||
    fw === 'RpOddSplit';
  const isOddSplit = fw === 'AvrOddSplit' || fw === 'RpOddSplit';

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

  if (!isOddSplit) {
    if (
      useMatrixKeyScanner &&
      !checkMatrixPins(matrixRowPins, matrixColumnPins)
    ) {
      return false;
    }
    if (useDirectWiredKeyScanner && !checkDirectWiredPins(directWiredPins)) {
      return false;
    }
    if (useEncoder && !checkEncoderPins(encoderPins, isSplit)) {
      return false;
    }
    if (
      useLighting &&
      !(lightingPin && checkLightingNumLeds(lightingNumLeds))
    ) {
      return false;
    }
  } else {
    if (
      useMatrixKeyScanner &&
      !(
        checkMatrixPins2(matrixRowPins, matrixColumnPins) &&
        checkMatrixPins2(matrixRowPinsR, matrixColumnPinsR)
      )
    ) {
      return false;
    }
    if (
      useDirectWiredKeyScanner &&
      !(
        checkDirectWiredPins2(directWiredPins) &&
        checkDirectWiredPins2(directWiredPinsR)
      )
    ) {
      return false;
    }
    if (useEncoder) {
      if (
        !(
          checkEncoderPins2(encoderPins, isSplit) &&
          checkEncoderPins2(encoderPinsR, isSplit)
        )
      ) {
        return false;
      }
    }
    if (
      useLighting &&
      !(
        lightingPin &&
        checkLightingNumLeds2(lightingNumLeds) &&
        checkLightingNumLeds2(lightingNumLedsR)
      )
    ) {
      return false;
    }
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

// Asymmetrical Split
export function serializeCustomKeyboardSpec_OddSplit(
  spec: IKermiteStandardKeyboardSpec,
): number[] {
  if (!checkKeyboardSpec(spec)) {
    throw new Error(`invalid keyboard spec ${JSON.stringify(spec)}`);
  }
  let numMatrixRows = 0;
  let numMatrixColumns = 0;
  let numDirectWiredKeys = 0;
  let numEncoders = 0;

  let numMatrixRowsR = 0;
  let numMatrixColumnsR = 0;
  let numDirectWiredKeysR = 0;
  let numEncodersR = 0;

  const keyScannerPins: string[] = [];
  if (spec.useMatrixKeyScanner) {
    if (spec.matrixRowPins && spec.matrixColumnPins) {
      numMatrixRows = spec.matrixRowPins.length;
      numMatrixColumns = spec.matrixColumnPins.length;
      keyScannerPins.push(...spec.matrixRowPins, ...spec.matrixColumnPins);
    }
    if (spec.matrixRowPinsR && spec.matrixColumnPinsR) {
      numMatrixRowsR = spec.matrixRowPinsR.length;
      numMatrixColumnsR = spec.matrixColumnPinsR.length;
      keyScannerPins.push(...spec.matrixRowPinsR, ...spec.matrixColumnPinsR);
    }
  }
  if (spec.useDirectWiredKeyScanner) {
    if (spec.directWiredPins) {
      numDirectWiredKeys = spec.directWiredPins.length;
      keyScannerPins.push(...spec.directWiredPins);
    }
    if (spec.directWiredPinsR) {
      numDirectWiredKeysR = spec.directWiredPinsR.length;
      keyScannerPins.push(...spec.directWiredPinsR);
    }
  }
  if (spec.useEncoder) {
    if (spec.encoderPins) {
      numEncoders = 1;
      keyScannerPins.push(...spec.encoderPins);
    }
    if (spec.encoderPinsR) {
      numEncodersR = 1;
      keyScannerPins.push(...spec.encoderPinsR);
    }
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
    numMatrixRowsR,
    numMatrixColumnsR,
    numDirectWiredKeys,
    numDirectWiredKeysR,
    numEncoders,
    numEncodersR,
    ...pinDefinitionsBytes,
    spec.useLighting ? mapPinNameToPinNumber(spec.lightingPin) : 0xff,
    spec.lightingNumLeds,
    spec.lightingNumLedsR,
    mapPinNameToPinNumber(spec.singleWireSignalPin),
  ]);
}
