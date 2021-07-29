import { jsx, css } from 'qx';
import { makeCssColor } from '~/ui/base';
import { editReader } from '~/ui/pages/layouter/models';

const cssDisplayAreaFrame = css`
  fill: transparent;
  stroke: ${makeCssColor(0x444444, 0.3)};
  stroke-width: 0.3;
`;

export const DisplayAreaFrame = () => {
  const { dispalyArea: da } = editReader;
  const x = da.left;
  const y = da.top;
  const w = da.right - da.left;
  const hh = da.bottom - da.top;

  return <rect x={x} y={y} width={w} height={hh} css={cssDisplayAreaFrame} />;
};
