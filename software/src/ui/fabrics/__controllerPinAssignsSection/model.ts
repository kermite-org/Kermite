import { IStandardFirmwareBoardType, IStandardFirmwareConfig } from '~/shared';
import {
  boardAssignsData_proMicro,
  boardAssignsData_proMicroRp2040,
  boardAssignsData_rpiPico,
} from '~/ui/fabrics/ControllerPinAssignsSection/data';
import {
  IBoardPinAssignsData,
  IBoardPinAssignsDataEx,
} from '~/ui/fabrics/ControllerPinAssignsSection/types';
import { standardFirmwareEditModelHelpers } from '~/ui/featureEditors/StandardFirmwareEditor/helpers';

function pushPinFunctionName(
  base: IBoardPinAssignsDataEx,
  pinName: string,
  pinFunctionName: string,
) {
  const pinIndex = base.pinNames.findIndex((it) => it === pinName);
  if (pinIndex >= 0) {
    base.pinFunctionNames[pinIndex] = pinFunctionName;
  }
}

function pushPinFunctionNames(
  base: IBoardPinAssignsDataEx,
  pins: string[],
  prefix: string,
  indexRoot: number = 0,
) {
  pins.forEach((pinName, i) => {
    const pinFunctionName = `${prefix}${i + indexRoot}`;
    pushPinFunctionName(base, pinName, pinFunctionName);
  });
}

function pushEncoderPinFunctionNames(
  base: IBoardPinAssignsDataEx,
  pins: string[],
  prefix: string,
  indexRoot: number = 0,
) {
  pins.forEach((pinName, i) => {
    const encoderIndex = (i / 2) >> 0;
    const role = i % 2 >> 0 === 0 ? 'a' : 'b';
    const pinFunctionName = `${prefix}${encoderIndex + indexRoot}${role}`;
    pushPinFunctionName(base, pinName, pinFunctionName);
  });
}

function createBoardAssignsDataEx(
  base: IBoardPinAssignsData,
): IBoardPinAssignsDataEx {
  return { ...base, pinFunctionNames: base.pinNames.map(() => '') };
}

const boardTypeToAssignsDataSourceMap: Record<
  IStandardFirmwareBoardType,
  IBoardPinAssignsData | undefined
> = {
  ChipAtMega32U4: undefined,
  ProMicro: boardAssignsData_proMicro,
  ChipRP2040: undefined,
  ProMicroRP2040: boardAssignsData_proMicroRp2040,
  RpiPico: boardAssignsData_rpiPico,
};

export function createBoardAssignsData(
  firmwareConfig: IStandardFirmwareConfig,
): IBoardPinAssignsDataEx | undefined {
  const {
    boardType,
    useMatrixKeyScanner,
    matrixColumnPins,
    matrixRowPins,
    useDirectWiredKeyScanner,
    directWiredPins,
    useEncoder,
    encoderPins,
    singleWireSignalPin,
    useLighting,
    lightingPin,
    useDebugUart,
    useLcd,
  } = firmwareConfig;
  const { baseFirmwareType } = firmwareConfig;
  const { getMcuType, getIsSplit } = standardFirmwareEditModelHelpers;
  const mcuType = getMcuType(baseFirmwareType);

  const source = boardType && boardTypeToAssignsDataSourceMap[boardType];
  if (!source) {
    return undefined;
  }

  const base = createBoardAssignsDataEx(source);

  const isSplit = getIsSplit(firmwareConfig.baseFirmwareType);
  if (useMatrixKeyScanner && matrixColumnPins && matrixRowPins) {
    pushPinFunctionNames(base, matrixColumnPins, 'col');
    pushPinFunctionNames(base, matrixRowPins, 'row');
  }
  if (useDirectWiredKeyScanner && directWiredPins) {
    pushPinFunctionNames(base, directWiredPins, 'dw');
  }
  if (useEncoder && encoderPins) {
    pushEncoderPinFunctionNames(base, encoderPins, 'enc');
  }
  if (isSplit && singleWireSignalPin) {
    pushPinFunctionName(base, singleWireSignalPin, 'swire');
  }
  if (useLighting && lightingPin) {
    pushPinFunctionName(base, lightingPin, 'rgbled');
  }
  if (useDebugUart) {
    if (mcuType === 'avr') {
      pushPinFunctionName(base, 'PD3', 'debug_tx');
    }
    if (mcuType === 'rp') {
      pushPinFunctionName(base, 'GP0', 'debug_tx');
    }
  }
  if (useLcd) {
    if (mcuType === 'avr') {
      pushPinFunctionName(base, 'PD1', 'oled_sda');
      pushPinFunctionName(base, 'PD0', 'oled_scl');
    }
    if (mcuType === 'rp') {
      pushPinFunctionName(base, 'GP2', 'oled_sda');
      pushPinFunctionName(base, 'GP3', 'oled_scl');
    }
  }
  return base;
}
