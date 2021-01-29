import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';
import {
  makePlainOperationEditCardsViewModel,
  makeOperationEditPartViewModel,
} from '~/ui-root/zones/editor/viewModels/OperationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from '~/ui-root/zones/editor/viewModels/OperationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from '~/ui-root/zones/editor/viewModels/OperationSlotsPartViewModel';

export function makeAssignEditSectionViewModel() {
  const isDisabled = !editorModel.isSlotSelected;
  const { isSingleMode, isDualMode } = editorModel;

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
