import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { IKeyUnitCardViewModel } from '~ui/viewModels/KeyUnitCard/KeyUnitCardsPartViewModel';

const cssKeyRect = css`
  cursor: pointer;
  fill: ${uiTheme.colors.clKeyUnitFace};

  &[data-current] {
    fill: ${uiTheme.colors.clSelectHighlight};
  }
  &[data-hold] {
    fill: ${uiTheme.colors.clHoldHighlight};
  }
`;

const cssKeyText = css`
  fill: ${uiTheme.colors.clKeyUnitLegend};

  &[data-is-weak] {
    fill: ${uiTheme.colors.clKeyUnitLegendWeak};
  }

  &[data-hidden] {
    display: none;
  }

  pointer-events: none;
`;

export function EditKeyUnitCard(props: {
  keyUnit: IKeyUnitCardViewModel;
  showLayerDefaultAssign: boolean;
}) {
  const {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isLayerFallback,
    isHold
  } = props.keyUnit;
  const { showLayerDefaultAssign } = props;

  const textShown = isLayerFallback ? showLayerDefaultAssign : true;

  const onMouseDown = (e: MouseEvent) => {
    setCurrent();
    e.stopPropagation();
  };

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
        data-current={isCurrent}
        data-hold={isHold}
        onMouseDown={onMouseDown}
      />
      <text
        css={cssKeyText}
        x={0}
        y={0}
        font-size={getFontSize(primaryText)}
        text-anchor="middle"
        dominant-baseline="center"
        data-is-weak={isLayerFallback}
        data-hidden={!textShown}
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
