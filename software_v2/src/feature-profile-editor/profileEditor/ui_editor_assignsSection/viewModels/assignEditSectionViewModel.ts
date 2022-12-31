import { assignerModel } from '../../models';
import {
  makeOperationEditPartViewModel,
  makePlainOperationEditCardsViewModel,
} from './operationEditPartViewModel';
import { makeOperationLayerOptionEditViewModel } from './operationLayerOptionEditViewModel';
import { makeOperationSlotsPartViewModel } from './operationSlotsPartViewModel';

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
