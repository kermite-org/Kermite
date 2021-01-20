import { h, Hook } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { editMutations, editReader } from '~/ui-layouter/editor/store';
import {
  KeyboardDesignConverter,
  keyboardOperationHander,
  setupDeviceKeyEventsListener,
} from '~/ui-layouter/editor/unification';
import { PageRoot } from '~/ui-layouter/editor/views/PageRoot';

export namespace UiLayouterCore {
  export function loadEditDesign(persistDesign: IPersistKeyboardDesign) {
    const design = KeyboardDesignConverter.convertKeyboardDesignPersistToEdit(
      persistDesign,
    );
    editMutations.loadKeyboardDesign(design);
  }

  export function emitEditDesign(): IPersistKeyboardDesign {
    return KeyboardDesignConverter.convertKeyboardDesignEditToPersist(
      editReader.design,
    );
  }

  export function Component() {
    Hook.useEffect(() => {
      window.addEventListener('keydown', keyboardOperationHander);
      return () => {
        window.removeEventListener('keydown', keyboardOperationHander);
      };
    }, []);

    Hook.useEffect(setupDeviceKeyEventsListener, []);

    return <PageRoot />;
  }
}
