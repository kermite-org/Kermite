import { editorModel } from '~models/model/EditorModel';
import { hx } from '~views/basis/qx';
import { AssignEntryEditPart } from './AssignEntryEditPart';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';

export function AssignEditSection() {
  if (!editorModel.isSlotSelected) {
    return <div>no assign loaded</div>;
  }
  return (
    <div>
      <div>asssign edit</div>
      <AssingTypeSelectionPart />
      <AssignEntryEditPart />
    </div>
  );
}
