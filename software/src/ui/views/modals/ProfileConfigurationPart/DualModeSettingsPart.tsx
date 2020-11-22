import { css } from 'goober';
import { h } from '~lib/qx';
import {
  reflectFieldChecked,
  reflectFieldValue,
  reflectValue
} from '~ui/base/helper/FormHelpers';
import { models } from '~ui/models';

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
  if (models.editorModel.profileData.assignType === 'single') {
    return null;
  }

  const { settings } = models.editorModel.profileData;

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
      <div>dual mode settings</div>

      <table class="settingsTable">
        <tbody>
          <tr>
            <td> primary default trigger</td>
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
            <td> tap hold threshold</td>
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
            <td> use interrupt hold</td>
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
