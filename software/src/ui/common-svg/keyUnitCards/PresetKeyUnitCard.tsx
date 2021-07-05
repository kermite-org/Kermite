import { jsx, css } from 'qx';
import { IDisplayKeyShape } from '~/shared';
import { uiTheme, mvvmView } from '~/ui/common';
import { KeyUnitShape } from '~/ui/common-svg/keyUnitCards/KeyUnitShape';

export interface IPresetKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  isLayerFallback: boolean;
  shape: IDisplayKeyShape;
}

const cssKeyShape = css`
  fill: transparent;
  stroke: #888;
  stroke-width: 0.3;
`;

const cssKeyText = css`
  font-size: 5px;
  fill: ${uiTheme.colors.clAltText};
  text-anchor: middle;
`;

export const PresetKeyUnitCard = mvvmView((ku: IPresetKeyUnitViewModel) => {
  const {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback,
    shape,
  } = ku;

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
    >
      <KeyUnitShape shape={shape} css={cssKeyShape} />
      <text css={cssKeyText} x={0} y={-2} qxIf={!isLayerFallback}>
        {primaryText}
      </text>

      <text css={cssKeyText} x={0} y={4} qxIf={!isLayerFallback}>
        {secondaryText}
      </text>

      <text css={cssKeyText} x={4} y={-6} qxIf={!isLayerFallback}>
        {tertiaryText}
      </text>
    </g>
  );
});
