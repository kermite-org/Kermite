import { appUi } from '@ui-common';
import {
  editMutations,
  editReader,
  IPersistentKeyboardDesign,
} from '@ui-layouter/editor/store';
import { keyboardOperationHander } from '@ui-layouter/editor/store/KeyboardOperationHandler';
import { LayouterPersistDataConverter } from '@ui-layouter/editor/store/PersistDataConverter';
import { PageRoot } from '@ui-layouter/editor/views/PageRoot';
import { h, Hook } from 'qx';

export namespace UiLayouterCore {
  export function loadEditDesign(persistDesign: IPersistentKeyboardDesign) {
    const design = LayouterPersistDataConverter.convertFromPersistData(
      persistDesign,
    );
    editMutations.loadKeyboardDesign(design);
  }

  export function emitEditDesign(): IPersistentKeyboardDesign {
    return LayouterPersistDataConverter.convertToPersistData(editReader.design);
  }

  export function Component() {
    Hook.useEffect(() => {
      console.log('start layouter');
      window.addEventListener('keydown', keyboardOperationHander);
      appUi.rerender();

      return () => {
        console.log(`end layouter`);
        window.removeEventListener('keydown', keyboardOperationHander);
      };
    }, []);

    return <PageRoot />;
  }
}
