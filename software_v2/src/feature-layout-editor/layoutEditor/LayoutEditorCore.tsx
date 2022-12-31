import { jsx, useEffect } from 'alumina';
import { IPersistKeyboardLayout } from '~/app-shared';
import { windowKeyboardEventEffect } from '~/fe-shared';
import {
  IEditState,
  IEnvState,
  IModification,
  appState,
  editManager,
  editMutations,
  editReader,
} from './models';
import { LayoutEditorViewRoot } from './views';
import {
  KeyboardDesignConverter,
  keyboardOperationHandler,
  // setupDeviceKeyEventsListener,
} from './wrapper';

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

  export function loadEditDesign(persistDesign: IPersistKeyboardLayout) {
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

  export function emitSavingDesign(): IPersistKeyboardLayout {
    const savingDesign = editReader.design;
    const persistDesign =
      KeyboardDesignConverter.convertKeyboardDesignEditToPersist(savingDesign);
    return persistDesign;
  }

  export function rebase() {
    editMutations.rebase();
  }

  export function replaceKeyboardDesign(persistDesign: IPersistKeyboardLayout) {
    const design =
      KeyboardDesignConverter.convertKeyboardDesignPersistToEdit(persistDesign);
    editMutations.replaceKeyboardDesign(design);
  }

  export function getIsModified(): boolean {
    return editReader.isModified;
  }

  export function hasEditLayoutEntities(): boolean {
    return editReader.hasLayoutEntities;
  }

  export function Component() {
    useEffect(windowKeyboardEventEffect(keyboardOperationHandler), []);
    // useEffect(setupDeviceKeyEventsListener, []);
    return <LayoutEditorViewRoot />;
  }
}
