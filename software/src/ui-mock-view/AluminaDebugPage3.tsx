import { FC, jsx, Fragment } from 'alumina';

let count = 0;
const Counter = () => {
  return <div onClick={() => count++}>{count}</div>;
};

const TestComponent0 = () => {
  return <div>tc01 {count}</div>;
};

const TestComponent1 = () => {
  if (count % 2 === 0) {
    return null;
  }
  console.log('tc1');
  return <div>tc11</div>;
};

const TestComponent2 = () => {
  if (count % 2 === 0) {
    return null;
  }
  console.log('tc2');

  return (
    <>
      <div>tc21</div>
      <div>tc22</div>
    </>
  );
};

const TestComponent3 = () => {
  return (
    <>
      <div>tc31</div>
    </>
  );
};

const TestComponent4 = () => {
  return (
    <>
      <TestComponent3 />
    </>
  );
};

export const AluminaDebugPage3: FC = () => {
  console.log(`render`);
  return (
    <div>
      <Counter />
      <div>foo</div>
      <>
        {count}
        <p>bar</p>
        <p>buzz</p>
      </>
      <TestComponent0 />
      <TestComponent1 />
      <TestComponent2 />
      <div>hoge</div>
      <TestComponent4 />
      <div>piyo</div>
    </div>
  );
};
