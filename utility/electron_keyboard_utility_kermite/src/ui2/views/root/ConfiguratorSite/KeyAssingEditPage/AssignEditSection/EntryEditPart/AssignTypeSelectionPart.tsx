import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { UiTheme } from '~ui2/views/common/UiTheme';
import { makeKeyAssignTypeSelectionPartViewModel } from './AssignTypeSelectionPart.model';

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

  const assignTypeSelectionPartViewModel = makeKeyAssignTypeSelectionPartViewModel();

  return (
    <div css={cssAssignTypeSlotsBox}>
      {assignTypeSelectionPartViewModel.slots.map((slot, index) => {
        return (
          <div
            key={index}
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
