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

const CounterCard: FC = () => {
  return (
    <div css={cssCounterCard} onClick={() => count++}>
      {count}
      {count % 5 === 0 && <div>fizz</div>}
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
