import { editorViewModel } from '~viewModels/EditorViewModel';
import { hx } from '~views/basis/qx';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';
import { OerationSlotsPart } from './OperationSlotsPart';

export function EntryEditPart() {
  const vm = editorViewModel.keyAssignEditViewModel;
  if (!vm) {
    return <div>no assign entry loaded</div>;
  }

  return (
    <div>
      <div>asssign edit</div>
      <AssingTypeSelectionPart />
      {vm.assignEntryViewModel && <OerationSlotsPart />}
    </div>
  );
}
