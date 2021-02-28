import { jsx, css } from 'qx';
import { IDisplayOutlineShape } from '~/shared';

export const KeyboardBodyShape = (props: {
  outlineShapes: IDisplayOutlineShape[];
  fillColor: string;
  strokeColor: string;
}) => {
  const cssBody = css`
    fill: ${props.fillColor};
    stroke: ${props.strokeColor};
  `;
  return (
    <g>
      {props.outlineShapes.map((shape, idx) => (
        <polygon
          points={shape.points.map((p) => `${p.x}, ${p.y}`).join(' ')}
          key={idx}
          css={cssBody}
        />
      ))}
    </g>
  );
};
