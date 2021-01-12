import { models } from '~/models';
import {
  makePlainOperationEditCardsViewModel,
  makeOperationEditPartViewModel,
} from '~/viewModels/Editor/OperationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from '~/viewModels/Editor/OperationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from '~/viewModels/Editor/OperationSlotsPartViewModel';

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
