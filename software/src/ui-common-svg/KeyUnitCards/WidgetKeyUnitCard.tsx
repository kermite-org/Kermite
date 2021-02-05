import { css } from 'goober';
import { h } from 'qx';
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
}

export function WidgetKeyUnitCard({
  keyUnit,
}: {
  keyUnit: IWidgetKeyUnitCardViewModel;
}) {
  const { keyUnitId, pos, primaryText, secondaryText, isHold, shape } = keyUnit;

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
        text-anchor="middle"
        dominant-baseline="center"
      >
        {primaryText}
      </text>

      <text
        css={cssKeyText}
        x={0}
        y={8}
        font-size={getFontSize(secondaryText)}
        text-anchor="middle"
        dominant-baseline="center"
      >
        {secondaryText}
      </text>
    </g>
  );
}
