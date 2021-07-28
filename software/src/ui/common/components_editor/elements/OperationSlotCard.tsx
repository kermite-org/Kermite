import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/common/base';

const cssOperationSlotCard = css`
  min-width: 28px;
  height: 28px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${uiTheme.colors.clAssignCardFace};
  color: ${uiTheme.colors.clAssignCardText};

  &[data-current] {
    background: ${uiTheme.colors.clSelectHighlight};
  }
`;

export function OperationSlotCard(props: {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  hint: string;
}) {
  return (
    <div
      css={cssOperationSlotCard}
      data-current={props.isCurrent}
      onClick={props.setCurrent}
      data-hint={props.hint}
    >
      {props.text}
    </div>
  );
}
