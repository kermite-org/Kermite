import { h, Hook, asyncRerender } from 'qx';
import { UiLayouterCore } from '~/ui-layouter';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';

export const MockPageLayouterDevelopment = () => {
  Hook.useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    asyncRerender();
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitEditDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
