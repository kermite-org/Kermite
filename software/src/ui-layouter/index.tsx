import { h, Hook } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { windowKeyboardEventEffect } from '~/ui-common/helpers';
import { editMutations, editReader } from '~/ui-layouter/editor/store';
import {
  KeyboardDesignConverter,
  keyboardOperationHander,
  setupDeviceKeyEventsListener,
} from '~/ui-layouter/editor/unification';
import { PageRoot } from '~/ui-layouter/editor/views/PageRoot';

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
    return KeyboardDesignConverter.convertKeyboardDesignEditToPersist(
      editReader.design,
    );
  }

  export function getIsModified(): boolean {
    return editReader.isModified;
  }

  export function Component() {
    Hook.useEffect(windowKeyboardEventEffect(keyboardOperationHander), []);
    Hook.useEffect(setupDeviceKeyEventsListener, []);
    return <PageRoot />;
  }
}
