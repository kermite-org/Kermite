import { css } from 'goober';
import { editorModel } from '~models/model/EditorModel';
import { hx } from '~views/basis/qx';
import { EntryEditPart } from './EntryEditPart/EntryEditPart';
import { OpertionEditPart } from './OperationEditPart';

export function AssignEditSection() {
  if (!editorModel.isSlotSelected) {
    return <div>no assign loaded</div>;
  }

  const cssAssignEntryEditPart = css`
    flex-grow: 1;
    display: flex;
    border: solid 2px #08f;

    > .entryEditColumnBox {
      border: solid 2px #f80;
      width: 140px;
    }

    > .operatinEditColumnBox {
      flex-grow: 1;
      border: solid 2px #0f8;
    }
  `;

  return (
    <div css={cssAssignEntryEditPart}>
      <div class="entryEditColumnBox">
        <EntryEditPart />
      </div>
      <div class="operatinEditColumnBox">
        <OpertionEditPart />
      </div>
    </div>
  );
}
