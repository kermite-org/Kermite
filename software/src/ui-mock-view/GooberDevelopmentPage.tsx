import { h } from 'qx';
import { css, setup } from '~/goober_ex';

setup(h);

const cssRoot = css`
  border: solid 4px orange;
  color: green;
  padding: 10px;
`;

export const GooberDevelopmentPage = () => {
  return <div css={cssRoot}>hello</div>;
};
