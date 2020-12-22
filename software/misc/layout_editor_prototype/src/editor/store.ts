import { duplicateObjectByJsonStringifyParse as cloneObject } from '~/base/utils';
import { IKeyboardDesign, IKeyEntity, IEditPropKey } from '~/editor/DataSchema';

const initialDesign: IKeyboardDesign = {
  keyEntities: [
    {
      id: 'jFR1eLdvkUSY9M65cmyAIQ',
      keyId: 'key0',
      x: 0,
      y: 0,
    },
    {
      id: 'dNpoO1Uu_ECWZNCi4G8wyw',
      keyId: 'key1',
      x: 22,
      y: 0,
    },
    {
      id: 'athTNtYrwUmfDRqzyK1yrg',
      keyId: 'key2',
      x: 44,
      y: 0,
    },
  ],
};

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
  design: initialDesign,
  ghost: undefined,
  currentkeyEntityId: 'jFR1eLdvkUSY9M65cmyAIQ',
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
  getCurrentKeyEntity() {
    const { design, currentkeyEntityId } = appState.editor;
    return design.keyEntities.find((ke) => ke.id === currentkeyEntityId);
  }

  getKeyEntityById(id: string) {
    return appState.editor.design.keyEntities.find((ke) => ke.id === id);
  }
})();

export const editManager = new (class {
  private undoStack: IModification[] = [];
  private redoStack: IModification[] = [];

  private editStartState: IEditState | undefined;

  startEditSession() {
    this.editStartState = cloneObject(appState.editor);
  }

  endEditSession(edited: boolean) {
    if (this.editStartState) {
      if (edited) {
        const editEndState = cloneObject(appState.editor);
        this.undoStack.push({
          oldState: this.editStartState,
          newState: editEndState,
        });
        this.redoStack = [];
      }
      this.editStartState = undefined;
    }
  }

  commit(callback: () => void) {
    this.startEditSession();
    callback();
    this.endEditSession(true);
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
      appState.editor = cloneObject(modification.oldState);
    }
  };

  redo = () => {
    if (this.redoStack.length > 0) {
      const modificatin = this.redoStack.pop()!;
      this.undoStack.push(modificatin);
      appState.editor = cloneObject(modificatin.newState);
    }
  };
})();

export const editMutations = new (class {
  addKeyEntity(x: number, y: number) {
    const id = `ke-${(Math.random() * 1000) >> 0}`;
    const keyEntity: IKeyEntity = {
      id,
      keyId: id,
      x,
      y,
    };
    editManager.commit(() => {
      appState.editor.design.keyEntities.push(keyEntity);
      appState.editor.currentkeyEntityId = id;
    });
  }

  setCurrentKeyEntity(keyEntityId: string | undefined) {
    appState.editor.currentkeyEntityId = keyEntityId;
  }

  private modified = false;

  startEdit() {
    editManager.startEditSession();
    const ke = editReader.getCurrentKeyEntity();
    appState.editor.ghost = ke ? cloneObject(ke) : undefined;
    this.modified = false;
  }

  moveKeyDelta(deltaX: number, deltaY: number) {
    const ke = appState.editor.ghost;
    if (ke) {
      ke.x += deltaX;
      ke.y += deltaY;
      this.modified = true;
    }
  }

  changeKeyProperty<K extends IEditPropKey>(propKey: K, value: IKeyEntity[K]) {
    const ke = appState.editor.ghost;
    if (ke) {
      ke[propKey] = value;
      this.modified = true;
    }
  }

  endEdit() {
    const ghost = appState.editor.ghost;
    if (ghost) {
      const index = appState.editor.design.keyEntities.findIndex(
        (ke) => ke.id === ghost.id
      );
      appState.editor.design.keyEntities[index] = ghost;
      appState.editor.ghost = undefined;
    }
    editManager.endEditSession(this.modified);
  }
})();
