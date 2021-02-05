import { css, setup, styled } from 'goober';
import { h, FC } from 'qx';

setup(h);

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

const Header2 = styled('div')`
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
  color: red;
`;

const MyButton = (props: { text: string; className?: string }) => {
  return <button className={props.className}>{props.text}</button>;
};

const StyledMyButton = styled(MyButton)`
  border: solid 2px green;
  background: #cfc;
  padding: 10px;
  border-radius: 5px;
`;

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

export const GooberDevelopmentPage = () => {
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
      <Header2>world</Header2>
      <StyledMyButton text="test" />
      <MultipleClassNameTestCard1 />
      <UserNameView userName="yamada" />
    </div>
  );
};
