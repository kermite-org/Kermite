import { css, FC, jsx } from 'qx';
import {
  generateNumberSequence as seq,
  IStandardFirmwareConfig,
} from '~/shared';
import {
  svgImage_boardProMicro,
  svgImage_boardProMicroRp2040,
  svgImage_boardRpiPico,
} from '~/ui/constants';
import { createBoardAssignsData } from '~/ui/fabrics/ControllerPinAssignsSection/model';
import {
  IBoardImageSig,
  IBoardPinAssignsDataEx,
} from '~/ui/fabrics/ControllerPinAssignsSection/types';
import { useMemoEx } from '~/ui/utils';

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

const svgImagesMap: { [key in IBoardImageSig]: JSX.Element } = {
  proMicro: svgImage_boardProMicro,
  proMicroRp2040: svgImage_boardProMicroRp2040,
  rpiPico: svgImage_boardRpiPico,
};

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
  const nu = (n: number) => `${(n * unitPixels) >> 0}px`;
  const numPins = pinNames.length;
  const half = numPins / 2;
  const pinsNamesLeft = pinNames.slice(0, half);
  const pinsNamesRight = pinNames.slice(half, numPins).reverse();
  const pinsFunctionNamesLeft = pinFunctionNames.slice(0, half);
  const pinsFunctionNamesRight = pinFunctionNames
    .slice(half, numPins)
    .reverse();

  const col_w = 3.5;
  const gridStyle = css`
    display: grid;
    grid-template-columns: ${[col_w, col_w, boardUnitWidth, col_w, col_w]
      .map(nu)
      .join(' ')};
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

export const ControllerPinAssignsSection: FC<{
  firmwareConfig: IStandardFirmwareConfig;
}> = ({ firmwareConfig }) => {
  const boardAssignsData = useMemoEx(createBoardAssignsData, [firmwareConfig]);
  return (
    <div>
      {boardAssignsData && <BoardPinAssignsView data={boardAssignsData} />}
      {!boardAssignsData && <div>N/A</div>}
    </div>
  );
};
