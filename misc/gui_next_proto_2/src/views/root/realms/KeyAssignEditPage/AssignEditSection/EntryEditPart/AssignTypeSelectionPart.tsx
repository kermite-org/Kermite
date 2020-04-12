import { hx } from '~views/basis/qx';
import { editorViewModel } from '~viewModels/EditorViewModel';
import { css } from 'goober';
import { UiTheme } from '~views/common/UiTheme';

export function AssingTypeSelectionPart() {
  const cssAssignTypeSlotsBox = css`
    display: flex;
    border: solid 2px #f08;
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

  const vm = editorViewModel.keyAssignEditViewModel!;
  return (
    <div css={cssAssignTypeSlotsBox}>
      {vm.assignTypeSlotViewModels.map((slot) => {
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
