import { h, Hook } from 'qx';
import { UiLayouterCore } from '~/ui-layouter';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';

export const UiLayouterDevelopmentComponent = () => {
  Hook.useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitEditDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
