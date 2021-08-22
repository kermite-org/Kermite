import { jsx, useEffect } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { windowKeyboardEventEffect } from '~/ui/helpers';
import { editMutations, editReader } from '~/ui/pages/layouter/models';
import { PageRoot } from '~/ui/pages/layouter/views/PageRoot';
import {
  KeyboardDesignConverter,
  keyboardOperationHander,
  setupDeviceKeyEventsListener,
} from '~/ui/pages/layouter/wrapper';

export namespace UiLayouterCore {
  export function loadEditDesign(persistDesign: IPersistKeyboardDesign) {
    try {
      const design = KeyboardDesignConverter.convertKeyboardDesignPersistToEdit(
        persistDesign,
      );
      editMutations.loadKeyboardDesign(design);
    } catch (error) {
      console.log(error);
    }
  }

  export function emitSavingDesign(): IPersistKeyboardDesign {
    const savingDesign = editReader.design;
    const persistDesign = KeyboardDesignConverter.convertKeyboardDesignEditToPersist(
      savingDesign,
    );
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
    return <PageRoot />;
  }
}
