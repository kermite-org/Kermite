import { UiLayouterCore } from '@ui-layouter';
import {
  createFallbackPersistKeyboardDesign,
  IPersistentKeyboardDesign,
} from '@ui-layouter/editor/store';
import { h, Hook } from 'qx';

function loadLocalStorageKeyboardDesignOrDefault(): IPersistentKeyboardDesign {
  const text = localStorage.getItem('savedDesign');
  if (text) {
    const obj = JSON.parse(text) as IPersistentKeyboardDesign;
    return obj;
  } else {
    return createFallbackPersistKeyboardDesign();
  }
}

function saveLocalStorageKeyboardDesign(design: IPersistentKeyboardDesign) {
  const text = JSON.stringify(design);
  localStorage.setItem('savedDesign', text);
}

export const UiLayouterDevelopmentComponent = () => {
  Hook.useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitEditDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
