import { css, FC, jsx } from 'qx';
import { texts, uiTheme, IEditKeyUnitCardViewModel, colors } from '~/ui/base';
import { KeyTextLabel } from '~/ui/components/keyboard/keyUnitCards/EditKeyUnitCard.KeyTextLabel';
import { KeyUnitShape } from '~/ui/components/keyboard/keyUnitCards/KeyUnitShape';

type Props = {
  keyUnit: IEditKeyUnitCardViewModel;
  showLayerDefaultAssign: boolean;
  showOutline: boolean;
};

export const EditKeyUnitCard: FC<Props> = ({
  keyUnit: {
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
  },
  showLayerDefaultAssign,
  showOutline,
}) => {
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
        classNames={[
          keyUnitShapeStyle,
          (showOutline && '--with-outline') || undefined,
        ]}
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
};

const keyUnitShapeStyle = css`
  cursor: pointer;
  fill: ${colors.clKeyUnitFace};

  &.--with-outline {
    stroke: ${colors.clKeyboardBodyFace};
  }

  &[data-current] {
    fill: ${colors.clSelectHighlight};
  }
  &[data-hold] {
    fill: ${colors.clHoldHighlight};
  }
  &:hover {
    opacity: 0.7;
  }
  transition: ${uiTheme.commonTransitionSpec};
`;
