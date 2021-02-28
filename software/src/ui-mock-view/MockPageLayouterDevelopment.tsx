import { jsx, Hook } from 'qx';
import { UiLayouterCore } from '~/ui-layouter';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';

export const MockPageLayouterDevelopment = () => {
  Hook.useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitSavingDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
