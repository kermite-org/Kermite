import { h, Hook } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { appUi } from '~/ui-common';
import { editMutations, editReader } from '~/ui-layouter/editor/store';
import { KeyboardDesignConverter } from '~/ui-layouter/editor/unification/KeyboardDesignConverter';
import { keyboardOperationHander } from '~/ui-layouter/editor/unification/KeyboardOperationHandler';
import { setupDeviceKeyEventsListener } from '~/ui-layouter/editor/unification/deviceKeyEventsReader';
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
      appUi.rerender();

      return () => {
        window.removeEventListener('keydown', keyboardOperationHander);
      };
    }, []);

    Hook.useEffect(setupDeviceKeyEventsListener, []);

    return <PageRoot />;
  }
}
