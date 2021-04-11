import { jsx, css } from 'qx';
import { IDisplayKeyShape } from '~/shared';
import { mvvmView } from '~/ui/common';
import { KeyUnitShape } from '~/ui/common-svg/KeyUnitCards/KeyUnitShape';

export interface IHeatmapCustomKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  typeCount: number;
  weight: number;
  hold: boolean;
  shape: IDisplayKeyShape;
}

const cssKeyShape = css`
  fill: transparent;
  stroke: #444;
  stroke-width: 0.3;
`;

const cssKeyShapeCover = css`
  fill: #f09;
`;

const cssKeyShapeHold = css`
  fill: #f90;
`;

const cssKeyText = css`
  font-size: 5px;
  fill: #000;
  text-anchor: middle;
`;

const cssCountText = css`
  font-size: 5px;
  fill: #000;
  text-anchor: middle;
`;

export const HeatmapKeyUnitCard = mvvmView(
  (ku: IHeatmapCustomKeyUnitViewModel) => {
    const {
      keyUnitId,
      pos,
      primaryText,
      secondaryText,
      isLayerFallback,
      typeCount,
      weight,
      hold,
      shape,
    } = ku;

    return (
      <g
        transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
        key={keyUnitId}
      >
        <KeyUnitShape shape={shape} css={cssKeyShape} />
        {!hold && (
          <KeyUnitShape shape={shape} css={cssKeyShapeCover} opacity={weight} />
        )}
        {hold && <KeyUnitShape shape={shape} css={cssKeyShapeHold} />}

        <text css={cssKeyText} x={0} y={-2} qxIf={!isLayerFallback}>
          {primaryText}
        </text>

        <text css={cssKeyText} x={0} y={4} qxIf={!isLayerFallback}>
          {secondaryText}
        </text>
        <text css={cssCountText} x={5} y={7}>
          {typeCount}
        </text>
      </g>
    );
  },
);
