import { jsx, css, FC } from 'alumina';
import { IDisplayOutlineShape } from '~/shared';

type Props = {
  outlineShapes: IDisplayOutlineShape[];
  fillColor: string;
  strokeColor: string;
};

export const KeyboardBodyShape: FC<Props> = ({
  fillColor,
  strokeColor,
  outlineShapes,
}) => {
  const style = css`
    fill: ${fillColor};
    stroke: ${strokeColor};
  `;
  return (
    <g>
      {outlineShapes.map((shape, idx) => (
        <polygon
          points={shape.points.map((p) => `${p.x}, ${p.y}`).join(' ')}
          key={idx}
          class={style}
        />
      ))}
    </g>
  );
};
