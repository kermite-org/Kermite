import { css, FC, jsx } from 'qx';
import { texts, uiTheme, IEditKeyUnitCardViewModel } from '~/ui/common/base';
import { KeyUnitShape } from '~/ui/common/components_svg/keyUnitCards/KeyUnitShape';

const cssKeyText = css`
  fill: ${uiTheme.colors.clKeyUnitLegend};

  &[data-is-weak] {
    fill: ${uiTheme.colors.clKeyUnitLegendWeak};
  }

  pointer-events: none;
`;

export const KeyTextLabel: FC<{
  text: string;
  xpos: number;
  ypos: number;
  isWeak?: boolean;
  isBold?: boolean;
}> = ({ text, xpos, ypos, isWeak, isBold }) => {
  const getFontSize = (text: string) => {
    if (text.length === 1) {
      return '8px';
    } else {
      return '5px';
    }
  };

  return (
    <text
      css={cssKeyText}
      x={xpos}
      y={ypos}
      font-size={getFontSize(text)}
      font-weight={isBold ? 'bold' : 'normal'}
      data-is-weak={isWeak}
      text-anchor="middle"
      dominant-baseline="center"
    >
      {text}
    </text>
  );
};

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
    tertiaryText,
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

  const checkBold = (text: string): boolean => {
    return (shiftHold && !!text.match(/^[A-Z]$/)) || false;
  };

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.r}) `}
      key={keyUnitId}
      data-hint={texts.hint_assigner_keyboardView_keyUnit}
    >
      <KeyUnitShape
        shape={shape}
        css={cssKeyShape}
        data-current={isCurrent}
        data-hold={isHold}
        onMouseDown={onMouseDown}
      />
      <KeyTextLabel
        text={primaryText}
        xpos={0}
        ypos={0}
        isWeak={isLayerFallback}
        isBold={checkBold(primaryText)}
        qxIf={textShown}
      />
      <KeyTextLabel
        text={secondaryText}
        xpos={0}
        ypos={8}
        isBold={checkBold(secondaryText)}
      />
      <KeyTextLabel
        text={tertiaryText}
        xpos={4}
        ypos={-4}
        isBold={checkBold(secondaryText)}
      />
    </g>
  );
}
