import { appState, IEditState } from './AppState';

class EditManager {
  private undoStack: IEditState[] = [];
  private redoStack: IEditState[] = [];

  reset() {
    this.undoStack = [];
    this.redoStack = [];
  }

  pushUndoStack(oldState: IEditState) {
    this.undoStack.push(oldState);
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
      this.redoStack.push(appState.editor);
      appState.editor = this.undoStack.pop()!;
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(appState.editor);
      appState.editor = this.redoStack.pop()!;
    }
  }
}
export const editManager = new EditManager();
