import { h, Hook, rerender } from 'qx';
import { css, setup } from '~/goober_ex/goober';
// import { css2 } from '~/goober_ex/css';

setup(h);

const cssRoot = css`
  label: cssRoot;
  border: solid 4px orange;
  color: green;
  padding: 10px;
`;

const boxW = 100;
const boxH = 50;

const cssHeader = css`
  label: cssHeaderBarSpecial;
  width: ${boxW}px;
  height: ${boxH}px;
  border: solid 1px blue;
`;

export const GooberDevelopmentPage = () => {
  Hook.useEffect(() => {
    setTimeout(rerender, 1000);
  }, []);

  console.log('render');
  return (
    <div css={cssRoot}>
      <div css={cssHeader}>hello</div>
    </div>
  );
};
