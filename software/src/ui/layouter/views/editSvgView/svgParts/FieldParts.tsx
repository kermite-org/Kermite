import { jsx } from 'qx';
import { uiTheme } from '~/ui/common';
import { editReader } from '~/ui/layouter/models';
import {
  getGroupOuterSvgTransformSpec,
  getSightBoundingCircle,
  getWorldViewBounds,
} from '~/ui/layouter/views/editSvgView/CoordHelpers';

export const FieldAxis = () => {
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
        stroke={uiTheme.colors.clLayouterAxis}
        stroke-width={0.5}
      />
      <line
        x1={0}
        y1={top}
        x2={0}
        y2={bottom}
        stroke={uiTheme.colors.clLayouterAxis}
        stroke-width={0.5}
      />
    </g>
  );
};

function makeRange(lo: number, hi: number) {
  return new Array(hi - lo + 1).fill(0).map((_, i) => lo + i);
}

export const FieldGrid = () => {
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

  const xs = makeRange(nl, nr).map((ix) => ix * gpx);
  const ys = makeRange(nt, nb).map((iy) => iy * gpy);

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
                ? uiTheme.colors.clLayouterAxis
                : uiTheme.colors.clLayouterGrid
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
                ? uiTheme.colors.clLayouterAxis
                : uiTheme.colors.clLayouterGrid
            }
            stroke-width={0.5}
          />
        ))}
      </g>
    </g>
  );
};
