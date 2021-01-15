import { h, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { reflectValue } from '~/base/FormHelpers';

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>inc</button>
      <span>{count}</span>
    </div>
  );
};

const TextInput = (props: {
  value: string;
  handleChange: (value: string) => void;
}) => {
  const sourceValue = props.value;
  const [hasFocus, setHasFocus] = useState(false);
  const [editText, setEditText] = useState('test');

  useEffect(() => {
    setEditText(sourceValue);
  }, [sourceValue]);

  const onFocus = () => setHasFocus(true);

  const onBlur = () => {
    setHasFocus(false);
    props.handleChange(editText);
    setEditText(sourceValue);
  };

  return (
    <input
      type="text"
      value={hasFocus ? editText : sourceValue}
      onInput={reflectValue(setEditText)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

const NameEditor = () => {
  const [userName, setUserName] = useState('yamada');

  const onChange = (text: string) => {
    if (text.length < 8) {
      setUserName(text);
      console.log(`onChange ${text}`);
    }
  };

  const setRandom = () => {
    setUserName(`user-${(Math.random() * 1000) >> 0}`);
  };

  return (
    <div>
      <TextInput value={userName} handleChange={onChange} />
      <button onClick={setRandom}>random</button>
    </div>
  );
};

const PageRoot = () => {
  return (
    <div style={{ border: 'solid 1px #888' }}>
      <div>preact part</div>
      <div>hello</div>
      <Counter />
      <NameEditor />
    </div>
  );
};

export function startPreactPart() {
  render(<PageRoot />, document.getElementById('app')!);
}
