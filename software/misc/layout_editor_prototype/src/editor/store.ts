import { produce } from 'immer';
import {
  compareObjectByJsonStringify,
  createDictionaryFromKeyValues,
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
export type IEditMode = 'add' | 'move' | 'split';

export interface IEditState {
  design: IKeyboardDesign;
  ghost: IKeyEntity | undefined;
  currentkeyEntityId: string | undefined;
  editorTarget: IEditorTarget;
  editMode: IEditMode;
}
interface IAppState {
  editor: IEditState;
}

const initialEditState: IEditState = {
  design: loadKeyboardDesign(initialDesign),
  ghost: undefined,
  currentkeyEntityId: undefined,
  editorTarget: 'key',
  editMode: 'move',
};

export const appState: IAppState = {
  editor: initialEditState,
};

interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

export const editReader = new (class {
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
  patchEditor(callback: (draft: IEditState) => void) {
    appState.editor = produce(appState.editor, (draft) => {
      callback(draft);
    });
  }

  patchEditKey(callback: (ke: IKeyEntity) => void) {
    this.patchEditor((draft) => {
      if (draft.currentkeyEntityId) {
        const currentKeyEntity =
          draft.design.keyEntities[draft.currentkeyEntityId];
        callback(currentKeyEntity);
      }
    });
  }

  commitEditor(callback: (draft: IEditState) => void) {
    const prevState = appState.editor;
    this.patchEditor(callback);
    editManager.pushUndoStack(prevState, appState.editor);
  }

  private editStartState: IEditState | undefined;

  startEditSession() {
    this.editStartState = appState.editor;
    this.patchEditor((editor) => {
      editor.ghost = editor.design.keyEntities[editor.currentkeyEntityId || ''];
    });
  }

  private getEditKeyEntity(editState: IEditState) {
    if (editState.currentkeyEntityId) {
      return editState.design.keyEntities[editState.currentkeyEntityId];
    }
    return undefined;
  }

  endEditSession() {
    if (this.editStartState) {
      this.patchEditor((editor) => {
        editor.ghost = undefined;
      });

      const ke0 = this.getEditKeyEntity(this.editStartState);
      const ke1 = this.getEditKeyEntity(appState.editor);
      const modified = ke0 !== ke1 && !compareObjectByJsonStringify(ke0, ke1);

      if (modified) {
        editManager.pushUndoStack(this.editStartState, appState.editor);
      }

      this.editStartState = undefined;
    }
  }
})();

export const editMutations = new (class {
  startEdit() {
    editUpdator.startEditSession();
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

  setMode<K extends 'editorTarget' | 'editMode'>(key: K, mode: IEditState[K]) {
    editUpdator.patchEditor((editor) => {
      editor[key] = mode;
    });
  }

  setCurrentKeyEntity(keyEntityId: string | undefined) {
    editUpdator.patchEditor((editor) => {
      editor.currentkeyEntityId = keyEntityId;
    });
  }

  moveKeyDelta(deltaX: number, deltaY: number) {
    editUpdator.patchEditKey((ke) => {
      ke.x += deltaX;
      ke.y += deltaY;
    });
  }

  changeKeyProperty<K extends IEditPropKey>(propKey: K, value: IKeyEntity[K]) {
    editUpdator.patchEditKey((ke) => {
      ke[propKey] = value;
    });
  }
})();
