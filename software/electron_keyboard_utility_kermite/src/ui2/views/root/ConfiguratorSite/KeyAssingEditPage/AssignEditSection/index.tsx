import { css } from 'goober';
import { editorModel } from '~ui2/models/zAppDomain';
import { hx } from '~ui2/views/basis/qx';
import { OpertionEditPart } from './OperationEditPart/OperationEditPart';

export function AssignEditSection() {
  const cssAssignEntryEditPart = css`
    flex-grow: 1;
    display: flex;
  `;

  // const cssEntryEditColumnBox = css`
  //   width: 140px;
  //   flex-shrink: 0;
  // `;

  const cssOperatinEditColumnBox = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    &[data-disabled] {
      opacity: 0.3;
      pointer-events: none;
    }
  `;

  const isDisabled = !editorModel.isSlotSelected;

  return (
    <div css={cssAssignEntryEditPart}>
      {/* <div css={cssEntryEditColumnBox}>
        <EntryEditPart />
      </div> */}
      <div css={cssOperatinEditColumnBox} data-disabled={isDisabled}>
        <OpertionEditPart />
      </div>
    </div>
  );
}
