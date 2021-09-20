import { FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { editReader } from '~/ui/editors/LayoutEditor/models';
import { applyCoordSnapping } from '~/ui/editors/LayoutEditor/models/EditorHelper';

export const CoordCursor: FC = () => {
  let {
    worldMousePos: { x: mx, y: my },
    snapToGrid,
    snapPitches,
  } = editReader;

  if (snapToGrid) {
    [mx, my] = applyCoordSnapping(mx, my, snapPitches);
  }
  const d = 5;
  const sw = 0.3;
  return (
    <g>
      <line
        x1={mx - d}
        y1={my}
        x2={mx + d}
        y2={my}
        stroke={uiTheme.colors.clLayouterAxis}
        stroke-width={sw}
      />
      <line
        x1={mx}
        y1={my - d}
        x2={mx}
        y2={my + d}
        stroke={uiTheme.colors.clLayouterAxis}
        stroke-width={sw}
      />
    </g>
  );
};
