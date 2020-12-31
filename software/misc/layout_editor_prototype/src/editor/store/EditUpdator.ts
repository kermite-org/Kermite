import { produce } from 'immer';
import { compareObjectByJsonStringify } from '~/base/utils';
import { appState, IEditState, IEnvState } from '~/editor/store/AppState';
import { IKeyEntity } from '~/editor/store/DataSchema';
import { editManager } from '~/editor/store/EditManager';

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

  private originalKeyEditState: IEditState | undefined;

  startKeyEditSession(useGhost: boolean) {
    this.originalKeyEditState = appState.editor;
    if (useGhost) {
      this.patchEnvState((env) => {
        const ke = this.getEditKeyEntity(appState.editor);
        env.ghost = (ke && { ...ke }) || undefined;
      });
    }
  }

  endKeyEditSession() {
    if (this.originalKeyEditState) {
      const ke0 = this.getEditKeyEntity(this.originalKeyEditState);
      const ke1 = this.getEditKeyEntity(appState.editor);
      const modified = ke0 !== ke1 && !compareObjectByJsonStringify(ke0, ke1);

      if (modified) {
        editManager.pushUndoStack(this.originalKeyEditState, appState.editor);
      }

      this.originalKeyEditState = undefined;
      this.patchEnvState((env) => {
        env.ghost = undefined;
      });
    }
  }
})();
