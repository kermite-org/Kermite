import { h, Hook } from 'qx';
import {
  editMutations,
  saveEditKeyboardDesign,
} from '@ui-layouter/editor/store';
import { keyboardOperationHander } from '@ui-layouter/editor/store/KeyboardOperationHandler';
import { PageRoot } from '@ui-layouter/editor/views/PageRoot';

export const UiLayouterPageComponent = () => {
  Hook.useEffect(() => {
    console.log('start layouter');
    editMutations.resetSitePosition();

    window.addEventListener('keydown', keyboardOperationHander);

    return () => {
      console.log(`end layouter`);
      window.removeEventListener('keydown', keyboardOperationHander);
      saveEditKeyboardDesign();
    };
  }, []);

  return <PageRoot />;
};
