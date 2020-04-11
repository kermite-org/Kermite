import { hx } from '~views/basis/qx';
import { editorModel } from '~models/model/EditorModel';
import { css } from 'goober';
import { UiTheme } from '~views/common/UiTheme';

export function AssingTypeSelectionPart() {
  const cssAssignTypeSlotsBox = css`
    display: flex;
  `;

  const cssAssignTypeSlotCard = css`
    display: flex;
    justify-content: center;
    align-items: center;
    border: solid 1px #888;
    width: 30px;
    height: 30px;
    cursor: pointer;

    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }
  `;

  const model = editorModel.keyAssignEditModel!;
  return (
    <div css={cssAssignTypeSlotsBox}>
      {model.assignTypeSlotModels.map((slot) => {
        return (
          <div
            data-current={slot.isCurrent}
            onClick={slot.setCurrent}
            css={cssAssignTypeSlotCard}
          >
            {slot.text}
          </div>
        );
      })}
    </div>
  );
}
