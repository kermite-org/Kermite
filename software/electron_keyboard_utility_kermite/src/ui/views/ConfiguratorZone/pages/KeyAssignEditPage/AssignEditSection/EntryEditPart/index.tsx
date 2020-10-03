import { h } from '~lib/qx';
import { editorModel } from '~ui/models';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';
import { OerationSlotsPart } from './OperationSlotsPart';

export function EntryEditPart() {
  if (!editorModel.isSlotSelected) {
    return <div>no assign entry loaded</div>;
  }
  return (
    <div>
      <div>asssign edit</div>
      <AssingTypeSelectionPart />
      <OerationSlotsPart />
    </div>
  );
}
