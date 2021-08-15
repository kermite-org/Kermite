import { jsx, css, FC } from 'qx';
import { IOperationCardViewModel, uiTheme } from '~/ui/base';

type Props = {
  model: IOperationCardViewModel;
};

export const OperationCard: FC<Props> = ({
  model: { text, isCurrent, setCurrent, isEnabled, hint },
}) => {
  const isTextLong = text.length >= 2;
  return (
    <div
      css={style}
      data-current={isCurrent}
      onMouseDown={setCurrent}
      data-disabled={!isEnabled}
      data-text-long={isTextLong}
      data-hint={hint}
    >
      {text}
    </div>
  );
};

const style = css`
  min-width: 28px;
  height: 28px;
  background: ${uiTheme.colors.clAssignCardFace};
  color: ${uiTheme.colors.clAssignCardText};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 2px;
  cursor: pointer;
  font-size: '12px';

  &[data-current] {
    background: ${uiTheme.colors.clSelectHighlight};
  }

  &[data-disabled] {
    opacity: 0.3;
    cursor: default;
    pointer-events: none;
  }

  &[data-text-long] {
    font-size: '15px';
  }

  &:hover {
    opacity: 0.7;
  }
`;