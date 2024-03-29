import { jsx, css, FC } from 'alumina';
import { colors, IPresetKeyUnitViewModel } from '~/ui/base';
import { KeyUnitShape } from '~/ui/elements/keyboard/keyUnitCards/KeyUnitShape';

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
    <KeyUnitShape shape={shape} class={cssKeyShape} />
    <text class={cssKeyText} x={0} y={-2} if={!isLayerFallback}>
      {primaryText}
    </text>

    <text class={cssKeyText} x={0} y={4} if={!isLayerFallback}>
      {secondaryText}
    </text>

    <text class={cssKeyText} x={4} y={-6} if={!isLayerFallback}>
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
  fill: ${colors.clAltText};
  text-anchor: middle;
`;
