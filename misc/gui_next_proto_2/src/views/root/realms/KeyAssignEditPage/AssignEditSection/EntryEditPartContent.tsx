import { hx } from '~views/basis/qx';
import { editorModel } from '~models/model/EditorModel';
import { css } from 'goober';
import { UiTheme } from '~views/common/UiTheme';
import { IOperationSlotModel } from '~models/model/KeyAssignEntryEditModel';

function OperationSlotCard(props: { isCurrent: boolean; setCurrent(): void }) {
  const cssSlotCard = css`
    border: solid 1px #888;
    width: 30px;
    height: 30px;
    cursor: pointer;
    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }
  `;
  return (
    <div
      css={cssSlotCard}
      data-current={props.isCurrent}
      onClick={props.setCurrent}
    ></div>
  );
}

function OperationSlotRow({ slot }: { slot: IOperationSlotModel }) {
  const cssSlotRow = css`
    display: flex;

    > .textColumn {
      width: 80px;
    }
  `;
  return (
    <div css={cssSlotRow}>
      <div className="textColumn">{slot.text} </div>
      <div className="slotColumn">
        <OperationSlotCard
          isCurrent={slot.isCurrent}
          setCurrent={slot.setCurrent}
        />
      </div>
    </div>
  );
}

export function EntryEditPartContent() {
  const { slots } = editorModel.keyAssignEditModel?.assignEntryModel!;
  return (
    <div>
      <div>assign entry</div>
      {slots.map((slot) => (
        <OperationSlotRow slot={slot} />
      ))}
    </div>
  );
}
