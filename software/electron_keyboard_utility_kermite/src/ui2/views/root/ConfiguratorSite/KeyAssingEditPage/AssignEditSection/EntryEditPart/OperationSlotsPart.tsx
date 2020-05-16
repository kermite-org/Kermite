import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { UiTheme } from '~ui2/views/common/UiTheme';
import { makeOperationSlotsPartViewModel } from './OperationSlotsPart.model';

function OperationSlotCard(props: {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}) {
  const cssSlotCard = css`
    width: 28px;
    height: 28px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #444;

    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }
  `;
  return (
    <div
      css={cssSlotCard}
      data-current={props.isCurrent}
      onClick={props.setCurrent}
    >
      {props.text}
    </div>
  );
}

export function OerationSlotsPart() {
  const operationSlotsPartViewModel = makeOperationSlotsPartViewModel();

  const cssBox = css`
    > * {
      margin: 2px;
    }
    > * + * {
      margin-top: 4px;
    }
    margin-right: 6px;
  `;

  return (
    <div css={cssBox}>
      {operationSlotsPartViewModel.slots.map((slot, index) => (
        <OperationSlotCard
          key={index}
          text={slot.text}
          isCurrent={slot.isCurrent}
          setCurrent={slot.setCurrent}
        />
      ))}
    </div>
  );
}
