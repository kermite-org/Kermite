import { css, setup } from 'goober';
import { h } from 'qx';

setup(h);

const cssRoot = css`
  border: solid 4px orange;
  color: green;
  padding: 10px;
`;

const boxW = 100;
const boxH = 50;

const cssHeader = css`
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
`;

export const GooberDevelopmentPage = () => {
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
    </div>
  );
};
