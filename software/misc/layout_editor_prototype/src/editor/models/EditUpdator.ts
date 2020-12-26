import { produce } from 'immer';
import { compareObjectByJsonStringify } from '~/base/utils';
import { appState, IEditState, IEnvState } from '~/editor/models/AppState';
import { IKeyEntity } from '~/editor/models/DataSchema';
import { editManager } from '~/editor/models/EditManager';

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
