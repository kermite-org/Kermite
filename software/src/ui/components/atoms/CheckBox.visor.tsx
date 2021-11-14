import { jsx } from 'alumina';
import { CheckBox } from '~/ui/components/atoms/CheckBox';

let gChecked = false;

export const CheckBoxExamples = {
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
