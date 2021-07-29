import { jsx, css, FC } from 'qx';
import { uiTheme, IPresetKeyUnitViewModel } from '~/ui/base';
import { KeyUnitShape } from '~/ui/components_svg/keyUnitCards/KeyUnitShape';

type Props = {
  model: IPresetKeyUnitViewModel;
};

export const PresetKeyUnitCard: FC<Props> = ({
  model: {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    tertiaryText,
    isLayerFallback,
    shape,
  },
}) => (
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
