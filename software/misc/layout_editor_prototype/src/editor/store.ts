import { produce } from 'immer';
import {
  clamp,
  compareObjectByJsonStringify,
  createDictionaryFromKeyValues,
  getDist,
} from '~/base/utils';
import {
  IEditPropKey,
  IKeyboardDesign,
  IKeyEntity,
  IPersistentKeyboardDesign,
} from '~/editor/DataSchema';

const initialDesign: IPersistentKeyboardDesign = {
  keyEntities: [
    {
      keyId: 'key0',
      x: 0,
      y: 0,
    },
    {
      keyId: 'key1',
      x: 22,
      y: 0,
    },
    {
      keyId: 'key2',
      x: 44,
      y: 0,
    },
  ],
};

function loadKeyboardDesign(
  source: IPersistentKeyboardDesign
): IKeyboardDesign {
  let cnt = 0;
  return {
    keyEntities: createDictionaryFromKeyValues(
      source.keyEntities.map((ke) => {
        const id = `ke-${cnt++}`;
        return [id, { ...ke, id }];
      })
    ),
  };
}

export type IEditorTarget = 'key' | 'outline' | 'viewbox';
export type IEditMode = 'select' | 'add' | 'move' | 'split';

export interface IModeState {
  editMode: IEditMode;
  editorTarget: IEditorTarget;
}
export interface IEditState {
  design: IKeyboardDesign;
  currentkeyEntityId: string | undefined;
  editMode: IEditMode;
  editorTarget: IEditorTarget;
}

export interface ISight {
  pos: {
    x: number;
    y: number;
  };
  scale: number;
}
export interface IEnvState {
  ghost: IKeyEntity | undefined;
  sight: ISight;
  showAxis: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
}
interface IAppState {
  editor: IEditState;
  env: IEnvState;
}

export const appState: IAppState = {
  editor: {
    design: loadKeyboardDesign(initialDesign),
    currentkeyEntityId: undefined,
    editMode: 'move',
    editorTarget: 'key',
  },
  env: {
    ghost: undefined,
    sight: {
      pos: {
        x: 0,
        y: 0,
      },
      scale: 0.5,
    },
    showAxis: true,
    showGrid: true,
    snapToGrid: false,
  },
};
interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

export const editReader = new (class {
  get editMode() {
    return appState.editor.editMode;
  }

  get ghost() {
    return appState.env.ghost;
  }

  get sight() {
    return appState.env.sight;
  }

  getMode<K extends 'editorTarget' | 'editMode'>(fieldKey: K): IModeState[K] {
    return appState.editor[fieldKey];
  }

  getBoolOption<K extends 'showAxis' | 'showGrid' | 'snapToGrid'>(fieldKey: K) {
    return appState.env[fieldKey];
  }

  get showAxis() {
    return appState.env.showAxis;
  }

  get showGrid() {
    return appState.env.showGrid;
  }

  get snapToGrid() {
    return appState.env.snapToGrid;
  }

  get currentKeyEntity(): IKeyEntity | undefined {
    const { design, currentkeyEntityId } = appState.editor;
    return design.keyEntities[currentkeyEntityId || ''];
  }

  getKeyEntityById(id: string): IKeyEntity | undefined {
    return appState.editor.design.keyEntities[id];
  }

  get allKeyEntities(): IKeyEntity[] {
    return Object.values(appState.editor.design.keyEntities);
  }
})();

export const editManager = new (class {
  private undoStack: IModification[] = [];
  private redoStack: IModification[] = [];

  pushUndoStack(oldState: IEditState, newState: IEditState) {
    this.undoStack.push({
      oldState,
      newState,
    });
    this.redoStack = [];
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  undo = () => {
    if (this.undoStack.length > 0) {
      const modification = this.undoStack.pop()!;
      this.redoStack.push(modification);
      appState.editor = modification.oldState;
    }
  };

  redo = () => {
    if (this.redoStack.length > 0) {
      const modification = this.redoStack.pop()!;
      this.undoStack.push(modification);
      appState.editor = modification.newState;
    }
  };
})();

export const editUpdator = new (class {
  patchEnvState(callback: (state: IEnvState) => void) {
    appState.env = produce(appState.env, (draft) => {
      callback(draft);
    });
  }

  patchEditor(callback: (draft: IEditState) => void) {
    appState.editor = produce(appState.editor, (draft) => {
      callback(draft);
    });
  }

  patchEditKeyEntity(callback: (ke: IKeyEntity) => void) {
    this.patchEditor((draft) => {
      if (draft.currentkeyEntityId) {
        const editKeyEntity =
          draft.design.keyEntities[draft.currentkeyEntityId];
        callback(editKeyEntity);
      }
    });
  }

  commitEditor(callback: (draft: IEditState) => void) {
    const prevState = appState.editor;
    this.patchEditor(callback);
    editManager.pushUndoStack(prevState, appState.editor);
  }

  private getEditKeyEntity(editState: IEditState) {
    if (editState.currentkeyEntityId) {
      return editState.design.keyEntities[editState.currentkeyEntityId];
    }
    return undefined;
  }

  private originalEditState: IEditState | undefined;

  startEditSession(useGhost: boolean) {
    this.originalEditState = appState.editor;
    if (useGhost) {
      this.patchEnvState((env) => {
        env.ghost = this.getEditKeyEntity(appState.editor);
      });
    }
  }

  endEditSession() {
    if (this.originalEditState) {
      const ke0 = this.getEditKeyEntity(this.originalEditState);
      const ke1 = this.getEditKeyEntity(appState.editor);
      const modified = ke0 !== ke1 && !compareObjectByJsonStringify(ke0, ke1);

      if (modified) {
        editManager.pushUndoStack(this.originalEditState, appState.editor);
      }

      this.originalEditState = undefined;
      this.patchEnvState((env) => {
        env.ghost = undefined;
      });
    }
  }
})();

export const editMutations = new (class {
  startEdit(useGhost: boolean = true) {
    editUpdator.startEditSession(useGhost);
  }

  endEdit() {
    editUpdator.endEditSession();
  }

  addKeyEntity(x: number, y: number) {
    const id = `ke-${(Math.random() * 1000) >> 0}`;
    const keyEntity: IKeyEntity = {
      id,
      keyId: id,
      x,
      y,
    };
    editUpdator.commitEditor((editor) => {
      editor.design.keyEntities[id] = keyEntity;
      editor.currentkeyEntityId = id;
    });
  }

  setMode<K extends 'editorTarget' | 'editMode'>(
    fieldKey: K,
    mode: IModeState[K]
  ) {
    editUpdator.patchEditor((state) => {
      (state as any)[fieldKey] = mode;
    });
  }

  setBoolOption<K extends 'showAxis' | 'showGrid' | 'snapToGrid'>(
    fieldKey: K,
    value: boolean
  ) {
    editUpdator.patchEnvState((env) => {
      env[fieldKey] = value;
    });
  }

  setCurrentKeyEntity(keyEntityId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = keyEntityId;
    });
  }

  moveKeyDelta(deltaX: number, deltaY: number) {
    editUpdator.patchEditKeyEntity((ke) => {
      ke.x += deltaX;
      ke.y += deltaY;
    });
  }

  setKeyPosition(px: number, py: number) {
    editUpdator.patchEditKeyEntity((ke) => {
      if (editReader.snapToGrid) {
        const gridPitch = 10;
        const snapDist = 1;
        const snappedX = Math.round(px / gridPitch) * gridPitch;
        const snappedY = Math.round(py / gridPitch) * gridPitch;
        if (getDist(ke.x, ke.y, snappedX, snappedY) < snapDist) {
          ke.x = snappedX;
          ke.y = snappedY;
        } else {
          ke.x = px;
          ke.y = py;
        }
      } else {
        ke.x = px;
        ke.y = py;
      }
    });
  }

  changeKeyProperty<K extends IEditPropKey>(propKey: K, value: IKeyEntity[K]) {
    editUpdator.patchEditKeyEntity((ke) => {
      ke[propKey] = value;
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
})();
