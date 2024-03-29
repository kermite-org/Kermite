import { jsx, useEffect } from 'alumina';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';
import { LayoutEditorCore } from '~/ui/featureEditors';

export const MockPageLayoutEditorDevelopment = () => {
  useEffect(() => {
    LayoutEditorCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(LayoutEditorCore.emitSavingDesign());
  }, []);

  return <LayoutEditorCore.Component />;
};
