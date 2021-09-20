import { jsx, useEffect } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { editMutations, editReader } from '~/ui/editors/LayoutEditor/models';
import { LayoutEditorViewRoot } from '~/ui/editors/LayoutEditor/views/LayoutEditorViewRoot';
import {
  KeyboardDesignConverter,
  keyboardOperationHandler,
  setupDeviceKeyEventsListener,
} from '~/ui/editors/LayoutEditor/wrapper';
import { windowKeyboardEventEffect } from '~/ui/utils';

export namespace LayoutEditorCore {
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
