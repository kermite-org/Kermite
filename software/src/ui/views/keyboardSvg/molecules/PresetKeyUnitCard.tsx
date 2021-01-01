import { css } from 'goober';
import { mvvmView } from '~ui/base/helper/mvvmHelpers';
import { uiTheme } from '~ui/core';
import { IPresetKeyUnitViewModel } from '~ui/viewModels/KeyUnitCard/PresetKeyUnitViewModelCreator';
import { h } from '~qx';

const cssKeyRect = css`
  fill: transparent;
  stroke: #444;
  stroke-width: 0.3;
`;

const cssKeyText = css`
  font-size: 5px;
  fill: ${uiTheme.colors.clAltText};
  text-anchor: middle;
`;

export const PresetKeyUnitCard = mvvmView((ku: IPresetKeyUnitViewModel) => {
  const { keyUnitId, pos, primaryText, secondaryText, isLayerFallback } = ku;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <rect x={-9} y={-9} width={18} height={18} css={cssKeyRect} />

      <text css={cssKeyText} x={0} y={-2} qxIf={!isLayerFallback}>
        {primaryText}
      </text>

      <text css={cssKeyText} x={0} y={4} qxIf={!isLayerFallback}>
        {secondaryText}
      </text>
    </g>
  );
});
