import { css } from 'goober';
import { editorModel } from '~models/model/EditorModel';
import { hx } from '~views/basis/qx';
import { EntryEditPartContent } from './EntryEditPartContent';
import { OpertionEditPartContent } from './OperationEditPart';

export function AssignEntryEditPart() {
  const model = editorModel.keyAssignEditModel?.assignEntryModel;
  if (!model) {
    return null;
  }

  const cssAssignEntryEditPart = css`
    display: flex;

    > .entryEditColumnBox {
    }

    > .operatinEditColumnBox {
      flex-grow: 1;
    }
  `;

  return (
    <div css={cssAssignEntryEditPart}>
      <div class="entryEditColumnBox">
        <EntryEditPartContent />
      </div>
      <div class="operatinEditColumnBox">
        <OpertionEditPartContent />
      </div>
    </div>
  );
}
