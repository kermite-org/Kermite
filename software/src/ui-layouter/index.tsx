import { appUi } from '@ui-common';
import {
  editMutations,
  editReader,
  IKeyboardDesign,
} from '@ui-layouter/editor/store';
import { keyboardOperationHander } from '@ui-layouter/editor/store/KeyboardOperationHandler';
import { PageRoot } from '@ui-layouter/editor/views/PageRoot';
import { h, Hook } from 'qx';

export namespace UiLayouterCore {
  export function loadEditDesign(design: IKeyboardDesign) {
    editMutations.loadKeyboardDesign(design);
  }

  export function emitEditDesign(): IKeyboardDesign {
    return editReader.design;
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
