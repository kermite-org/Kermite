import { duplicateObjectByJsonStringifyParse } from '~/base/utils';
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
  undoStack: IEditState[];
  redoStack: IEditState[];
}

const initialEditState: IEditState = {
  design: initialDesign,
  currentkeyEntityId: 'jFR1eLdvkUSY9M65cmyAIQ',
};

export const appState: IAppState = {
  editor: initialEditState,
  undoStack: [],
  redoStack: [],
};

export const editManager = new (class {
  private getCurrentStateCloned() {
    return duplicateObjectByJsonStringifyParse(appState.editor);
  }

  pushEditHistory() {
    const copied = this.getCurrentStateCloned();
    appState.undoStack.push(copied);
    appState.redoStack = [];
  }

  private editSnapshot: IEditState | undefined;

  preserveEditSnapshot() {
    this.editSnapshot = this.getCurrentStateCloned();
  }

  commitEditSnapshot() {
    if (this.editSnapshot) {
      appState.undoStack.push(this.editSnapshot);
      appState.redoStack = [];
      this.editSnapshot = undefined;
    }
  }

  get canUndo() {
    return appState.undoStack.length > 0;
  }

  get canRedo() {
    return appState.redoStack.length > 0;
  }

  undo = () => {
    if (appState.undoStack.length > 0) {
      const copied = this.getCurrentStateCloned();
      appState.redoStack.push(copied);
      appState.editor = appState.undoStack.pop()!;
    }
  };

  redo = () => {
    if (appState.redoStack.length > 0) {
      const copied = this.getCurrentStateCloned();
      appState.undoStack.push(copied);
      appState.editor = appState.redoStack.pop()!;
    }
  };
})();
