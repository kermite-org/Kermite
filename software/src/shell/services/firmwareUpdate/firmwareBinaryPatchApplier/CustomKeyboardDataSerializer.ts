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
  } = spec;

  if (baseFirmwareType === 'AvrUnified' || baseFirmwareType === 'AvrSplit') {
    if (useBoardLedsProMicroRp || useBoardLedsRpiPico) {
      return false;
    }
  } else if (
    baseFirmwareType === 'RpUnified' ||
    baseFirmwareType === 'RpSplit'
  ) {
    if (useBoardLedsProMicroAvr) {
      return false;
    }
  } else {
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
  if (useEncoder && !(encoderPins && encoderPins.length === 2)) {
    return false;
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

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboardSpec,
  meta: IStandardKeyboardInjectedMetaData,
): number[] {
  if (!checkKeyboardSpec(spec)) {
    throw new Error(`invalid keyboard spec ${JSON.stringify(spec)}`);
  }
  let numMatrixRows = 0;
  let numMatrixColumns = 0;
  let numDirectWiredKeys = 0;
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

  const pinDefinitionsBytes = padByteArray(
    keyScannerPins.map(mapPinNameToPinNumber),
    32,
    0xff,
  );

  if (
    !(
      meta.keyboardName.length < 32 && isStringPrintableAscii(meta.keyboardName)
    )
  ) {
    throw new Error(
      `invalid keyboard name ${meta.keyboardName} for embedded attribute`,
    );
  }

  return convertArrayElementsToBytes([
    ...stringToEmbedBytes(meta.projectId, 7),
    ...stringToEmbedBytes(meta.variationId, 3),
    ...stringToEmbedBytes(meta.deviceInstanceCode, 9),
    ...stringToEmbedBytes(meta.keyboardName, 33),
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
    mapPinNameToPinNumber(spec.lightingPin),
    spec.lightingNumLeds,
    ...pinDefinitionsBytes,
  ]);
}
