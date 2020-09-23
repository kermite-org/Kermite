import { css } from 'goober';
import { h } from '~lib/qx';
import {
  IKeyUnitCardViewModel,
  makeKeyUnitCardsPartViewModel
} from './KeyUnitCardsPart.model';
import { uiTheme } from '~ui2/models/UiTheme';

export function KeyUnitCard({ keyUnit }: { keyUnit: IKeyUnitCardViewModel }) {
  const {
    keyUnitId,
    pos,
    isCurrent,
    setCurrent,
    primaryText,
    secondaryText,
    isHold
  } = keyUnit;

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
    pointer-events: none;
  `;

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

export function KeyUnitCardsPart() {
  const keyUnitCardsPartViewModel = makeKeyUnitCardsPartViewModel(true);
  return (
    <g>
      {keyUnitCardsPartViewModel.cards.map((keyUnit) => (
        <KeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.keyUnitId}
          qxOptimizer="deepEqualExFn"
        />
      ))}
    </g>
  );
}
