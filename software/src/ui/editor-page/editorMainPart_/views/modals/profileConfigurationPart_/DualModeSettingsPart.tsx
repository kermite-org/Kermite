import { jsx, css } from 'qx';
import {
  reflectFieldValue,
  reflectValue,
  reflectFieldChecked,
  texts,
} from '~/ui/common';
import { editorModel } from '~/ui/editor-page/editorMainPart_/models/EditorModel';

const cssDualModeSettingsPart = css`
  margin-top: 15px;

  table.settingsTable {
    margin-top: 3px;
    margin-left: 10px;

    td {
      padding: 2px 0;
    }

    td + td {
      padding-left: 5px;
    }
  }

  .msInput {
    width: 60px;
    text-align: center;
  }
`;

export const DualModeSettingsPart = () => {
  if (editorModel.profileData.settings.assignType === 'single') {
    return null;
  }

  const { settings } = editorModel.profileData;

  const onTapHoldThresholdValueChanged = (value: string) => {
    const val = parseInt(value);
    if (isFinite(val) && 1 <= val && val < 3000) {
      settings.tapHoldThresholdMs = val;
    } else {
      console.log(`${val} is not appropriate for the parameter.`);
    }
  };

  return (
    <div css={cssDualModeSettingsPart}>
      <div data-hint={texts.hint_assigner_profileConfigModal_dualMode_header}>
        {texts.label_assigner_profileConfigModal_dualMode_header}
      </div>

      <table class="settingsTable">
        <tbody>
          <tr>
            <td
              data-hint={
                texts.hint_assigner_profileConfigModal_dualMode_primaryDefaultTrigger
              }
            >
              {
                texts.label_assigner_profileConfigModal_dualMode_primaryDefaultTrigger
              }
            </td>
            <td>
              <select
                value={settings.primaryDefaultTrigger}
                onChange={reflectFieldValue(settings, 'primaryDefaultTrigger')}
              >
                <option value="down">down</option>
                <option value="tap">tap</option>
              </select>
            </td>
          </tr>
          <tr>
            <td
              data-hint={
                texts.hint_assigner_profileConfigModal_dualMode_tapHoldThreshold
              }
            >
              {
                texts.label_assigner_profileConfigModal_dualMode_tapHoldThreshold
              }
            </td>
            <td>
              <input
                type="number"
                class="msInput"
                value={settings.tapHoldThresholdMs}
                onChange={reflectValue(onTapHoldThresholdValueChanged)}
              />
              ms
            </td>
          </tr>
          <tr>
            <td
              data-hint={
                texts.hint_assigner_profileConfigModal_dualMode_useInterruptHold
              }
            >
              {
                texts.label_assigner_profileConfigModal_dualMode_useInterruptHold
              }
            </td>
            <td>
              <input
                type="checkbox"
                checked={settings.useInterruptHold}
                onChange={reflectFieldChecked(settings, 'useInterruptHold')}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
