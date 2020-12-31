import { clamp } from '~/base/utils';
import {
  appState,
  createDefaultKeyboardDesign,
  IEditMode,
  IEditorTarget,
  IModeState,
} from '~/editor/store/AppState';
import {
  IEditPropKey,
  IKeyEntity,
  IKeySizeUnit,
} from '~/editor/store/DataSchema';
import { editReader } from '~/editor/store/EditReader';
import { editUpdator } from '~/editor/store/EditUpdator';
import {
  changeKeySizeUnit,
  changePlacementCoordUnit,
  mmToUnitValue,
  unitValueToMm,
} from '~/editor/store/PlacementUnitHelper';

export const editMutations = new (class {
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
    const id = `ke-${(Math.random() * 1000) >> 0}`;
    const keySize = keySizeUnit === 'KP' ? 1 : 18;

    const keyEntity: IKeyEntity = {
      id,
      keyId: id,
      x,
      y,
      r: 0,
      shape: `std ${keySize}`,
      keyIndex: -1,
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
    const idx = editReader.currentPointIndex;
    if (idx !== -1) {
      editUpdator.commitEditor((editor) => {
        editor.design.outlinePoints.splice(idx, 1);
      });
    }
  }

  addOutlinePoint(x: number, y: number) {
    editUpdator.commitEditor((editor) => {
      editor.design.outlinePoints.push({ x, y });
      editor.currentPointIndex = editor.design.outlinePoints.length - 1;
    });
  }

  setPlacementUnit(unitSpec: string) {
    editUpdator.commitEditor((editor) => {
      changePlacementCoordUnit(editor.design, unitSpec);
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
    mode: IModeState[K]
  ) {
    editUpdator.patchEditor((state) => {
      state[fieldKey] = mode as any;
    });
  }

  setBoolOption<
    K extends 'showAxis' | 'showGrid' | 'snapToGrid' | 'showConfig'
  >(fieldKey: K, value: boolean) {
    editUpdator.patchEnvState((env) => {
      env[fieldKey] = value;
    });
  }

  setCurrentKeyEntity(keyEntityId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = keyEntityId;
    });
  }

  setCurrentPointIndex(index: number) {
    editUpdator.patchEditor((editor) => {
      editor.currentPointIndex = index;
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
    const { currentPointIndex } = editReader;
    editUpdator.patchEditor((editor) => {
      const p = editor.design.outlinePoints[currentPointIndex];
      p[propKey] = value;
    });
  }

  setOutlinePointPosition(px: number, py: number) {
    const { currentPointIndex, snapDivision, snapToGrid } = editReader;
    const gp = 10 / snapDivision;
    if (snapToGrid) {
      px = Math.round(px / gp) * gp;
      py = Math.round(py / gp) * gp;
    }

    editUpdator.patchEditor((editor) => {
      editor.design.outlinePoints[currentPointIndex] = { x: px, y: py };
    });
  }

  changeKeyProperty = <K extends IEditPropKey>(
    propKey: K,
    value: IKeyEntity[K]
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
})();
