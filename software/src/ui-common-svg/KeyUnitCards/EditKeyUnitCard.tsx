import { css } from 'goober';
import { h } from 'qx';
import { IDisplayKeyShape } from '~/shared';
import { uiTheme } from '~/ui-common';
import { KeyUnitShape } from '~/ui-common-svg/KeyUnitCards/KeyUnitShape';

export interface IEditKeyUnitCardViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  shape: IDisplayKeyShape;
  isCurrent: boolean;
  setCurrent: () => void;
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  isHold: boolean;
  shiftHold: boolean;
}

const cssKeyShape = css`
  cursor: pointer;
  fill: ${uiTheme.colors.clKeyUnitFace};

  &[data-current] {
    fill: ${uiTheme.colors.clSelectHighlight};
  }
  &[data-hold] {
    fill: ${uiTheme.colors.clHoldHighlight};
  }
  &:hover {
    opacity: 0.7;
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
  keyUnit: IEditKeyUnitCardViewModel;
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
    isHold,
    shape,
    shiftHold,
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

  const getFontWeight = (text: string) => {
    const shouldBold = shiftHold && text.match(/^[A-Z]$/);
    return shouldBold ? 'bold' : 'normal';
  };

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
      data-hint="Select edit target key."
    >
      <KeyUnitShape
        shape={shape}
        css={cssKeyShape}
        data-current={isCurrent}
        data-hold={isHold}
        onMouseDown={onMouseDown}
      />
      <text
        css={cssKeyText}
        x={0}
        y={0}
        font-size={getFontSize(primaryText)}
        font-weight={getFontWeight(primaryText)}
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
