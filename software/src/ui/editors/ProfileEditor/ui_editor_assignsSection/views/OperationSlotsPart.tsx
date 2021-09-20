import { jsx, css, FC } from 'qx';
import { OperationCard, OperationSlotCard } from '~/ui/components';
import { IPlainOperationEditCardsViewModel } from '~/ui/editors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationEditPartViewModel';
import { IOperationSlotsPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationSlotsPartViewModel';

type Props = {
  operationSlotsVM: IOperationSlotsPartViewModel;
  plainOperationEditCardsVM: IPlainOperationEditCardsViewModel;
};

export const OperationSlotsPart: FC<Props> = ({
  plainOperationEditCardsVM: { transparentEntry, blockEntry },
  operationSlotsVM,
}) => (
  <div css={style}>
    {operationSlotsVM.slots.map((slot, index) => (
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

const style = css`
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
