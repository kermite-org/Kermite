import { jsx, useEffect } from 'alumina';
import {
  getRelativeMousePosition,
  IPosition,
  layouterAppFeatures,
  startDragSession,
} from '~/ui/featureEditors/layoutEditor/common';
import {
  editMutations,
  editReader,
} from '~/ui/featureEditors/layoutEditor/models';
import { CoordCursor } from '~/ui/featureEditors/layoutEditor/views/editSvgView/svgParts/CoordCursor';
import { ExtraShapeView } from '~/ui/featureEditors/layoutEditor/views/editSvgView/svgParts/ExtraShapeView';
import { FieldGrid } from '~/ui/featureEditors/layoutEditor/views/editSvgView/svgParts/FieldGrid';
import {
  screenCoordToGroupTransformationCoord,
  screenToWorld,
} from './coordHelpers';
import { FieldAxis } from './svgParts/FieldAxis';
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

function getSightTransformSpec() {
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
    const { editMode, currentTransGroup } = editReader;
    if (editMode === 'select') {
      editMutations.setCurrentShapeId(undefined);
      editMutations.unsetCurrentKeyEntity();
      editMutations.setCurrentPointIndex(-1);
    }
    if (editMode === 'key') {
      const [sx, sy] = getRelativeMousePosition(e);
      const [gx, gy] = screenCoordToGroupTransformationCoord(
        sx,
        sy,
        currentTransGroup,
      );
      editMutations.startEdit();
      editMutations.addKeyEntity(gx, gy);
      startKeyEntityDragOperation(e, false, () => {
        editMutations.endEdit();
      });
    }
    if (editMode === 'shape') {
      const [sx, sy] = getRelativeMousePosition(e);
      const [gx, gy] = screenCoordToGroupTransformationCoord(
        sx,
        sy,
        currentTransGroup,
      );
      if (!editReader.drawingShape) {
        editMutations.startShapeDrawing();
      }
      editMutations.addOutlinePoint(gx, gy);
      startOutlinePointDragOperation(e, false, () => {});
    }
  }
  if (e.button === 1) {
    startSightDragOperation(e);
  }
};

const onSvgMouseMove = (e: MouseEvent) => {
  const [sx, sy] = getRelativeMousePosition(e);
  const [wx, wy] = screenToWorld(sx, sy);
  editMutations.setWorldMousePos(wx, wy);
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
  const {
    ghost,
    showAxis,
    showGrid,
    sight,
    drawingShape,
    extraShape,
    extraShapePathValidationResult,
  } = editReader;
  const viewBoxSpec = getViewBoxSpec();
  const sightTransformSpec = getSightTransformSpec();

  useEffect(() => {
    const el = document.getElementById('domEditSvg');
    if (el) {
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }, []);

  useEffect(() => {
    return () => {
      if (editReader.drawingShape) {
        editMutations.cancelShapeDrawing();
      }
    };
  }, []);

  return (
    <svg
      width={sight.screenW}
      height={sight.screenH}
      viewBox={viewBoxSpec}
      onPointerDown={onSvgMouseDown}
      onPointerMove={
        (layouterAppFeatures.showCoordCrosshair && onSvgMouseMove) || undefined
      }
      onWheel={onSvgScroll}
      id="domEditSvg"
    >
      <g transform={sightTransformSpec}>
        {showGrid && <FieldGrid />}
        {showAxis && <FieldAxis />}
        {ghost && <KeyEntityCard ke={ghost} />}
        {/* <DisplayAreaFrame /> */}
        <g>
          {editReader.allKeyEntities.map((ke) => (
            <KeyEntityCard ke={ke} key={ke.id} />
          ))}
        </g>
        <g>
          {editReader.allOutlineShapes.map((shape, idx) => (
            <KeyboardOutlineShapeView shape={shape} key={idx} />
          ))}
        </g>
        {drawingShape && <KeyboardOutlineShapeView shape={drawingShape} />}
        {extraShape && <ExtraShapeView shape={extraShape} />}
        {layouterAppFeatures.showCoordCrosshair && <CoordCursor />}
      </g>
    </svg>
  );
};
