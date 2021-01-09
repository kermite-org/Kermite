import { css } from 'goober';
import { h } from 'qx';
import { IKeyUnitCardViewModel } from '~/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';

export function WidgetKeyUnitCard({
  keyUnit,
}: {
  keyUnit: IKeyUnitCardViewModel;
}) {
  const { keyUnitId, pos, primaryText, secondaryText, isHold } = keyUnit;

  const cssKeyRect = css`
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
      <rect
        x={-9}
        y={-9}
        width={18}
        height={18}
        css={cssKeyRect}
        data-hold={isHold}
      />
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
