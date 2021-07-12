import { FC, Hook, jsx } from 'qx';

const Foo: FC = () => {
  const [message] = Hook.useState('Hello');

  const ref = Hook.useRef();
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
