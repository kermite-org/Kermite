import { jsx, css, FC } from 'alumina';
import { SlotTriggerDisplay } from '~/ui/featureEditors/ProfileEditor/ui_editor_assignsSection/views/SlotTriggerDisplay';
import { makeAssignEditSectionViewModel } from './viewModels/AssignEditSectionViewModel';
import { OperationEditPart } from './views/OperationEditPart';
import { OperationSlotsPart } from './views/OperationSlotsPart';

export const AssignEditSection: FC = () => {
  const {
    isDisabled,
    isSingleMode,
    isDualMode,
    operationSlotsVM,
    plainOperationEditCardsVM,
    operationEditPartVM,
    layoutOptionEditVM,
  } = makeAssignEditSectionViewModel();

  return (
    <div css={cssAssignEditSection}>
      <div css={cssAssignEntryEditPart} data-disabled={isDisabled}>
        {isDualMode && (
          <div>
            <OperationSlotsPart
              operationSlotsVM={operationSlotsVM}
              plainOperationEditCardsVM={plainOperationEditCardsVM}
            />
            <SlotTriggerDisplay className="slot-trigger-display" />
          </div>
        )}
        <OperationEditPart
          plainOperationEditCardsVM={plainOperationEditCardsVM}
          operationEditPartVM={operationEditPartVM}
          layoutOptionEditVM={layoutOptionEditVM}
          isSingleMode={isSingleMode}
        />
      </div>
    </div>
  );
};

const cssAssignEditSection = css`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const cssAssignEntryEditPart = css`
  display: flex;
  &[data-disabled] {
    opacity: 0.3;
    pointer-events: none;
  }
  padding: 8px;

  .slot-trigger-display {
    margin-top: 15px;
  }
`;
