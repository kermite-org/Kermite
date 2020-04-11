import { hx } from '~views/basis/qx';
import { editorModel } from '~models/model/EditorModel';
import { app } from '~models/core/appGlobal';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';
import { AssignEntryEditPart } from './AssignEntryEditPart';

export function AssignEditSection() {
  const model = editorModel.keyAssignEditModel;

  app.setDebugObject({ m: model?.assignEntryModel || null });

  if (!model) {
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
