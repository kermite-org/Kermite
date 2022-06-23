import { appState, IEditState } from './AppState';

export interface IModification {
  oldState: IEditState;
  newState: IEditState;
}

class EditManager {
  undoStack: IModification[] = [];
  redoStack: IModification[] = [];

  reset() {
    this.undoStack = [];
    this.redoStack = [];
  }

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

  undo() {
    if (this.undoStack.length > 0) {
      const modification = this.undoStack.pop()!;
      this.redoStack.push(modification);
      appState.editor = modification.oldState;
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const modification = this.redoStack.pop()!;
      this.undoStack.push(modification);
      appState.editor = modification.newState;
    }
  }
}
export const editManager = new EditManager();
