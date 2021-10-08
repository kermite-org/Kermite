import { css, FC, jsx, QxChildren } from 'qx';

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

const Bar: FC<{ children?: QxChildren }> = ({ children }) => {
  return <div css={baseBarStyle}>{children}</div>;
};

const baseBarStyle = css`
  color: green;
`;

export const QxDebugPage5: FC = () => {
  console.log(`render`);
  return (
    <div>
      <Foo />
      <Bar>bar1</Bar>
      <Bar css={customBarStyle}>
        <div>bar2</div>
        <h3>hoge</h3>
      </Bar>
    </div>
  );
};

const customBarStyle = css`
  font-size: 24px;
  > h3 {
    color: red;
  }
`;
