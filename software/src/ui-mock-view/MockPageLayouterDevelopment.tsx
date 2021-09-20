import { jsx, useEffect } from 'qx';
import {
  loadLocalStorageKeyboardDesignOrDefault,
  saveLocalStorageKeyboardDesign,
} from '~/ui-mock-view/LocalStoragePersistKeyboardDesign';
import { LayoutEditorCore } from '~/ui/editors';

export const MockPageLayoutEditorDevelopment = () => {
  useEffect(() => {
    LayoutEditorCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(LayoutEditorCore.emitSavingDesign());
  }, []);

  return <LayoutEditorCore.Component />;
};
