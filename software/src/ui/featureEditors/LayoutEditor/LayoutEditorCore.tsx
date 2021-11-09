import { jsx, useEffect } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import {
  appState,
  editManager,
  editMutations,
  editReader,
  IEditState,
  IEnvState,
  IModification,
} from '~/ui/featureEditors/LayoutEditor/models';
import { LayoutEditorViewRoot } from '~/ui/featureEditors/LayoutEditor/views/LayoutEditorViewRoot';
import {
  KeyboardDesignConverter,
  keyboardOperationHandler,
  setupDeviceKeyEventsListener,
} from '~/ui/featureEditors/LayoutEditor/wrapper';
import { windowKeyboardEventEffect } from '~/ui/utils';

interface IBackingStoreData {
  editor: IEditState;
  env: IEnvState;
  undoStack: IModification[];
  redoStack: IModification[];
}

export namespace LayoutEditorCore {
  let backingStoreData: IBackingStoreData | undefined;

  export function preserveEditState() {
    backingStoreData = {
      editor: appState.editor,
      env: appState.env,
      undoStack: editManager.undoStack,
      redoStack: editManager.redoStack,
    };
  }

  export function restoreEditState() {
    if (backingStoreData) {
      appState.editor = backingStoreData.editor;
      appState.env = backingStoreData.env;
      editManager.undoStack = backingStoreData.undoStack;
      editManager.redoStack = backingStoreData.redoStack;
    }
  }

  export function loadEditDesign(persistDesign: IPersistKeyboardDesign) {
    try {
      const design =
        KeyboardDesignConverter.convertKeyboardDesignPersistToEdit(
          persistDesign,
        );
      editMutations.loadKeyboardDesign(design);
    } catch (error) {
      console.log(error);
    }
  }

  export function emitSavingDesign(): IPersistKeyboardDesign {
    const savingDesign = editReader.design;
    const persistDesign =
      KeyboardDesignConverter.convertKeyboardDesignEditToPersist(savingDesign);
    return persistDesign;
  }

  export function rebase() {
    editMutations.rebase();
  }

  export function getIsModified(): boolean {
    return editReader.isModified;
  }

  export function hasEditLayoutEntities(): boolean {
    return editReader.hasLayoutEntities;
  }

  export function Component() {
    useEffect(windowKeyboardEventEffect(keyboardOperationHandler), []);
    useEffect(setupDeviceKeyEventsListener, []);
    return <LayoutEditorViewRoot />;
  }
}
