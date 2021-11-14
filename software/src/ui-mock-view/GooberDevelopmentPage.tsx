import {
  jsx,
  rerender,
  css,
  applyGlobalStyle,
  styled,
  useEffect,
} from 'alumina';

const cssRoot = css`
  border: solid 4px orange;
  color: green;
  padding: 10px;
`;

const boxW = 100;
const boxH = 50;

const cssHeader = css`
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
`;

const cssPage = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  #app {
    font-family: 'Roboto', sans-serif;
  }

  body {
    overflow: hidden;
    background: #dfd;
  }
`;
applyGlobalStyle(cssPage);

const Foo = styled.div`
  width: 100px;
  height: 50px;
  border: solid 1px #f08;
`;

export const GooberDevelopmentPage = () => {
  useEffect(() => {
    setTimeout(rerender, 1000);
  }, []);

  console.log('render');
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
      <Foo>world</Foo>
    </div>
  );
};
