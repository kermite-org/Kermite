import { models } from '~ui/models';
import {
  makeOperationEditPartViewModel,
  makePlainOperationEditCardsViewModel,
} from '~ui/viewModels/Editor/OperationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from '~ui/viewModels/Editor/OperationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from '~ui/viewModels/Editor/OperationSlotsPartViewModel';

export function makeAssignEditSectionViewModel() {
  const isDisabled = !models.editorModel.isSlotSelected;
  const { isSingleMode, isDualMode } = models.editorModel;

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
