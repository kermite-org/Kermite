import { css, FC, jsx } from 'qx';

const Foo: FC = () => {
  const styleFoo = css`
    > .hoge {
      border: solid 1px red;
    }

    > .--active {
      font-weight: bold;
    }
  `;

  const active = true;

  return (
    <div css={styleFoo}>
      <div classNames={['hoge', active && '--active']}>hello</div>
    </div>
  );
};

export const QxDebugPage5: FC = () => {
  console.log(`render`);
  return (
    <div>
      <Foo />
    </div>
  );
};
