import { jsx, css } from 'qx';
import { IDisplayKeyShape } from '~/shared';
import { KeyUnitShape } from '~/ui-common-svg/KeyUnitCards/KeyUnitShape';

export interface IWidgetKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
  shape: IDisplayKeyShape;
  shiftHold: boolean;
}

export function WidgetKeyUnitCard({
  keyUnit,
}: {
  keyUnit: IWidgetKeyUnitCardViewModel;
}) {
  const {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    isHold,
    shape,
    isLayerFallback,
    shiftHold,
  } = keyUnit;

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

  const getFontSize = (text: string) => {
    if (text.length === 1) {
      return '8px';
    } else {
      return '5px';
    }
  };

  const getFontWeight = (text: string) => {
    const shouldBold = shiftHold && text.match(/^[A-Z]$/);
    return shouldBold ? 'bold' : 'normal';
  };

  return (
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
        font-weight={getFontWeight(primaryText)}
        text-anchor="middle"
        dominant-baseline="center"
        qxIf={!isLayerFallback}
      >
        {primaryText}
      </text>

      <text
        css={cssKeyText}
        x={0}
        y={8}
        font-size={getFontSize(secondaryText)}
        font-weight={getFontWeight(secondaryText)}
        text-anchor="middle"
        dominant-baseline="center"
        qxIf={!isLayerFallback}
      >
        {secondaryText}
      </text>
    </g>
  );
}
