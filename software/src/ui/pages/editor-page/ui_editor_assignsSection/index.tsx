import { jsx, css, FC } from 'qx';
import { SlotTriggerDisplay } from '~/ui/pages/editor-page/ui_editor_assignsSection/views/SlotTriggerDisplay';
import { makeAssignEditSectionViewModel } from './viewModels/AssignEditSectionViewModel';
import { OpertionEditPart } from './views/OperationEditPart';
import { OerationSlotsPart } from './views/OperationSlotsPart';

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
            <OerationSlotsPart
              operationSlotsVM={operationSlotsVM}
              plainOperationEditCardsVM={plainOperationEditCardsVM}
            />
            <SlotTriggerDisplay className="slot-trigger-display" />
          </div>
        )}
        <OpertionEditPart
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
