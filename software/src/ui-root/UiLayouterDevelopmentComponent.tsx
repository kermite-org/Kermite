import { UiLayouterCore } from '@ui-layouter';
import {
  createFallbackKeyboardDesign,
  IKeyboardDesign,
} from '@ui-layouter/editor/store';
import { h, Hook } from 'qx';

function loadLocalStorageKeyboardDesignOrDefault(): IKeyboardDesign {
  const text = localStorage.getItem('savedDesign');
  if (text) {
    const obj = JSON.parse(text) as IKeyboardDesign;
    return obj;
  } else {
    return createFallbackKeyboardDesign();
  }
}

function saveLocalStorageKeyboardDesign(design: IKeyboardDesign) {
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
