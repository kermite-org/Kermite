import { h } from '~ui2/views/basis/qx';
import { AssingTypeSelectionPart } from './AssignTypeSelectionPart';
import { OerationSlotsPart } from './OperationSlotsPart';
import { editorModel } from '~ui2/models/zAppDomain';

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
