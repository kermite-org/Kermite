import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { mvvmView } from '~/ui-common/helpers';
import { IHeatmapCustomKeyUnitViewModel } from '~/ui-heatmap-page/RealtimeHeatmapViewModel';

const cssKeyRect = css`
  fill: transparent;
  stroke: #444;
  stroke-width: 0.3;
`;

const cssKeyRectCover = css`
  fill: #f09;
`;

const cssKeyRectHold = css`
  fill: #f90;
`;

const cssKeyText = css`
  font-size: 5px;
  fill: ${uiTheme.colors.clAltText};
  text-anchor: middle;
`;

const cssCountText = css`
  font-size: 5px;
  fill: ${uiTheme.colors.clAltText};
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
    } = ku;

    return (
      <g
        transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
        key={keyUnitId}
      >
        <rect x={-9} y={-9} width={18} height={18} css={cssKeyRect} />

        {!hold && (
          <rect
            x={-9}
            y={-9}
            width={18}
            height={18}
            css={cssKeyRectCover}
            opacity={weight}
          />
        )}

        {hold && (
          <rect x={-9} y={-9} width={18} height={18} css={cssKeyRectHold} />
        )}

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
