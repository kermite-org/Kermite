import { css, FC, jsx, useLocal } from 'alumina';
import { IPrimaryDefaultTrigger, ISecondaryDefaultTrigger } from '~/shared';
import { texts } from '~/ui/base';
import { GeneralInput } from '~/ui/components';
import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';
import { reflectChecked, reflectValue } from '~/ui/utils';

export const DualModeSettingsPart: FC = () => {
  if (assignerModel.profileData.settings.assignType === 'single') {
    return null;
  }

  const { settings } = assignerModel.profileData;
  const { writeSettingsValueDual } = assignerModel;

  const local = useLocal({
    tapHoldThresholdMs: settings.tapHoldThresholdMs,
    TapHoldThresholdMsValid: true,
  });
  const onTapHoldThresholdValueChanged = (test: string) => {
    const value = parseInt(test);
    if (isFinite(value) && 1 <= value && value < 3000) {
      writeSettingsValueDual('tapHoldThresholdMs', value);
      local.tapHoldThresholdMs = value;
      local.TapHoldThresholdMsValid = true;
    } else {
      local.TapHoldThresholdMsValid = false;
    }
  };

  return (
    <div class={style}>
      <table class="settingsTable">
        <tbody>
          <tr>
            <td
              data-hint={
                texts.assignerProfileConfigModalHint.dualMode_tapHoldThreshold
              }
            >
              {texts.assignerProfileConfigModal.dualMode_tapHoldThreshold}
            </td>
            <td>
              <div class="tapholdms-edit-cell">
                <GeneralInput
                  type="number"
                  class="ms-input"
                  value={local.tapHoldThresholdMs.toString()}
                  setValue={onTapHoldThresholdValueChanged}
                  invalid={!local.TapHoldThresholdMsValid}
                />
                ms
              </div>
              <div class="error-text" if={!local.TapHoldThresholdMsValid}>
                valid range: 1~3000
              </div>
            </td>
          </tr>
          <tr>
            <td
              data-hint={
                texts.assignerProfileConfigModalHint.dualMode_useInterruptHold
              }
            >
              {texts.assignerProfileConfigModal.dualMode_useInterruptHold}
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
    <div class={style}>
      <table class="settingsTable">
        <tbody>
          <tr>
            <td
              data-hint={
                texts.assignerProfileConfigModalHint
                  .dualMode_primaryDefaultTrigger
              }
            >
              {texts.assignerProfileConfigModal.dualMode_primaryDefaultTrigger}
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
                texts.assignerProfileConfigModal
                  .dualMode_secondaryDefaultTrigger
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

    td {
      padding: 2px 0;
    }

    td + td {
      padding-left: 5px;
    }

    > tbody > tr > td {
      > .tapholdms-edit-cell {
        display: flex;
        align-items: center;
        > .ms-input {
          width: 70px;
          text-align: center;
          margin-right: 5px;
        }
      }
      > .error-text {
        color: #f00;
      }
    }
  }
`;
