import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { editorModel } from '~ui/models';
import { OpertionEditPart } from './OperationEditPart';
import { OerationSlotsPart } from './OperationSlotsPart';

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
    /* border: solid 1px ${uiTheme.colors.clCommonFrame}; */
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
