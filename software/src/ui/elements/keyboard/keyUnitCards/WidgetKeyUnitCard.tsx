import { jsx, css, FC } from 'alumina';
import { IWidgetKeyUnitCardViewModel } from '~/ui/base';
import { KeyUnitShape } from '~/ui/elements/keyboard/keyUnitCards/KeyUnitShape';

type Props = {
  keyUnit: IWidgetKeyUnitCardViewModel;
};

const getFontSize = (text: string) => {
  if (text.length === 1) {
    return '8px';
  } else {
    return '5px';
  }
};

const getFontWeight = (text: string, shiftHold: boolean) => {
  const shouldBold = shiftHold && text.match(/^[A-Z]$/);
  return shouldBold ? 'bold' : 'normal';
};

export const WidgetKeyUnitCard: FC<Props> = ({
  keyUnit: {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    tertiaryText,
    isHold,
    shape,
    isLayerFallback,
    shiftHold,
  },
}) => (
  <g
    transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
    key={keyUnitId}
  >
    <KeyUnitShape shape={shape} css={cssKeyShape} data-hold={isHold} />
    <text
      css={cssKeyText}
      x={0}
      y={0}
      font-size={getFontSize(primaryText)}
      font-weight={getFontWeight(primaryText, shiftHold)}
      text-anchor="middle"
      dominant-baseline="center"
      if={!isLayerFallback}
    >
      {primaryText}
    </text>

    <text
      css={cssKeyText}
      x={0}
      y={8}
      font-size={getFontSize(secondaryText)}
      font-weight={getFontWeight(secondaryText, shiftHold)}
      text-anchor="middle"
      dominant-baseline="center"
      if={!isLayerFallback}
    >
      {secondaryText}
    </text>

    <text
      css={cssKeyText}
      x={4}
      y={-4}
      font-size={getFontSize(tertiaryText)}
      font-weight={getFontWeight(tertiaryText, shiftHold)}
      text-anchor="middle"
      dominant-baseline="center"
      if={!isLayerFallback}
    >
      {tertiaryText}
    </text>
  </g>
);

const cssKeyShape = css`
  fill: #e0e8ff;
  stroke: #003;
  &[data-hold] {
    fill: #fc0;
  }
`;

const cssKeyText = css`
  fill: #003;
`;
