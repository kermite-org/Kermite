import { reflectValue } from '~/base/FormHelpers';
import { h, Hook } from '~/qx';

interface ITextInputProps {
  value: string;
  handleChange: (value: string) => void;
}

export const TextInput = (props: ITextInputProps) => {
  const sourceValue = props.value;

  const [editValue, setEditValue] = Hook.useState(sourceValue);

  Hook.useSideEffect(() => {
    setEditValue(sourceValue);
    return true;
  }, [sourceValue]);

  const onChange = () => {
    props.handleChange(editValue);
    setEditValue(sourceValue);
  };

  return (
    <input
      type="text"
      value={editValue}
      onInput={reflectValue(setEditValue)}
      onChange={onChange}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TextInput0 = (_props0: ITextInputProps) => {
  let sourceValue = '';
  let editValue = '';
  let hasFocus = false;

  const onFocus = () => (hasFocus = true);

  const onBlur = () => (hasFocus = false);

  const setEditValue = (newEditValue: string) => {
    editValue = newEditValue;
  };

  return (props: ITextInputProps) => {
    if (props.value !== sourceValue) {
      sourceValue = props.value;
      editValue = props.value;
    }

    const onChange = () => {
      props.handleChange(editValue);
      editValue = sourceValue;
    };

    return (
      <input
        type="text"
        value={hasFocus ? editValue : sourceValue}
        onInput={reflectValue(setEditValue)}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  };
};
