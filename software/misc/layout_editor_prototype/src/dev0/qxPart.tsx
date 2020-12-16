import { reflectValue } from '~/base/FormHelpers';
import { h, Hook, render } from '~/qx';

const Counter = () => {
  const [count, setCount] = Hook.useState(0);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>inc</button>
      <span>{count}</span>
    </div>
  );
};

const editorState = {
  userName: 'yamada',
};

const TextInput = (props: {
  value: string;
  handleChange: (value: string) => void;
}) => {
  const sourceValue = props.value;
  const [editText, setEditText] = Hook.useState(sourceValue);

  Hook.useEffect(() => {
    setEditText(sourceValue);
  }, [sourceValue]);

  const onChange = () => {
    props.handleChange(editText);
    setEditText(sourceValue);
  };

  return (
    <input
      type="text"
      value={editText}
      onInput={reflectValue(setEditText)}
      onChange={onChange}
    />
  );
};

const NameEditor = () => {
  const onChange = (text: string) => {
    if (text.length < 8) {
      editorState.userName = text;
      console.log({ text });
    }
  };

  const setRandom = () => {
    editorState.userName = `user-${(Math.random() * 1000) >> 0}`;
  };

  return (
    <div>
      <TextInput value={editorState.userName} handleChange={onChange} />
      <button onClick={setRandom}>random</button>
    </div>
  );
};

// const renderCount = 0;
const PageRoot = () => {
  // console.log(`render ${renderCount++}`);
  return (
    <div style={{ border: 'solid 1px #888' }}>
      <div>qx part</div>
      <div>hello2</div>
      <Counter />
      <NameEditor />
    </div>
  );
};
export function startQxPart() {
  render(() => <PageRoot />, document.getElementById('app2'));
}
