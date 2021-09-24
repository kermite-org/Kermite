import { css, FC, jsx } from 'qx';
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
                onChange={reflectValue((value) =>
                  writeSettingsValueDual(
                    'primaryDefaultTrigger',
                    value as 'down' | 'tap',
                  ),
                )}
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

const style = css`
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
