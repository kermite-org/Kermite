import { produce } from 'immer';
import { compareObjectByJsonStringify } from '~/shared';
import { appState, IEditState, IEnvState } from './AppState';
import { IEditKeyEntity } from './DataSchema';
import { editManager } from './EditManager';

class EditUpdater {
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

  patchEditKeyEntity(callback: (ke: IEditKeyEntity) => void) {
    this.patchEditor((draft) => {
      if (draft.currentKeyEntityId) {
        const editKeyEntity =
          draft.design.keyEntities[draft.currentKeyEntityId];
        callback(editKeyEntity);
      }
    });
  }

  commitEditor(callback: (draft: IEditState) => void) {
    const prevState = appState.editor;
    this.patchEditor(callback);
    editManager.pushUndoStack(prevState, appState.editor);
  }

  private originalEditState: IEditState | undefined;

  startEditSession() {
    this.originalEditState = appState.editor;
  }

  endEditSession() {
    if (this.originalEditState) {
      const de0 = this.originalEditState.design;
      const de1 = appState.editor.design;
      const modified = !compareObjectByJsonStringify(de0, de1);
      if (modified) {
        editManager.pushUndoStack(this.originalEditState, appState.editor);
      }
      this.originalEditState = undefined;
    }
  }

  cancelEditSession() {
    this.originalEditState = undefined;
  }
}

export const editUpdater = new EditUpdater();
