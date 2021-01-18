import { h } from 'qx';
import { reflectChecked } from '~/ui-common';

export const CheckboxLine = (props: {
  text: string;
  checked: boolean;
  setChecked(checked: boolean): void;
}) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={props.checked}
          onChange={reflectChecked(props.setChecked)}
        />
        {props.text}
      </label>
    </div>
  );
};
