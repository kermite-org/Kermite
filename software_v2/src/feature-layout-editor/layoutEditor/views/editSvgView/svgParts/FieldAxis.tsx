import { FC, jsx } from 'alumina';
import { colors } from '~/fe-shared';
import { editReader } from '../../../models';
import { getWorldViewBounds } from '../coordHelpers';

export const FieldAxis: FC = () => {
  let { left, top, right, bottom } = getWorldViewBounds();
  if (editReader.showGrid && editReader.currentTransGroup) {
    const d = 5;
    left = -d;
    top = -d;
    right = d;
    bottom = d;
  }
  return (
    <g>
      <line
        x1={left}
        y1={0}
        x2={right}
        y2={0}
        stroke={colors.clLayouterAxis}
        stroke-width={0.5}
      />
      <line
        x1={0}
        y1={top}
        x2={0}
        y2={bottom}
        stroke={colors.clLayouterAxis}
        stroke-width={0.5}
      />
    </g>
  );
};
