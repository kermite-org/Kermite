import {
  clamp,
  IKeyIdMode,
  IKeyPlacementAnchor,
  removeArrayItems,
} from '~/shared';
import { getNextEntityInstanceId } from '~/ui/layouter/models/DomainRelatedHelpers';
import { editManager } from '~/ui/layouter/models/EditManager';
import {
  changeKeySizeUnit,
  changePlacementCoordUnit,
  mmToUnitValue,
  unitValueToMm,
} from '~/ui/layouter/models/PlacementUnitHelperEx';
import {
  appState,
  createFallbackEditKeyboardDesign,
  IEditMode,
  IEditorTarget,
  IEnvBoolPropKey,
  IModeState,
} from './AppState';
import {
  IEditKeyboardDesign,
  IEditKeyEntity,
  IEditPropKey,
} from './DataSchema';
import { editReader } from './EditReader';
import { editUpdator } from './EditUpdator';

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
    const { coordUnit, sizeUnit, allKeyEntities, placementAnchor } = editReader;
    const keySize = sizeUnit.mode === 'KP' ? 1 : 18;
    if (placementAnchor === 'topLeft') {
      if (sizeUnit.mode === 'KP') {
        px -= sizeUnit.x / 2;
        py -= sizeUnit.y / 2;
      } else {
        px -= keySize / 2;
        py -= keySize / 2;
      }
    }
    const [kx, ky] = mmToUnitValue(px, py, coordUnit);
    const id = getNextEntityInstanceId('key', allKeyEntities);
    const editKeyId = `ke${(Math.random() * 1000) >> 0}`;
    const keyEntity: IEditKeyEntity = {
      id,
      editKeyId,
      mirrorEditKeyId: editKeyId + 'm',
      x: kx,
      y: ky,
      angle: 0,
      shape: `std ${keySize}`,
      keyIndex: -1,
      mirrorKeyIndex: -1,
      groupId: '',
    };
    editUpdator.patchEditor((editor) => {
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
    if (!shapeId) {
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
      editor.design.setup.placementAnchor = anchor;
    });
  }

  setKeyIdMode(mode: IKeyIdMode) {
    editUpdator.commitEditor((editor) => {
      editor.design.setup.keyIdMode = mode;
    });
  }

  setKeySizeUnit(unitSpec: string) {
    editUpdator.commitEditor((editor) => {
      changeKeySizeUnit(editor.design, unitSpec);
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

  setCurrentKeyEntity(keyEntityId: string, isMirror: boolean) {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = keyEntityId;
      editor.isCurrentKeyMirror = isMirror;
    });
    const ke = editReader.currentKeyEntity;
    this.setCurrentTransGroupById(ke?.groupId);
  }

  unsetCurrentKeyEntity() {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = undefined;
      editor.isCurrentKeyMirror = false;
    });
  }

  setCurrentShapeId(shapeId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentShapeId = shapeId;
    });
    const shape = editReader.currentOutlineShape;
    this.setCurrentTransGroupById(shape?.groupId);
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

  setTransGroupMirror(mirror: boolean) {
    const { currentTransGroupId } = editReader;
    if (!currentTransGroupId) {
      return;
    }
    editUpdator.commitEditor((editor) => {
      const group = editor.design.transGroups[currentTransGroupId];
      group.mirror = mirror;
    });
  }

  addTransGroup() {
    const numGroups = editReader.allTransGroups.length;
    const newGroupId = numGroups.toString();

    editUpdator.commitEditor((editor) => {
      editor.design.transGroups[newGroupId] = {
        id: newGroupId,
        x: 0,
        y: 0,
        angle: 0,
        mirror: false,
      };
      editor.currentTransGroupId = newGroupId;
    });
  }

  deleteLastTransGroup() {
    const numGroups = editReader.allTransGroups.length;
    if (numGroups === 1) {
      return;
    }
    const deletingGroupId = (numGroups - 1).toString();
    editUpdator.commitEditor((editor) => {
      delete editor.design.transGroups[deletingGroupId];
      editor.currentTransGroupId = undefined;
    });
  }

  changeKeyProperty = <K extends IEditPropKey>(
    propKey: K,
    value: IEditKeyEntity[K],
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
      const design = createFallbackEditKeyboardDesign();
      editor.loadedDesign = design;
      editor.design = design;
    });
  }

  loadKeyboardDesign(design: IEditKeyboardDesign) {
    editUpdator.patchEditor((editor) => {
      editor.loadedDesign = design;
      editor.design = design;
    });
    this.resetSitePosition();
    editManager.reset();
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
      const newId = getNextEntityInstanceId(
        'shape',
        editReader.allOutlineShapes,
      );

      editUpdator.patchEditor((editor) => {
        editor.design.outlineShapes[newId] = {
          id: newId,
          points: [],
          groupId: '',
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

  setCurrentShapeGroupId(groupId: string) {
    const { currentShapeId } = editReader;
    if (!currentShapeId) {
      return;
    }
    editUpdator.commitEditor((editor) => {
      const shape = editor.design.outlineShapes[currentShapeId];
      shape.groupId = groupId;
    });
  }

  addPressedKey(keyIndex: number) {
    editUpdator.patchEnvState((env) => {
      env.pressedKeyIndices.push(keyIndex);
    });
  }

  removePressedKey(keyIndex: number) {
    editUpdator.patchEnvState((env) => {
      removeArrayItems(env.pressedKeyIndices, keyIndex);
    });
  }
}
export const editMutations = new EditMutations();
