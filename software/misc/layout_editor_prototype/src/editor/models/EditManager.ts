import { appState, IEditState } from '~/editor/models/AppState';

interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

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
