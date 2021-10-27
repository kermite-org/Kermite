import { FC, jsx } from 'qx';
import { makeIntegersRange } from '~/shared';
import { colors } from '~/ui/base';
import { editReader } from '~/ui/editors/LayoutEditor/models';
import {
  getGroupOuterSvgTransformSpec,
  getSightBoundingCircle,
} from '~/ui/editors/LayoutEditor/views/editSvgView/CoordHelpers';

export const FieldGrid: FC = () => {
  const { x: gpx, y: gpy } = editReader.gridPitches;
  const { cx, cy, radius } = getSightBoundingCircle(
    editReader.currentTransGroup,
  );
  const left = cx - radius;
  const top = cy - radius;
  const right = cx + radius;
  const bottom = cy + radius;

  const nl = (left / gpx) >> 0;
  const nt = (top / gpy) >> 0;
  const nr = (right / gpx) >> 0;
  const nb = (bottom / gpy) >> 0;

  const xs = makeIntegersRange(nl, nr).map((ix) => ix * gpx);
  const ys = makeIntegersRange(nt, nb).map((iy) => iy * gpy);

  // console.log([xs, ys]);

  const groupTransformSpec = getGroupOuterSvgTransformSpec(
    editReader.currentTransGroupId,
    false,
  );

  const { showAxis } = editReader;

  return (
    <g transform={groupTransformSpec}>
      <g>
        {ys.map((y) => (
          <line
            key={y}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
            stroke={
              showAxis && y === 0
                ? colors.clLayouterAxis
                : colors.clLayouterGrid
            }
            stroke-width={0.5}
          />
        ))}
      </g>
      <g>
        {xs.map((x) => (
          <line
            key={x}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
            stroke={
              showAxis && x === 0
                ? colors.clLayouterAxis
                : colors.clLayouterGrid
            }
            stroke-width={0.5}
          />
        ))}
      </g>
    </g>
  );
};
