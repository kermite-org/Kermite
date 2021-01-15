import { reflectChecked } from '@kermite/ui';
import { h } from 'qx';

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
