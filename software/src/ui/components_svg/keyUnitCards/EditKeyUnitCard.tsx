import { css, FC, jsx } from 'qx';
import { texts, uiTheme, IEditKeyUnitCardViewModel } from '~/ui/base';
import { KeyTextLabel } from '~/ui/components_svg/keyUnitCards/EditKeyUnitCard.KeyTextLabel';
import { KeyUnitShape } from '~/ui/components_svg/keyUnitCards/KeyUnitShape';

type Props = {
  keyUnit: IEditKeyUnitCardViewModel;
  showLayerDefaultAssign: boolean;
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
        css={style}
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

const style = css`
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
