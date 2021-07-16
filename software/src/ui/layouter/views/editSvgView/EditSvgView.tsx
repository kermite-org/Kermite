import { Hook, jsx } from 'qx';
import {
  IPosition,
  startDragSession,
  getRelativeMousePosition,
} from '~/ui/layouter/common';
import { editReader, editMutations } from '~/ui/layouter/models';
import { screenToWorld } from './CoordHelpers';
import { FieldGrid, FieldAxis } from './svgParts/FieldParts';
import {
  KeyEntityCard,
  startKeyEntityDragOperation,
} from './svgParts/KeyEntityCard';
import {
  KeyboardOutlineShapeView,
  startOutlinePointDragOperation,
} from './svgParts/KeyboardOutline';

function getViewBoxSpec() {
  const { screenW, screenH } = editReader.sight;
  return `0 0 ${screenW} ${screenH}`;
}

function getTransformSpec() {
  const { sight } = editReader;
  const sc = 1 / sight.scale;
  const cx = sight.screenW / 2 - sight.pos.x * sc;
  const cy = sight.screenH / 2 - sight.pos.y * sc;
  return `translate(${cx}, ${cy}) scale(${sc})`;
}

function startSightDragOperation(e: MouseEvent) {
  const { sight } = editReader;

  const moveCallback = (pos: IPosition, prevPos: IPosition) => {
    const deltaX = -(pos.x - prevPos.x) * sight.scale;
    const deltaY = -(pos.y - prevPos.y) * sight.scale;
    editMutations.moveSight(deltaX, deltaY);
  };

  const upCallback = () => {};

  startDragSession(e, moveCallback, upCallback);
}

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    const { editMode } = editReader;
    if (editMode === 'select') {
      editMutations.setCurrentShapeId(undefined);
      editMutations.unsetCurrentKeyEntity();
      editMutations.setCurrentPointIndex(-1);
    }
    if (editMode === 'key') {
      const [sx, sy] = getRelativeMousePosition(e);
      const [x, y] = screenToWorld(sx, sy);
      editMutations.startEdit();
      editMutations.addKeyEntity(x, y);
      startKeyEntityDragOperation(e, false, () => {
        editMutations.endEdit();
      });
    }
    if (editMode === 'shape') {
      const [sx, sy] = getRelativeMousePosition(e);
      const [x, y] = screenToWorld(sx, sy);
      editMutations.startEdit();
      editMutations.startShapeDrawing();
      editMutations.addOutlinePoint(x, y);
      startOutlinePointDragOperation(e, false, () => {
        editMutations.endEdit();
      });
    }
  }
  if (e.button === 1) {
    startSightDragOperation(e);
  }
};

const onSvgScroll = (e: WheelEvent) => {
  const { screenW, screenH } = editReader.sight;
  const dir = e.deltaY / 120;
  const [sx, sy] = getRelativeMousePosition(e);
  const px = sx - screenW / 2;
  const py = sy - screenH / 2;
  editMutations.scaleSight(dir, px, py);
};

export const EditSvgView = () => {
  const { ghost, showAxis, showGrid, sight } = editReader;
  const viewBoxSpec = getViewBoxSpec();
  const transformSpec = getTransformSpec();

  Hook.useEffect(() => {
    const el = document.getElementById('domEditSvg');
    if (el) {
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }, []);

  // const { pressedKeyIndices } = editReader;
  // layouterAppGlobal.setDebugValue({ pressedKeyIndices });

  return (
    <svg
      width={sight.screenW}
      height={sight.screenH}
      viewBox={viewBoxSpec}
      onMouseDown={onSvgMouseDown}
      onWheel={onSvgScroll}
      id="domEditSvg"
    >
      <g transform={transformSpec}>
        {showGrid && <FieldGrid />}
        {showAxis && <FieldAxis isGroupCoordAxis={false} />}
        {showAxis && <FieldAxis isGroupCoordAxis={true} />}
        {ghost && <KeyEntityCard ke={ghost} />}

        {/* <DisplayAreaFrame /> */}

        {editReader.allKeyEntities.map((ke) => (
          <KeyEntityCard ke={ke} key={ke.id} />
        ))}

        {editReader.allOutlineShapes.map((shape, idx) => (
          <KeyboardOutlineShapeView shape={shape} key={idx} />
        ))}
      </g>
    </svg>
  );
};
