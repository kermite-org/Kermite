import { FC, jsx, useRef, useState } from 'qx';

const Foo: FC = () => {
  const [message] = useState('Hello');

  const ref = useRef();
  console.log({ ...ref });

  return <div ref={ref}>{message}</div>;
};

export const QxDebugPage4: FC = () => {
  console.log(`render`);
  return (
    <div onClick={() => {}}>
      <Foo />
    </div>
  );
};
