import { css, FC, jsx } from 'qx';
import { IPrimaryDefaultTrigger, ISecondaryDefaultTrigger } from '~/shared';
import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/editors/ProfileEditor/models/AssignerModel';
import { reflectChecked, reflectValue } from '~/ui/utils';

export const DualModeSettingsPart: FC = () => {
  if (assignerModel.profileData.settings.assignType === 'single') {
    return null;
  }

  const { settings } = assignerModel.profileData;
  const { writeSettingsValueDual } = assignerModel;

  const onTapHoldThresholdValueChanged = (test: string) => {
    const value = parseInt(test);
    if (isFinite(value) && 1 <= value && value < 3000) {
      writeSettingsValueDual('tapHoldThresholdMs', value);
    } else {
      console.log(`${value} is not appropriate for the parameter.`);
    }
  };

  return (
    <div css={style}>
      <table class="settingsTable">
        <tbody>
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
                onChange={reflectChecked((checked) =>
                  writeSettingsValueDual('useInterruptHold', checked),
                )}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const DualModeSettingsPart2: FC = () => {
  if (assignerModel.profileData.settings.assignType === 'single') {
    return null;
  }

  const { settings } = assignerModel.profileData;
  const { writeSettingsValueDual } = assignerModel;

  return (
    <div css={style}>
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
                onChange={reflectValue((value: IPrimaryDefaultTrigger) =>
                  writeSettingsValueDual('primaryDefaultTrigger', value),
                )}
              >
                <option value="down">down</option>
                <option value="tap">tap</option>
              </select>
            </td>
          </tr>

          <tr>
            <td>
              {
                texts.label_assigner_profileConfigModal_dualMode_secondaryDefaultTrigger
              }
            </td>
            <td>
              <select
                value={settings.secondaryDefaultTrigger}
                onChange={reflectValue((value: ISecondaryDefaultTrigger) =>
                  writeSettingsValueDual('secondaryDefaultTrigger', value),
                )}
              >
                <option value="down">down</option>
                <option value="hold">hold</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const style = css`
  margin-top: 15px;

  > table.settingsTable {
    margin-top: 3px;
    /* margin-left: 10px; */

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
