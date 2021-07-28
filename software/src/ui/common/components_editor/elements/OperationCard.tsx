import { jsx, css } from 'qx';
import { IOperationCardViewModel, uiTheme } from '~/ui/common/base';

const cssOperationCard = css`
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

export const OperationCard = (props: { model: IOperationCardViewModel }) => {
  const { text, isCurrent, setCurrent, isEnabled, hint } = props.model;

  const isTextLong = text.length >= 2;

  return (
    <div
      css={cssOperationCard}
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
