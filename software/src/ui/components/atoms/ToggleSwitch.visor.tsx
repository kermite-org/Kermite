import { jsx } from 'qx';
import { ToggleSwitch } from '~/ui/components/atoms/ToggleSwitch';

const labelStyle =
  'display: flex; align-items: center; gap: 5px; cursor: pointer; user-select:none;';

export const ToggleSwitchExamples = {
  notChecked: <ToggleSwitch checked={false} />,
  checked: <ToggleSwitch checked={true} />,
  notCheckedDisabled: <ToggleSwitch checked={false} disabled />,
  checkedDisabled: <ToggleSwitch checked={true} disabled />,
  withLabelLeft: (
    <label style={labelStyle}>
      <span>special mode</span>
      <ToggleSwitch checked={false} />
    </label>
  ),
  withLabelRight: (
    <label style={labelStyle}>
      <ToggleSwitch checked={false} />
      <span>special mode</span>
    </label>
  ),
};
