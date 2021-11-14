import { css, FC, jsx, AluminaChildren } from 'alumina';

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

const Bar: FC<{ children?: AluminaChildren }> = ({ children }) => {
  return <div class={baseBarStyle}>{children}</div>;
};

const Buzz: FC<{ text: string }> = ({ text }) => <div>{text}</div>;

const baseBarStyle = css`
  color: green;
`;

export const QxDebugPage5: FC = () => {
  console.log(`render`);
  return (
    <div>
      <Foo />
      <Bar>bar1</Bar>
      <Bar class={customBarStyle}>
        <div>bar2</div>
        <h3>hoge</h3>
        <Buzz text="buzz" class="buzz" />
      </Bar>
    </div>
  );
};

const customBarStyle = css`
  font-size: 24px;
  > h3 {
    border: solid 1px blue;
  }

  > .buzz {
    color: blue;
  }
`;
