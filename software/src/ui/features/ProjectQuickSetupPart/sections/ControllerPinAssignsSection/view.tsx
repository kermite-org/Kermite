import { css, FC, jsx } from 'qx';
import { generateNumberSequence as seq } from '~/shared';
import {
  svgImage_boardProMicroRp2040,
  svgImage_boardProMicroRpiPico,
} from '~/ui/constants';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';

type IBoardImageSig = 'proMicro' | 'proMicroRp2040' | 'rpiPico';

const svgImagesMap: { [key in IBoardImageSig]: JSX.Element } = {
  proMicro: svgImage_boardProMicroRp2040,
  proMicroRp2040: svgImage_boardProMicroRp2040,
  rpiPico: svgImage_boardProMicroRpiPico,
};

type IBoardPinAssignsData = {
  unitPixels: number;
  boardUnitWidth: number;
  boardUnitHeight: number;
  boardImageSig: IBoardImageSig;
  pinsRowOffset: number;
  pinNames: string[];
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
  unitPixels: 12,
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
    '3V3_OUT',
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

const BoardPinAssignsView: FC<{ data: IBoardPinAssignsData }> = ({
  data: {
    unitPixels,
    boardImageSig,
    boardUnitWidth,
    boardUnitHeight,
    pinsRowOffset,
    pinNames,
  },
}) => {
  const nu = (n: number) => `${n * unitPixels}px`;
  const numPins = pinNames.length;
  const pinsNamesLeft = pinNames.slice(0, numPins / 2);
  const pinsNamesRight = pinNames.slice(numPins / 2, numPins).reverse();
  const gridStyle = css`
    display: grid;
    grid-template-columns: ${[4, 3, boardUnitWidth, 3, 4].map(nu).join(' ')};
    grid-template-rows: ${seq(boardUnitHeight).fill(1).map(nu).join(' ')};
  `;
  const boardCellStyle = css`
    grid-column: 3;
    grid-row: 1 / ${boardUnitHeight + 1};
  `;
  return (
    <div class={gridStyle}>
      <div class={boardCellStyle}>{svgImagesMap[boardImageSig]}</div>
      {...renderPins(pinsNamesLeft, pinsRowOffset, 2, unitPixels)}
      {...renderPins(pinsNamesRight, pinsRowOffset, 4, unitPixels)}
    </div>
  );
};

export const ControllerPinAssignsSection: FC = () => {
  return (
    <SectionFrame title="Pin Assign View" contentClassName={style}>
      <BoardPinAssignsView data={boardAssignsData_proMicro} />
      {/* <BoardPinAssignsView data={boardAssignsData_proMicroRp2040} /> */}
      {/* <BoardPinAssignsView data={boardAssignsData_rpiPico} /> */}
    </SectionFrame>
  );
};

const style = css`
  padding: 0 5px;
`;
