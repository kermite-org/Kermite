import { css } from 'goober';
import { editorModel } from '~ui2/models/zAppDomain';
import { hx } from '~ui2/views/basis/qx';
import { OpertionEditPart } from './OperationEditPart/OperationEditPart';
import { OerationSlotsPart } from './EntryEditPart/OperationSlotsPart';

export function AssignEditSection() {
  const cssBase = css`
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const cssAssignEntryEditPart = css`
    display: flex;
    &[data-disabled] {
      opacity: 0.3;
      pointer-events: none;
    }
    border: solid 1px #333;
    padding: 8px;
  `;

  const isDisabled = !editorModel.isSlotSelected;
  const isDualMode = editorModel.isDualMode;

  return (
    <div css={cssBase}>
      <div css={cssAssignEntryEditPart} data-disabled={isDisabled}>
        {isDualMode && <OerationSlotsPart />}
        <OpertionEditPart />
      </div>
    </div>
  );
}
