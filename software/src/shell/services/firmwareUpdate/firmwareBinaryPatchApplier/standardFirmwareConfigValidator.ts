import { IStandardFirmwareConfig, isNumberInRange } from '~/shared';

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

export function checkStandardFirmwareConfigData(
  spec: IStandardFirmwareConfig,
): boolean {
  const {
    baseFirmwareType: fw,
    boardType,
    useBoardLeds,
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

  const isRp = fw === 'RpUnified' || fw === 'RpSplit' || fw === 'RpOddSplit';
  const isSplit = fw === 'RpSplit' || fw === 'RpOddSplit';
  const isOddSplit = fw === 'RpOddSplit';

  if (!isRp) {
    return false;
  }
  if (useBoardLeds && boardType === 'ChipRP2040') {
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
