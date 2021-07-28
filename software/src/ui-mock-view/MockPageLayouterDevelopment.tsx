import { jsx, useEffect } from 'qx';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';
import { UiLayouterCore } from '~/ui/layouter';

export const MockPageLayouterDevelopment = () => {
  useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitSavingDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
