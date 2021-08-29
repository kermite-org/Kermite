import { jsx, useEffect } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { editMutations, editReader } from '~/ui/features/LayoutEditor/models';
import { LayoutEditorViewRoot } from '~/ui/features/LayoutEditor/views/LayoutEditorViewRoot';
import {
  KeyboardDesignConverter,
  keyboardOperationHander,
  setupDeviceKeyEventsListener,
} from '~/ui/features/LayoutEditor/wrapper';
import { windowKeyboardEventEffect } from '~/ui/helpers';

export namespace UiLayouterCore {
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
    useEffect(windowKeyboardEventEffect(keyboardOperationHander), []);
    useEffect(setupDeviceKeyEventsListener, []);
    return <LayoutEditorViewRoot />;
  }
}
