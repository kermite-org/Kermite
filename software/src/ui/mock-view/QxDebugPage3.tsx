import { FC, jsx } from 'qx';

const items = ['aaa', 'bbb', 'ccc'];

export const QxDebugPage3: FC = () => {
  console.log(`render`);
  return (
    <div>
      <div>foo</div>
      {items.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};
