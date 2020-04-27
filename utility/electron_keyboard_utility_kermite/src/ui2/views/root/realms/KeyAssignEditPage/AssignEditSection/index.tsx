import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { EntryEditPart } from './EntryEditPart';
import { OpertionEditPart } from './OperationEditPart/OperationEditPart';
import { editorModel } from '~ui2/models/EditorModel';

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
      flex-shrink: 0;
    }

    > .operatinEditColumnBox {
      flex-grow: 1;
      border: solid 2px #0f8;
      display: flex;
      flex-direction: column;
    }
  `;

  return (
    <div css={cssAssignEntryEditPart}>
      <div className="entryEditColumnBox">
        <EntryEditPart />
      </div>
      <div className="operatinEditColumnBox">
        <OpertionEditPart />
      </div>
    </div>
  );
}
