import {
  getRelativeMousePosition,
  IPosition,
  startDragSession,
} from '~/base/UiInteractionHelpers';
import { editMutations, editReader } from '~/editor/store';
import { screenToWorld } from '~/editor/views/EditSvgView/CoordHelpers';
import { DisplayAreaFrame } from '~/editor/views/EditSvgView/DisplayAreaFrame';
import { FieldAxis, FieldGrid } from '~/editor/views/EditSvgView/FieldParts';
import {
  KeyEntityCard,
  startKeyEntityDragOperation,
} from '~/editor/views/EditSvgView/KeyEntityCard';
import {
  KeyboardOutline,
  startOutlinePointDragOperation,
} from '~/editor/views/EditSvgView/KeyboardOutline';
import { h, rerender } from '~/qx';

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
    rerender();
  };

  const upCallback = () => {};

  startDragSession(e, moveCallback, upCallback);
}

const onSvgMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    const { editorTarget, editMode } = editReader;
    if (editMode === 'select' || editMode === 'move') {
      editMutations.setCurrentKeyEntity(undefined);
      editMutations.setCurrentPointIndex(-1);
    }
    if (editorTarget === 'key') {
      if (editMode === 'add') {
        const [sx, sy] = getRelativeMousePosition(e);
        const [x, y] = screenToWorld(sx, sy);
        editMutations.addKeyEntity(x, y);
        startKeyEntityDragOperation(e, false);
      }
    }
    if (editorTarget === 'outline') {
      if (editMode === 'add') {
        const [sx, sy] = getRelativeMousePosition(e);
        const [x, y] = screenToWorld(sx, sy);
        editMutations.addOutlinePoint(x, y);
        startOutlinePointDragOperation(e);
      }
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

  return (
    <svg
      width={sight.screenW}
      height={sight.screenH}
      viewBox={viewBoxSpec}
      // setTimeout: テキスト編集のonBlurが呼ばれる前にonMouseDownが呼ばれ
      // モデルの内部状態がおかしくなってしまう問題を回避
      onMouseDown={(e) => setTimeout(() => onSvgMouseDown(e), 1)}
      onWheel={onSvgScroll}
      id="domEditSvg"
    >
      <g transform={transformSpec}>
        {showGrid && <FieldGrid />}
        {showAxis && <FieldAxis />}
        {ghost && <KeyEntityCard ke={ghost} />}

        <DisplayAreaFrame />

        {editReader.allKeyEntities.map((ke) => (
          <KeyEntityCard ke={ke} key={ke.id} />
        ))}

        <KeyboardOutline />
      </g>
    </svg>
  );
};
