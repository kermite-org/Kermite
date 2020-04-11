import { hx } from '~views/basis/qx';
import { editorModel } from '~models/model/EditorModel';
import { css } from 'goober';
import { UiTheme } from '~views/common/UiTheme';
import { app } from '~models/core/appGlobal';

function AssingTypeSelectionPart() {
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

function AssignEntryEditSection() {
  const model = editorModel.keyAssignEditModel?.assignEntryModel;

  if (!model) {
    return <div></div>;
  }

  const cssSlotCard = css`
    border: solid 1px #888;
    width: 30px;
    height: 30px;
    cursor: pointer;
    &[data-current] {
      background: ${UiTheme.clSelectHighlight};
    }
  `;
  const {
    isPrimaryCurrent,
    isSecondaryCurrent,
    setPrimaryCurrent,
    setSecondaryCurrent,
  } = model;

  return (
    <div>
      <div>assign entry</div>
      <table>
        <tbody>
          <tr>
            <td>primary</td>
            <td>
              <div
                css={cssSlotCard}
                data-current={isPrimaryCurrent}
                onClick={setPrimaryCurrent}
              ></div>
            </td>
          </tr>
          <tr>
            <td>secondary</td>
            <td>
              <div
                css={cssSlotCard}
                data-current={isSecondaryCurrent}
                onClick={setSecondaryCurrent}
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function AssignEditSection() {
  const model = editorModel.keyAssignEditModel;

  app.setDebugObject({ m: model?.assignEntryModel || null });

  if (!model) {
    return <div>no assign loaded</div>;
  }
  return (
    <div>
      <div>asssign edit</div>
      <AssingTypeSelectionPart />
      <AssignEntryEditSection />
    </div>
  );
}
