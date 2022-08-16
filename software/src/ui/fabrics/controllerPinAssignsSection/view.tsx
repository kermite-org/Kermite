import { css, FC, jsx, Fragment } from 'alumina';
import {
  generateNumberSequence as seq,
  IStandardFirmwareConfig,
} from '~/shared';
import {
  svgImage_boardKb2040,
  svgImage_boardProMicro,
  svgImage_boardProMicroRp2040,
  svgImage_boardRp2040Zero,
  svgImage_boardRpiPico,
  svgImage_boardXiaoRp2040,
} from '~/ui/constants';
import { createBoardAssignsData } from '~/ui/fabrics/controllerPinAssignsSection/model';
import {
  IBoardImageSig,
  IBoardPinAssignsDataEx,
} from '~/ui/fabrics/controllerPinAssignsSection/types';
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
  kb2040: svgImage_boardKb2040,
  xiaoRp2040: svgImage_boardXiaoRp2040,
  rp2040Zero: svgImage_boardRp2040Zero,
};

function getGridStyle(
  boardUnitWidth: number,
  boardUnitHeight: number,
  unitPixels: number,
  isBottomLinePines?: boolean,
) {
  const nu = (n: number) => `${(n * unitPixels) >> 0}px`;
  const col_w = 3.5;
  if (!isBottomLinePines) {
    return css`
      display: grid;
      grid-template-columns: ${[col_w, col_w, boardUnitWidth, col_w, col_w]
        .map(nu)
        .join(' ')};
      grid-template-rows: ${seq(boardUnitHeight).fill(1).map(nu).join(' ')};
    `;
  } else {
    return css`
      display: grid;
      grid-template-columns: ${[col_w, col_w].map(nu).join(' ')};
      grid-template-rows: ${seq(boardUnitHeight).fill(1).map(nu).join(' ')};
    `;
  }
}

const RenderPinsHorizontal: FC<{
  pinNames: string[];
  pinFunctionNames: string[];
  unitPixels: number;
}> = ({ pinNames, pinFunctionNames, unitPixels }) => {
  const gridStyle = getGridStyle(0, pinNames.length, unitPixels, true);
  const gridStyleEx = css`
    transform: rotate(270deg);
  `;
  return (
    <div class={[gridStyle, gridStyleEx]}>
      {...renderPins(pinFunctionNames, 0, 1, unitPixels)}
      {...renderPins(pinNames, 0, 2, unitPixels)}
    </div>
  );
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
    pinNamesBottom,
    pinFunctionNamesBottom,
  },
}) => {
  const numPins = pinNames.length;
  const half = numPins / 2;
  const pinsNamesLeft = pinNames.slice(0, half);
  const pinsNamesRight = pinNames.slice(half, numPins).reverse();
  const pinsFunctionNamesLeft = pinFunctionNames.slice(0, half);
  const pinsFunctionNamesRight = pinFunctionNames
    .slice(half, numPins)
    .reverse();

  const baseDivStyle = css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

  const gridStyle = getGridStyle(boardUnitWidth, boardUnitHeight, unitPixels);

  const boardCellStyle = css`
    grid-column: 3;
    grid-row: 1 / ${boardUnitHeight + 1};
  `;
  return (
    <div class={baseDivStyle}>
      <div class={gridStyle}>
        <div class={boardCellStyle}>{svgImagesMap[boardImageSig]}</div>
        {...renderPins(pinsFunctionNamesLeft, pinsRowOffset, 1, unitPixels)}
        {...renderPins(pinsNamesLeft, pinsRowOffset, 2, unitPixels)}
        {...renderPins(pinsNamesRight, pinsRowOffset, 4, unitPixels)}
        {...renderPins(pinsFunctionNamesRight, pinsRowOffset, 5, unitPixels)}
      </div>
      {pinNamesBottom && pinFunctionNamesBottom && (
        <RenderPinsHorizontal
          pinNames={pinNamesBottom}
          pinFunctionNames={pinFunctionNamesBottom}
          unitPixels={unitPixels}
        />
      )}
    </div>
  );
};

export const ControllerPinAssignsSection: FC<{
  firmwareConfig: IStandardFirmwareConfig;
}> = ({ firmwareConfig }) => {
  const boardAssignsData = useMemoEx(createBoardAssignsData, [firmwareConfig]);
  return (
    <>
      {boardAssignsData && <BoardPinAssignsView data={boardAssignsData} />}
      {!boardAssignsData && <div>N/A</div>}
    </>
  );
};
