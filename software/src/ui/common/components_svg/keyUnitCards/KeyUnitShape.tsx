import { jsx, FC } from 'qx';
import { IDisplayKeyShape } from '~/shared';

type IKeyUnitShapeProps = Omit<JSX.SVGAttributes, 'shape'> & {
  shape: IDisplayKeyShape;
};
export const KeyUnitShape: FC<IKeyUnitShapeProps> = ({ shape, ...rest }) => {
  if (shape.type === 'rect') {
    const sw = shape.width;
    const sh = shape.height;
    return <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} {...rest} />;
  } else if (shape.type === 'circle') {
    return <circle cx={0} cy={0} r={shape.radius} {...rest} />;
  } else if (shape.type === 'polygon') {
    const pointsSpec = shape.points.map(({ x, y }) => `${x}, ${y}`).join(' ');
    return <polygon points={pointsSpec} {...rest} />;
  }
  return null;
};
