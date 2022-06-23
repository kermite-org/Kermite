import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';
import {
  makePlainOperationEditCardsViewModel,
  makeOperationEditPartViewModel,
} from '~/ui/featureEditors/profileEditor/ui_editor_assignsSection/viewModels/operationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from '~/ui/featureEditors/profileEditor/ui_editor_assignsSection/viewModels/operationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from '~/ui/featureEditors/profileEditor/ui_editor_assignsSection/viewModels/operationSlotsPartViewModel';

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
