import { css, FC, jsx } from 'qx';

const d = 4;

export const CoordOriginMark: FC = () => (
  <g class={style}>
    <line x1={-d} y1={0} x2={d} y2={0} />
    <line x1={0} y1={-d} x2={0} y2={d} />
  </g>
);

const style = css`
  > line {
    stroke: #f08;
    stroke-width: 2px;
  }
`;
