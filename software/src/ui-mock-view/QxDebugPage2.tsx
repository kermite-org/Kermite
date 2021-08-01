import { css, FC, jsx } from 'qx';

const cssBase = css`
  padding: 10px;
  color: blue;
`;

let count = 0;

const cssCounterCard = css`
  width: 100px;
  height: 50px;
  border: solid 1px blue;
`;

const TestCard: FC = () => {
  if (count % 6 >= 3) {
    return null;
  }
  return <div id="testCard">testCard</div>;
};
const CounterCard: FC = () => {
  return (
    <div id="countCard" css={cssCounterCard} onClick={() => count++}>
      {count}
      {count % 5 < 2 && <div>fizz</div>}
      <TestCard />
    </div>
  );
};

export const QxDebugPage2: FC = () => {
  console.log(`render`);
  return (
    <div css={cssBase}>
      Hello
      <CounterCard />
    </div>
  );
};
