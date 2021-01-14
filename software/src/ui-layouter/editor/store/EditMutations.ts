import { clamp } from '@ui-layouter/base/utils';
import {
  appState,
  createDefaultKeyboardDesign,
  IEditMode,
  IEditorTarget,
  IEnvBoolPropKey,
  IModeState,
} from './AppState';
import {
  IEditPropKey,
  IKeyEntity,
  IKeyPlacementAnchor,
  IKeySizeUnit,
} from './DataSchema';
import { editReader } from './EditReader';
import { editUpdator } from './EditUpdator';
import {
  changeKeySizeUnit,
  changePlacementCoordUnit,
  mmToUnitValue,
  unitValueToMm,
} from './PlacementUnitHelper';

class EditMutations {
  startEdit = () => {
    editUpdator.startEditSession();
  };

  endEdit = () => {
    editUpdator.endEditSession();
  };

  startKeyEdit = (useGhost: boolean = true) => {
    editUpdator.startEditSession();
    if (useGhost) {
      editUpdator.patchEnvState((env) => {
        const ke = editReader.currentKeyEntity;
        env.ghost = (ke && { ...ke }) || undefined;
      });
    }
  };

  endKeyEdit = () => {
    editUpdator.endEditSession();
    if (editReader.ghost) {
      editUpdator.patchEnvState((env) => {
        env.ghost = undefined;
      });
    }
  };

  addKeyEntity(px: number, py: number) {
    const { coordUnit, keySizeUnit } = editReader;
    const [x, y] = mmToUnitValue(px, py, coordUnit);
    const id = `ke${(Math.random() * 1000) >> 0}`;
    const keySize = keySizeUnit === 'KP' ? 1 : 18;

    const keyEntity: IKeyEntity = {
      id,
      keyId: id,
      x,
      y,
      r: 0,
      shape: `std ${keySize}`,
      keyIndex: -1,
      groupId: '',
    };
    editUpdator.commitEditor((editor) => {
      editor.design.keyEntities[id] = keyEntity;
      editor.currentkeyEntityId = id;
    });
  }

  deleteCurrentKeyEntity() {
    const { currentkeyEntityId } = appState.editor;
    if (currentkeyEntityId) {
      editUpdator.commitEditor((editor) => {
        delete editor.design.keyEntities[currentkeyEntityId];
        editor.currentkeyEntityId = undefined;
      });
    }
  }

  deleteCurrentOutlinePoint() {
    const shapeId = editReader.currentShapeId;
    const idx = editReader.currentPointIndex;
    if (!shapeId || idx === -1) {
      return;
    }
    editUpdator.commitEditor((editor) => {
      const shape = editor.design.outlineShapes[shapeId];
      shape.points.splice(idx, 1);
      if (shape.points.length === 0) {
        delete editor.design.outlineShapes[shapeId];
      }
    });
  }

  splitOutlineLine(dstPointIndex: number, x: number, y: number) {
    const shapeId = editReader.currentShapeId;
    const idx = editReader.currentPointIndex;
    if (!shapeId || idx === -1) {
      return;
    }
    editUpdator.patchEditor((editor) => {
      const shape = editor.design.outlineShapes[shapeId];
      shape.points.splice(dstPointIndex, 0, { x, y });
    });
  }

  addOutlinePoint(x: number, y: number) {
    const shapeId = editReader.currentShapeId;
    if (!shapeId) {
      return;
    }
    editUpdator.commitEditor((editor) => {
      const shape = editor.design.outlineShapes[shapeId];
      shape.points.push({ x, y });
      editor.currentPointIndex = shape.points.length - 1;
    });
  }

  setPlacementUnit(unitSpec: string) {
    editUpdator.commitEditor((editor) => {
      changePlacementCoordUnit(editor.design, unitSpec);
    });
  }

  setPlacementAnchor(anchor: IKeyPlacementAnchor) {
    editUpdator.commitEditor((editor) => {
      editor.design.placementAnchor = anchor;
    });
  }

  setSizeUnit(unit: IKeySizeUnit) {
    const { coordUnit } = editReader;
    editUpdator.commitEditor((editor) => {
      changeKeySizeUnit(editor.design, unit, coordUnit);
    });
  }

  setSnapDivision(sd: number) {
    editUpdator.patchEnvState((env) => {
      env.snapDivision = sd;
    });
  }

  setEditorTarget(target: IEditorTarget) {
    editUpdator.patchEditor((editor) => (editor.editorTarget = target));
  }

  setEditMode(mode: IEditMode) {
    editUpdator.patchEditor((editor) => (editor.editMode = mode));
  }

  setMode<K extends 'editorTarget' | 'editMode'>(
    fieldKey: K,
    mode: IModeState[K],
  ) {
    editUpdator.patchEditor((state) => {
      state[fieldKey] = mode as any;
    });
  }

  setBoolOption<K extends IEnvBoolPropKey>(fieldKey: K, value: boolean) {
    editUpdator.patchEnvState((env) => {
      env[fieldKey] = value;
    });
  }

  setCurrentKeyEntity(keyEntityId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = keyEntityId;
    });
    const ke = editReader.currentKeyEntity;
    this.setCurrentTransGroupById(ke?.groupId);
  }

  setCurrentShapeId(shapeId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentShapeId = shapeId;
    });
  }

  setCurrentPointIndex(index: number) {
    editUpdator.patchEditor((editor) => {
      editor.currentPointIndex = index;
    });
  }

  setCurrentTransGroupById(id: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentTransGroupId = id;
    });
  }

  moveKeyDelta(deltaX: number, deltaY: number) {
    editUpdator.patchEditKeyEntity((ke) => {
      ke.x += deltaX;
      ke.y += deltaY;
    });
  }

  setKeyPosition(px: number, py: number) {
    const { coordUnit, snapToGrid, gridPitches, snapDivision } = editReader;
    let [gpx, gpy] = gridPitches;
    gpx /= snapDivision;
    gpy /= snapDivision;

    editUpdator.patchEditKeyEntity((ke) => {
      let [kx, ky] = unitValueToMm(ke.x, ke.y, coordUnit);
      if (snapToGrid) {
        kx = Math.round(px / gpx) * gpx;
        ky = Math.round(py / gpy) * gpy;
      } else {
        kx = px;
        ky = py;
      }
      [ke.x, ke.y] = mmToUnitValue(kx, ky, coordUnit);
    });
  }

  setOutlinePointProp(propKey: 'x' | 'y', value: number) {
    const { currentShapeId, currentPointIndex } = editReader;
    if (!currentShapeId || currentPointIndex === -1) {
      return;
    }
    editUpdator.patchEditor((editor) => {
      const point =
        editor.design.outlineShapes[currentShapeId].points[currentPointIndex];
      point[propKey] = value;
    });
  }

  setOutlinePointPosition(px: number, py: number) {
    const {
      currentShapeId,
      currentPointIndex,
      snapDivision,
      snapToGrid,
    } = editReader;

    if (!currentShapeId || currentPointIndex === -1) {
      return;
    }

    const gp = 10 / snapDivision;
    if (snapToGrid) {
      px = Math.round(px / gp) * gp;
      py = Math.round(py / gp) * gp;
    }

    editUpdator.patchEditor((editor) => {
      const shape = editor.design.outlineShapes[currentShapeId];
      shape.points[currentPointIndex] = { x: px, y: py };
    });
  }

  setTransGroupProp(propKey: 'x' | 'y' | 'angle', value: number) {
    const { currentTransGroupId } = editReader;
    if (!currentTransGroupId) {
      return;
    }
    editUpdator.patchEditor((editor) => {
      const group = editor.design.transGroups[currentTransGroupId];
      group[propKey] = value;
    });
  }

  changeKeyProperty = <K extends IEditPropKey>(
    propKey: K,
    value: IKeyEntity[K],
  ) => {
    editUpdator.patchEditKeyEntity((ke) => {
      ke[propKey] = value;
    });
  };

  setEditScreenSize(w: number, h: number) {
    editUpdator.patchEnvState((env) => {
      env.sight.screenW = w;
      env.sight.screenH = h;
    });
  }

  moveSight(deltaX: number, deltaY: number) {
    editUpdator.patchEnvState((env) => {
      env.sight.pos.x += deltaX;
      env.sight.pos.y += deltaY;
    });
  }

  scaleSight(dir: number, px: number, py: number) {
    editUpdator.patchEnvState((env) => {
      const { sight } = env;
      const sza = 1 + dir * 0.05;
      const oldScale = sight.scale;
      const newScale = clamp(sight.scale * sza, 0.1, 10);
      sight.scale = newScale;
      const scaleDiff = newScale - oldScale;
      sight.pos.x -= px * scaleDiff;
      sight.pos.y -= py * scaleDiff;
    });
  }

  resetKeyboardDesign() {
    editUpdator.patchEditor((editor) => {
      editor.design = createDefaultKeyboardDesign();
    });
  }

  resetSitePosition() {
    const bb = editReader.dispalyArea;
    const cx = (bb.left + bb.right) / 2;
    const cy = (bb.top + bb.bottom) / 2;
    editUpdator.patchEnvState((env) => {
      env.sight.pos.x = cx;
      env.sight.pos.y = cy;
    });
  }

  startShapeDrawing() {
    if (!appState.editor.shapeDrawing) {
      const allNumbers = editReader.allOutlineShapes.map((shape) =>
        parseInt(shape.id.split('!')[1]),
      );
      const newNumber = Math.max(...allNumbers) + 1;
      const newId = `shape!${newNumber}`;

      editUpdator.patchEditor((editor) => {
        editor.design.outlineShapes[newId] = {
          id: newId,
          points: [],
        };
        editor.currentShapeId = newId;
        editor.currentPointIndex = -1;
        editor.shapeDrawing = true;
      });
    }
  }

  endShapeDrawing() {
    if (appState.editor.shapeDrawing) {
      editUpdator.patchEditor((editor) => {
        editor.shapeDrawing = false;
      });
    }
  }
}
export const editMutations = new EditMutations();
