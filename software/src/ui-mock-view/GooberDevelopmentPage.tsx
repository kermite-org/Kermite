import { css, setup, styled } from 'goober';
import { h } from 'qx';

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

export const GooberDevelopmentPage = () => {
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
      <Header2>world</Header2>
      <StyledMyButton text="test" />
    </div>
  );
};
