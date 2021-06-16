import { produce } from 'immer';
import { compareObjectByJsonStringify } from '~/shared';
import { appState, IEditState, IEnvState } from './AppState';
import { IEditKeyEntity } from './DataSchema';
import { editManager } from './EditManager';

class EditUpdator {
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
      if (draft.currentkeyEntityId) {
        const editKeyEntity =
          draft.design.keyEntities[draft.currentkeyEntityId];
        callback(editKeyEntity);
      }
    });
  }

  commitEditor(callback: (draft: IEditState) => void) {
    editManager.pushUndoStack(appState.editor);
    this.patchEditor(callback);
  }

  private originalEditState: IEditState | undefined;

  startEditSession() {
    this.originalEditState = appState.editor;
  }

  endEditSession() {
    if (this.originalEditState) {
      const design0 = this.originalEditState.design;
      const design1 = appState.editor.design;
      const modified = !compareObjectByJsonStringify(design0, design1);
      if (modified) {
        editManager.pushUndoStack(this.originalEditState);
      }
      this.originalEditState = undefined;
    }
  }
}

export const editUpdator = new EditUpdator();
