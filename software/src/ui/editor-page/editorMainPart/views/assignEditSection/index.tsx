import { jsx, css } from 'qx';
import { makeAssignEditSectionViewModel } from '~/ui/editor-page/editorMainPart/viewModels/AssignEditSectionViewModel';
import { OpertionEditPart } from './OperationEditPart';
import { OerationSlotsPart } from './OperationSlotsPart';

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
`;

export function AssignEditSection() {
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
          <OerationSlotsPart
            operationSlotsVM={operationSlotsVM}
            plainOperationEditCardsVM={plainOperationEditCardsVM}
          />
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
}
