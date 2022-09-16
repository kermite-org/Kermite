import {
  clamp,
  IKeyIdMode,
  IKeyPlacementAnchor,
  removeArrayItems,
} from '~/shared';
import { getNextEntityInstanceId } from '~/ui/featureEditors/layoutEditor/models/domainRelatedHelpers';
import { editManager } from '~/ui/featureEditors/layoutEditor/models/editManager';
import {
  applyCoordSnapping,
  draftGetEditPoint,
} from '~/ui/featureEditors/layoutEditor/models/editorHelper';
import { IGridSpecKey } from '~/ui/featureEditors/layoutEditor/models/gridDefinitions';
import {
  changeKeySizeUnit,
  changePlacementCoordUnit,
  mmToUnitValue,
} from '~/ui/featureEditors/layoutEditor/models/placementUnitHelperEx';
import {
  appState,
  createFallbackEditKeyboardDesign,
  IEditMode,
  IEnvBoolPropKey,
} from './appState';
import {
  IEditKeyboardDesign,
  IEditKeyEntity,
  IEditPropKey,
} from './dataSchema';
import { editReader } from './editReader';
import { editUpdater } from './editUpdater';

class EditMutations {
  startEdit = () => {
    editUpdater.startEditSession();
  };

  endEdit = () => {
    editUpdater.endEditSession();
  };

  cancelEdit = () => {
    editUpdater.cancelEditSession();
  };

  startKeyEdit = (useGhost: boolean = true) => {
    editUpdater.startEditSession();
    if (useGhost) {
      editUpdater.patchEnvState((env) => {
        const ke = editReader.currentKeyEntity;
        env.ghost = (ke && { ...ke }) || undefined;
      });
    }
  };

  endKeyEdit = () => {
    editUpdater.endEditSession();
    if (editReader.ghost) {
      editUpdater.patchEnvState((env) => {
        env.ghost = undefined;
      });
    }
  };

  addKeyEntity(px: number, py: number) {
    const {
      coordUnit,
      sizeUnit,
      allKeyEntities,
      placementAnchor,
      currentTransGroupId,
      snapToGrid,
      snapPitches,
    } = editReader;

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
    if (snapToGrid) {
      [px, py] = applyCoordSnapping(px, py, snapPitches);
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
      groupId: currentTransGroupId || '',
    };
    editUpdater.patchEditor((editor) => {
      editor.design.keyEntities[id] = keyEntity;
      editor.currentKeyEntityId = id;
    });
  }

  deleteCurrentKeyEntity() {
    const { currentKeyEntityId } = appState.editor;
    if (currentKeyEntityId) {
      editUpdater.commitEditor((editor) => {
        delete editor.design.keyEntities[currentKeyEntityId];
        editor.currentKeyEntityId = undefined;
      });
    }
  }

  deleteCurrentOutlinePoint() {
    const shapeId = editReader.currentShapeId;
    const idx = editReader.currentPointIndex;
    if (!shapeId || idx === -1) {
      return;
    }
    editUpdater.commitEditor((editor) => {
      const shape = editor.design.outlineShapes[shapeId];
      shape.points.splice(idx, 1);
      if (shape.points.length <= 2) {
        delete editor.design.outlineShapes[shapeId];
      }
    });
  }

  splitOutlineLine(dstPointIndex: number, x: number, y: number) {
    const shapeId = editReader.currentShapeId;
    if (!shapeId) {
      return;
    }
    editUpdater.patchEditor((editor) => {
      const shape = editor.design.outlineShapes[shapeId];
      shape.points.splice(dstPointIndex, 0, { x, y });
    });
  }

  addOutlinePoint(x: number, y: number) {
    const { snapToGrid, snapPitches } = editReader;
    if (snapToGrid) {
      [x, y] = applyCoordSnapping(x, y, snapPitches);
    }
    editUpdater.patchEditor((editor) => {
      const shape = editor.drawingShape;
      if (shape) {
        shape.points.push({ x, y });
        editor.currentPointIndex = shape.points.length - 1;
      }
    });
  }

  setPlacementUnit(unitSpec: string) {
    editUpdater.commitEditor((editor) => {
      changePlacementCoordUnit(editor.design, unitSpec);
    });
    if (editReader.gridSpecKey.startsWith('kp')) {
      this.setGridSpecKey('mm_pitch10');
    }
  }

  setPlacementAnchor(anchor: IKeyPlacementAnchor) {
    editUpdater.commitEditor((editor) => {
      editor.design.setup.placementAnchor = anchor;
    });
  }

  setKeyIdMode(mode: IKeyIdMode) {
    editUpdater.commitEditor((editor) => {
      editor.design.setup.keyIdMode = mode;
    });
  }

  setKeySizeUnit(unitSpec: string) {
    editUpdater.commitEditor((editor) => {
      changeKeySizeUnit(editor.design, unitSpec);
    });
  }

  setGridSpecKey(gs: IGridSpecKey) {
    editUpdater.patchEnvState((env) => {
      env.gridSpecKey = gs;
    });
  }

  startShapeDrawing() {
    if (!editReader.drawingShape) {
      editMutations.startEdit();
      const newId = getNextEntityInstanceId(
        'shape',
        editReader.allOutlineShapes,
      );
      editUpdater.patchEditor((editor) => {
        editor.drawingShape = {
          id: newId,
          points: [],
          groupId: editReader.currentTransGroupId || '',
        };
        editor.currentShapeId = newId;
        editor.currentPointIndex = -1;
      });
    }
  }

  completeShapeDrawing() {
    const { drawingShape } = editReader;
    if (drawingShape && drawingShape.points.length >= 3) {
      editUpdater.patchEditor((state) => {
        state.design.outlineShapes[drawingShape.id] = drawingShape;
        state.drawingShape = undefined;
      });
      editMutations.endEdit();
    }
  }

  cancelShapeDrawing() {
    if (editReader.drawingShape) {
      editUpdater.patchEditor((editor) => {
        editor.drawingShape = undefined;
      });
      editMutations.cancelEdit();
    }
  }

  setEditMode(mode: IEditMode) {
    this.cancelShapeDrawing();
    editUpdater.patchEditor((editor) => {
      editor.editMode = mode;
    });
  }

  setMode(mode: IEditMode) {
    const currentMode = editReader.editMode;
    if (currentMode === mode) {
      return;
    }
    this.cancelShapeDrawing();

    editUpdater.patchEditor((state) => {
      state.currentKeyEntityId = undefined;
      state.isCurrentKeyMirror = false;
      state.currentShapeId = undefined;
      state.currentPointIndex = -1;
      state.editMode = mode;
    });
  }

  setBoolOption<K extends IEnvBoolPropKey>(fieldKey: K, value: boolean) {
    editUpdater.patchEnvState((env) => {
      env[fieldKey] = value;
    });
  }

  setCurrentKeyEntity(keyEntityId: string, isMirror: boolean) {
    editUpdater.patchEditor((editor) => {
      editor.currentKeyEntityId = keyEntityId;
      editor.isCurrentKeyMirror = isMirror;
    });
    const ke = editReader.currentKeyEntity;
    this.setCurrentTransGroupById(ke?.groupId);
  }

  unsetCurrentKeyEntity() {
    editUpdater.patchEditor((editor) => {
      editor.currentKeyEntityId = undefined;
      editor.isCurrentKeyMirror = false;
    });
  }

  setCurrentShapeId(shapeId: string | undefined) {
    editUpdater.patchEditor((editor) => {
      editor.currentShapeId = shapeId;
    });
    const shape = editReader.currentOutlineShape;
    this.setCurrentTransGroupById(shape?.groupId);
  }

  setCurrentPointIndex(index: number) {
    editUpdater.patchEditor((editor) => {
      editor.currentPointIndex = index;
    });
  }

  setCurrentTransGroupById(id: string | undefined) {
    editUpdater.patchEditor((editor) => {
      editor.currentTransGroupId = id || undefined;
    });
  }

  moveKeyDelta(deltaX: number, deltaY: number) {
    editUpdater.patchEditKeyEntity((ke) => {
      ke.x += deltaX;
      ke.y += deltaY;
    });
  }

  setKeyPosition(px: number, py: number) {
    const { coordUnit, snapToGrid, snapPitches } = editReader;
    editUpdater.patchEditKeyEntity((ke) => {
      if (snapToGrid) {
        const [kx, ky] = applyCoordSnapping(px, py, snapPitches);
        [ke.x, ke.y] = mmToUnitValue(kx, ky, coordUnit);
      } else {
        [ke.x, ke.y] = mmToUnitValue(px, py, coordUnit);
      }
    });
  }

  setOutlinePointProp(propKey: 'x' | 'y', value: number) {
    editUpdater.patchEditor((editor) => {
      const point = draftGetEditPoint(editor);
      if (point) {
        point[propKey] = value;
      }
    });
  }

  setOutlinePointPosition(px: number, py: number) {
    const { snapPitches, snapToGrid } = editReader;
    if (snapToGrid) {
      [px, py] = applyCoordSnapping(px, py, snapPitches);
    }
    editUpdater.patchEditor((editor) => {
      const point = draftGetEditPoint(editor);
      if (point) {
        point.x = px;
        point.y = py;
      }
    });
  }

  setTransGroupProp(propKey: 'x' | 'y' | 'angle', value: number) {
    const { currentTransGroupId } = editReader;
    if (!currentTransGroupId) {
      return;
    }
    editUpdater.patchEditor((editor) => {
      const group = editor.design.transGroups[currentTransGroupId];
      group[propKey] = value;
    });
  }

  setExtraShapePathText(path: string) {
    editUpdater.patchEditor((editor) => {
      editor.design.extraShape.path = path;
    });
  }

  setExtraShapeAttributeValue(propKey: 'x' | 'y' | 'scale', value: number) {
    editUpdater.patchEditor((editor) => {
      editor.design.extraShape[propKey] = value;
    });
  }

  setExtraShapeInvertY(value: boolean) {
    editUpdater.patchEditor((editor) => {
      editor.design.extraShape.invertY = value;
    });
  }

  setExtraShapeGroupId(groupId: string) {
    editUpdater.patchEditor((editor) => {
      editor.design.extraShape.groupId = groupId;
    });
  }

  setTransGroupMirror(mirror: boolean) {
    const { currentTransGroupId } = editReader;
    if (!currentTransGroupId) {
      return;
    }
    editUpdater.commitEditor((editor) => {
      const group = editor.design.transGroups[currentTransGroupId];
      group.mirror = mirror;
    });
  }

  addTransGroup() {
    const numGroups = editReader.allTransGroups.length;
    const newGroupId = numGroups.toString();

    editUpdater.commitEditor((editor) => {
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
    if (numGroups === 0) {
      return;
    }
    const deletingGroupId = (numGroups - 1).toString();
    editUpdater.commitEditor((editor) => {
      delete editor.design.transGroups[deletingGroupId];
      editor.currentTransGroupId = undefined;
    });
  }

  changeKeyProperty = <K extends IEditPropKey>(
    propKey: K,
    value: IEditKeyEntity[K],
    keyId?: string,
  ) => {
    if (!keyId) {
      editUpdater.patchEditKeyEntity((ke) => {
        ke[propKey] = value;
      });
    } else {
      editUpdater.patchEditor((draft) => {
        const ke = draft.design.keyEntities[keyId];
        if (ke) {
          ke[propKey] = value;
        }
      });
    }
  };

  replaceKeyIndexByDevicePhysicalKey(newKeyIndex: number) {
    const { currentKeyEntityId } = appState.editor;
    const { currentKeyEntity, isCurrentKeyMirror } = editReader;
    if (!(currentKeyEntityId && currentKeyEntity)) return;
    if (currentKeyEntity.keyIndex === newKeyIndex) return;
    editUpdater.commitEditor((editor) => {
      const allKeyEntities = Object.values(editor.design.keyEntities);
      const ke0a = allKeyEntities.find((ke) => ke.keyIndex === newKeyIndex);
      const ke0b = allKeyEntities.find(
        (ke) => ke.mirrorKeyIndex === newKeyIndex,
      );
      if (ke0a) ke0a.keyIndex = -1;
      if (ke0b) ke0b.mirrorKeyIndex = -1;
      const ke1 = editor.design.keyEntities[currentKeyEntityId];
      if (isCurrentKeyMirror) {
        ke1.mirrorKeyIndex = newKeyIndex;
      } else {
        ke1.keyIndex = newKeyIndex;
      }
    });
  }

  setEditScreenSize(w: number, h: number) {
    editUpdater.patchEnvState((env) => {
      env.sight.screenW = w;
      env.sight.screenH = h;
    });
  }

  moveSight(deltaX: number, deltaY: number) {
    editUpdater.patchEnvState((env) => {
      env.sight.pos.x += deltaX;
      env.sight.pos.y += deltaY;
    });
  }

  scaleSight(dir: number, px: number, py: number) {
    editUpdater.patchEnvState((env) => {
      const { sight } = env;
      const sza = 1 + dir * 0.05;
      const oldScale = sight.scale;
      const newScale = clamp(sight.scale * sza, 0.02, 2);
      sight.scale = newScale;
      const scaleDiff = newScale - oldScale;
      sight.pos.x -= px * scaleDiff;
      sight.pos.y -= py * scaleDiff;
    });
  }

  resetKeyboardDesign() {
    editUpdater.patchEditor((editor) => {
      const design = createFallbackEditKeyboardDesign();
      editor.loadedDesign = design;
      editor.design = design;
    });
  }

  loadKeyboardDesign(design: IEditKeyboardDesign) {
    editUpdater.patchEditor((editor) => {
      editor.loadedDesign = design;
      editor.design = design;
    });
    this.resetSitePosition();
    this.loadDefaultGridSnapSelection();
    editManager.reset();
  }

  replaceKeyboardDesign(design: IEditKeyboardDesign) {
    editUpdater.commitEditor((editor) => {
      editor.design = design;
    });
  }

  rebase() {
    editUpdater.patchEditor((editor) => {
      editor.loadedDesign = editReader.design;
    });
  }

  resetSitePosition() {
    const bb = editReader.displayArea;
    const cx = (bb.left + bb.right) / 2;
    const cy = (bb.top + bb.bottom) / 2;
    editUpdater.patchEnvState((env) => {
      env.sight.pos.x = cx;
      env.sight.pos.y = cy;
    });
  }

  loadDefaultGridSnapSelection() {
    const { isPlacementUnitKpBased } = editReader;
    const gridSpecKey = isPlacementUnitKpBased ? 'kp_div4' : 'mm_pitch10';
    this.setGridSpecKey(gridSpecKey);
  }

  setCurrentShapeGroupId(groupId: string) {
    const { currentShapeId } = editReader;
    if (!currentShapeId) {
      return;
    }
    editUpdater.commitEditor((editor) => {
      const shape = editor.design.outlineShapes[currentShapeId];
      shape.groupId = groupId;
    });
  }

  addPressedKey(keyIndex: number) {
    editUpdater.patchEnvState((env) => {
      env.pressedKeyIndices.push(keyIndex);
    });
  }

  removePressedKey(keyIndex: number) {
    editUpdater.patchEnvState((env) => {
      removeArrayItems(env.pressedKeyIndices, keyIndex);
    });
  }

  setWorldMousePos(x: number, y: number) {
    editUpdater.patchEnvState((env) => {
      const mp = env.worldMousePos;
      mp.x = x;
      mp.y = y;
    });
  }

  get canUndo() {
    return editManager.canUndo || !!editReader.drawingShape;
  }

  get canRedo() {
    return editManager.canRedo;
  }

  undo() {
    if (editReader.drawingShape) {
      this.cancelShapeDrawing();
      return;
    }
    editManager.undo();
  }

  redo() {
    editManager.redo();
  }
}
export const editMutations = new EditMutations();
