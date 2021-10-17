import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import {
  makePlainOperationEditCardsViewModel,
  makeOperationEditPartViewModel,
} from '~/ui/editors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from '~/ui/editors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from '~/ui/editors/ProfileEditor/ui_editor_assignsSection/viewModels/OperationSlotsPartViewModel';

export function makeAssignEditSectionViewModel() {
  const isDisabled = !assignerModel.isSlotSelected;
  const { isSingleMode, isDualMode } = assignerModel;

  const operationSlotsVM = makeOperationSlotsPartViewModel();
  const plainOperationEditCardsVM = makePlainOperationEditCardsViewModel();
  const operationEditPartVM = makeOperationEditPartViewModel();
  const layoutOptionEditVM = makeOperationLayerOptionEditViewModel();

  return {
    isDisabled,
    isSingleMode,
    isDualMode,
    operationSlotsVM,
    plainOperationEditCardsVM,
    operationEditPartVM,
    layoutOptionEditVM,
  };
}