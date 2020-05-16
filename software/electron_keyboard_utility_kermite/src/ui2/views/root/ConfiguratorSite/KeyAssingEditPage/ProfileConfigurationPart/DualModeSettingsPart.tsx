import { editorModel } from '~ui2/models/zAppDomain';
import { h } from '~ui2/views/basis/qx';
import {
  reflectFieldChecked,
  reflectFieldValue,
  reflectValue
} from '~ui2/views/common/FormHelpers';

export const DualModeSettingsPart = () => {
  if (editorModel.profileData.assignType === 'single') {
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
    <div>
      <div>dual settings</div>

      <div>
        primary default trigger
        <select
          value={settings.primaryDefaultTrigger}
          onChange={reflectFieldValue(settings, 'primaryDefaultTrigger')}
        >
          <option value="down">down</option>
          <option value="tap">tap</option>
        </select>
      </div>
      <div>
        tap hold threshold
        <input
          type="number"
          value={settings.tapHoldThresholdMs}
          onChange={reflectValue(onTapHoldThresholdValueChanged)}
        />
        ms
      </div>

      <div>
        use interrupt hold
        <input
          type="checkbox"
          checked={settings.useInterruptHold}
          onChange={reflectFieldChecked(settings, 'useInterruptHold')}
        />
      </div>
    </div>
  );
};
