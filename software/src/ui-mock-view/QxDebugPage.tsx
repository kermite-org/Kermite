import {
  jsx,
  AluminaChild,
  AluminaChildren,
  css,
  useLocal,
  useEffect,
} from 'alumina';

const Hello = () => <div>hello</div>;

const Frame = (props: { children?: AluminaChildren }) => {
  const frameStyle = css`
    border: solid 1px blue;
    padding: 4px;
  `;
  return <div css={frameStyle}>{props.children}</div>;
};

const Frame1 = (props: { children: AluminaChild }) => {
  const frameStyle = css`
    border: solid 1px red;
    padding: 4px;
  `;
  return <div css={frameStyle}>{props.children}</div>;
};

const FrameDev = () => {
  return (
    <div>
      <Frame>hoge</Frame>
      <Frame>foo bar</Frame>
      <Frame>
        <Hello />
      </Frame>
      <Frame />
      <Frame>
        <div>hooo</div>
        <div>bar</div>
      </Frame>

      <Frame1>hoge</Frame1>
      <Frame1>foo bar</Frame1>
      <Frame1>
        <Hello />
      </Frame1>
    </div>
  );
};

const cssSelect = css`
  width: 100px;
`;
const SelectorTest = () => {
  // const optionSource: string[] = []; // 'aa', 'bb', 'cc'];

  // const selIndex = (Math.random() * 3) >> 0;

  const local = useLocal({ index: 0, optionSource: [] });

  useEffect(() => {
    // local.index = 1;
    local.optionSource = [];
  }, []);

  return (
    <div>
      <select size={10} css={cssSelect} value={local.optionSource[local.index]}>
        {local.optionSource.map((it) => (
          <option value={it} key={it}>
            {it}
          </option>
        ))}
      </select>
    </div>
  );
};
const cssBase = css`
  padding: 10px;
`;
export const QxDebugPage = () => {
  console.log(`render`);
  return (
    <div css={cssBase}>
      <SelectorTest />
      <FrameDev />
      <button onClick={() => {}}>rerender</button>
    </div>
  );
};
