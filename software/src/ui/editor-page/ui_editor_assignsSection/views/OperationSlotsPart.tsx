import { jsx, css } from 'qx';
import { OperationCard, OperationSlotCard } from '~/ui/common';
import { IPlainOperationEditCardsViewModel } from '~/ui/editor-page/ui_editor_assignsSection/viewModels/OperationEditPartViewModel';
import { IOperationSlotsPartViewModel } from '~/ui/editor-page/ui_editor_assignsSection/viewModels/OperationSlotsPartViewModel';

const cssOerationSlotsPart = css`
  width: 70px;
  > * {
    margin: 2px;
  }
  > * + * {
    margin-top: 4px;
  }
  margin-right: 6px;

  .spacer {
    height: 10px;
  }
`;

export function OerationSlotsPart(props: {
  operationSlotsVM: IOperationSlotsPartViewModel;
  plainOperationEditCardsVM: IPlainOperationEditCardsViewModel;
}) {
  const { transparentEntry, blockEntry } = props.plainOperationEditCardsVM;

  return (
    <div css={cssOerationSlotsPart}>
      {props.operationSlotsVM.slots.map((slot, index) => (
        <OperationSlotCard
          key={index}
          text={slot.text}
          isCurrent={slot.isCurrent}
          setCurrent={slot.setCurrent}
          hint={slot.hint}
        />
      ))}
      <div class="spacer" />
      <OperationCard model={blockEntry} />
      <OperationCard model={transparentEntry} />
    </div>
  );
}
