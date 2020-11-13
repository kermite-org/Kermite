import { h } from '~lib/qx';
import { reflectChecked } from '~ui/base/helper/FormHelpers';

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
