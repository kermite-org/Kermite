import { editorModel } from '~models/model/EditorModel';
import { hx } from '~views/basis/qx';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';
import { OerationSlotsPart } from './OperationSlotsPart';

export function EntryEditPart() {
  const model = editorModel.keyAssignEditModel;
  if (!model) {
    return <div>no assign entry loaded</div>;
  }

  return (
    <div>
      <div>asssign edit</div>
      <AssingTypeSelectionPart />
      {model.assignEntryModel && <OerationSlotsPart />}
    </div>
  );
}
