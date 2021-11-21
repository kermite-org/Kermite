import { jsx, FC, AluminaChildren, css, styled } from 'alumina';

const cssRoot = css`
  border: solid 4px orange;
  color: green;
  padding: 10px;

  > * + * {
    margin-top: 5px;
  }
`;

const boxW = 100;
const boxH = 50;

const cssHeader = css`
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
`;

const Header2 = styled.div`
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
  color: red;
`;

// // TODO: styledで関数コンポーネントをサポート
// const MyButton = (props: { text: string; className?: string }) => {
//   return <button className={props.className}>{props.text}</button>;
// };
// const StyledMyButton = styled.MyButton`
//   border: solid 2px green;
//   background: #cfc;
//   padding: 10px;
//   border-radius: 5px;
// `;

const MultipleClassNameTestCard1 = () => {
  const cssBase = css`
    width: 200px;

    > * + * {
      margin-top: 5px;
    }

    > .foo {
      color: red;
    }

    > .bar {
      border: solid 1px blue;
    }

    > .buzz {
      background: yellow;
    }
  `;
  return (
    <div css={cssBase}>
      <div classNames={['foo', 'bar', 'buzz']}>test</div>
      <div classNames={{ foo: true, bar: true, buzz: false }}>test</div>
    </div>
  );
};

interface IUserNameViewProps {
  userName: string;
}

const UserNameView: FC<IUserNameViewProps> = ({ userName }) => {
  return <div>hello {userName}</div>;
};

const Frame0: FC<{ children?: AluminaChildren }> = ({ children }) => {
  // console.log({ children });
  return <div style={{ border: 'solid 1px purple' }}>{children}</div>;
};

const Frame = styled.div`
  border: solid 1px #f08;
`;

const GooberStyledDev = () => (
  <div>
    <Frame0>
      <div>foo0</div>
      <div>bar0</div>
    </Frame0>
    <Frame>
      <div>foo</div>
      <div>bar</div>
    </Frame>
  </div>
);

export const GooberDevelopmentPage2 = () => {
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
      <Header2>world</Header2>
      {/* <StyledMyButton text="test" /> */}
      <MultipleClassNameTestCard1 />
      <GooberStyledDev />
      <UserNameView userName="yamada" />
    </div>
  );
};
