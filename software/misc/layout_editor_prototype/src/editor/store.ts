import { duplicateObjectByJsonStringifyParse as cloneObject } from '~/base/utils';
import { IKeyboardDesign } from '~/editor/DataSchema';

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

interface IEditState {
  design: IKeyboardDesign;
  currentkeyEntityId: string | undefined;
}
interface IAppState {
  editor: IEditState;
}

const initialEditState: IEditState = {
  design: initialDesign,
  currentkeyEntityId: 'jFR1eLdvkUSY9M65cmyAIQ',
};

export const appState: IAppState = {
  editor: initialEditState,
};

interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

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
