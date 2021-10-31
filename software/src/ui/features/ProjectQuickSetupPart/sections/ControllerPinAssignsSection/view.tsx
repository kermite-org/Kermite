import { css, FC, jsx } from 'qx';
import {
  generateNumberSequence as seq,
  IKermiteStandardKeyboardSpec,
} from '~/shared';
import {
  svgImage_boardProMicro,
  svgImage_boardProMicroRp2040,
  svgImage_boardRpiPico,
} from '~/ui/constants';
import { standardFirmwareEditModelHelpers } from '~/ui/editors/StandardFirmwareEditor/helpers';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useMemoEx } from '~/ui/utils';

type IBoardImageSig = 'proMicro' | 'proMicroRp2040' | 'rpiPico';

const svgImagesMap: { [key in IBoardImageSig]: JSX.Element } = {
  proMicro: svgImage_boardProMicro,
  proMicroRp2040: svgImage_boardProMicroRp2040,
  rpiPico: svgImage_boardRpiPico,
};

type IBoardPinAssignsData = {
  unitPixels: number;
  boardUnitWidth: number;
  boardUnitHeight: number;
  boardImageSig: IBoardImageSig;
  pinsRowOffset: number;
  pinNames: string[];
};

type IBoardPinAssignsDataEx = IBoardPinAssignsData & {
  pinFunctionNames: string[];
};

const boardAssignsData_proMicro: IBoardPinAssignsData = {
  unitPixels: 18,
  boardUnitWidth: 7,
  boardUnitHeight: 14,
  pinsRowOffset: 2,
  boardImageSig: 'proMicro',
  pinNames: [
    'PD3',
    'PD2',
    'GND',
    'GND',
    'PD1',
    'PD0',
    'PD4',
    'PC6',
    'PD7',
    'PE6',
    'PB4',
    'PB5',
    'PB6',
    'PB2',
    'PB3',
    'PB1',
    'PF7',
    'PF6',
    'PF5',
    'PF4',
    'VCC',
    '#RST',
    'GND',
    'RAW',
  ],
};

const boardAssignsData_proMicroRp2040: IBoardPinAssignsData = {
  unitPixels: 18,
  boardUnitWidth: 7,
  boardUnitHeight: 14,
  pinsRowOffset: 2,
  boardImageSig: 'proMicroRp2040',
  pinNames: [
    'GP0',
    'GP1',
    'GND',
    'GND',
    'GP2',
    'GP3',
    'GP4',
    'GP5',
    'GP6',
    'GP7',
    'GP8',
    'GP9',
    'GP21',
    'GP23',
    'GP20',
    'GP22',
    'GP26',
    'GP27',
    'GP28',
    'GP29',
    'VCC',
    '#RST',
    'GND',
    'RAW',
  ],
};

const boardAssignsData_rpiPico: IBoardPinAssignsData = {
  unitPixels: 13,
  boardUnitWidth: 8,
  boardUnitHeight: 21,
  pinsRowOffset: 1,
  boardImageSig: 'rpiPico',
  pinNames: [
    'GP0',
    'GP1',
    'GND',
    'GP2',
    'GP3',
    'GP4',
    'GP5',
    'GND',
    'GP6',
    'GP7',
    'GP8',
    'GP9',
    'GND',
    'GP10',
    'GP11',
    'GP12',
    'GP13',
    'GND',
    'GP14',
    'GP15',
    'GP16',
    'GP17',
    'GND',
    'GP18',
    'GP19',
    'GP20',
    'GP21',
    'GND',
    'GP22',
    'RUN',
    'GP26',
    'GP27',
    'GND',
    'GP28',
    'AVREF',
    '3V3OUT',
    '3V3_EN',
    'GND',
    'VSYS',
    'VBUS',
  ],
};

function renderPins(
  pinNames: string[],
  pinsRowOffset: number,
  cellX: number,
  unitPixels: number,
) {
  return pinNames.map((pinName, i) => {
    const cellY = pinsRowOffset + i + 1;
    const cellStyle = css`
      grid-column: ${cellX};
      grid-row: ${cellY};
      color: #222;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: ${unitPixels - 3}px;
    `;
    return (
      <div key={i} class={cellStyle}>
        {pinName}
      </div>
    );
  });
}

const BoardPinAssignsView: FC<{ data: IBoardPinAssignsDataEx }> = ({
  data: {
    unitPixels,
    boardImageSig,
    boardUnitWidth,
    boardUnitHeight,
    pinsRowOffset,
    pinNames,
    pinFunctionNames,
  },
}) => {
  const nu = (n: number) => `${n * unitPixels}px`;
  const numPins = pinNames.length;
  const half = numPins / 2;
  const pinsNamesLeft = pinNames.slice(0, half);
  const pinsNamesRight = pinNames.slice(half, numPins).reverse();
  const pinsFunctionNamesLeft = pinFunctionNames.slice(0, half);
  const pinsFunctionNamesRight = pinFunctionNames
    .slice(half, numPins)
    .reverse();

  const gridStyle = css`
    display: grid;
    grid-template-columns: ${[3, 3, boardUnitWidth, 3, 3].map(nu).join(' ')};
    grid-template-rows: ${seq(boardUnitHeight).fill(1).map(nu).join(' ')};
  `;
  const boardCellStyle = css`
    grid-column: 3;
    grid-row: 1 / ${boardUnitHeight + 1};
  `;
  return (
    <div class={gridStyle}>
      <div class={boardCellStyle}>{svgImagesMap[boardImageSig]}</div>
      {...renderPins(pinsFunctionNamesLeft, pinsRowOffset, 1, unitPixels)}
      {...renderPins(pinsNamesLeft, pinsRowOffset, 2, unitPixels)}
      {...renderPins(pinsNamesRight, pinsRowOffset, 4, unitPixels)}
      {...renderPins(pinsFunctionNamesRight, pinsRowOffset, 5, unitPixels)}
    </div>
  );
};

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

function createBoardAssignsData(
  firmwareConfig: IKermiteStandardKeyboardSpec,
): IBoardPinAssignsDataEx | undefined {
  const {
    useBoardLedsProMicroAvr,
    useBoardLedsProMicroRp,
    useBoardLedsRpiPico,
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

  let source: IBoardPinAssignsData | undefined;
  if (mcuType === 'avr' && useBoardLedsProMicroAvr) {
    source = boardAssignsData_proMicro;
  }
  if (mcuType === 'rp' && useBoardLedsProMicroRp) {
    source = boardAssignsData_proMicroRp2040;
  }
  if (mcuType === 'rp' && useBoardLedsRpiPico) {
    source = boardAssignsData_rpiPico;
  }
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

export const ControllerPinAssignsSection: FC = () => {
  const boardAssignsData = useMemoEx(createBoardAssignsData, [
    projectQuickSetupStore.state.firmwareConfig,
  ]);
  return (
    <div>
      {boardAssignsData && <BoardPinAssignsView data={boardAssignsData} />}
      {!boardAssignsData && <div>N/A</div>}
    </div>
  );
};
