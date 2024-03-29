import { IStandardFirmwareBoardType, IStandardFirmwareConfig } from '~/shared';
import { PinNameToPinNumberMap } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/dataTables';
import {
  convertArrayElementsToBytes,
  isStringPrintableAscii,
  padByteArray,
  stringToEmbedBytes,
} from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/helpers';
import { checkStandardFirmwareConfigData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/standardFirmwareConfigValidator';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/types';

function mapPinNameToPinNumber(pinName: string | undefined): number {
  const pinNumber = PinNameToPinNumberMap[pinName || ''];
  if (pinNumber === undefined) {
    throw new Error(`invalid pinName ${pinName}`);
  }
  return pinNumber;
}

function mapBoardTypeToCode(
  boardType: IStandardFirmwareBoardType | undefined,
): number {
  if (!boardType) {
    return 0;
  }
  return (
    {
      // ChipAtMega32U4: 1,
      // ProMicro: 2,
      ChipRP2040: 3,
      ProMicroRP2040: 4,
      RpiPico: 5,
      KB2040: 6,
      XiaoRP2040: 7,
      RP2040Zero: 8,
    }[boardType] || 0
  );
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
    ...stringToEmbedBytes(meta.deviceInstanceCode, 5),
    ...stringToEmbedBytes(meta.keyboardName, 33),
  ];
}

export function serializeCustomKeyboardSpec_Unified(
  spec: IStandardFirmwareConfig,
): number[] {
  if (!checkStandardFirmwareConfigData(spec)) {
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
    mapBoardTypeToCode(spec.boardType),
    spec.useBoardLeds,
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
  spec: IStandardFirmwareConfig,
): number[] {
  if (!checkStandardFirmwareConfigData(spec)) {
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
    mapBoardTypeToCode(spec.boardType),
    spec.useBoardLeds,
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
  spec: IStandardFirmwareConfig,
): number[] {
  if (!checkStandardFirmwareConfigData(spec)) {
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
    mapBoardTypeToCode(spec.boardType),
    spec.useBoardLeds,
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
