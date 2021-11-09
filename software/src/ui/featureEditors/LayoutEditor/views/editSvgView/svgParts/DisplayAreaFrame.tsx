import { jsx, css, FC } from 'qx';
import { makeCssColor } from '~/ui/base';
import { editReader } from '~/ui/featureEditors/LayoutEditor/models';

export const DisplayAreaFrame: FC = () => {
  const { displayArea: da } = editReader;
  const x = da.left;
  const y = da.top;
  const w = da.right - da.left;
  const hh = da.bottom - da.top;

  return <rect x={x} y={y} width={w} height={hh} css={style} />;
};

const style = css`
  fill: transparent;
  stroke: ${makeCssColor(0x444444, 0.3)};
  stroke-width: 0.3;
`;
