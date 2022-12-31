import { jsx } from 'alumina';
import { CheckBox } from './CheckBox';

let gChecked = false;

export default {
  default: () => (
    <CheckBox checked={gChecked} setChecked={(ck) => (gChecked = ck)} />
  ),
  unchecked: <CheckBox checked={false} setChecked={() => {}} />,
  checked: <CheckBox checked={true} setChecked={() => {}} />,
  uncheckedDisabled: (
    <CheckBox checked={false} disabled setChecked={() => {}} />
  ),
  checkedDisabled: <CheckBox checked={true} disabled setChecked={() => {}} />,
};
