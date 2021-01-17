import { h, Hook } from 'qx';
import { IPersistKeyboardDesign } from '~/shared';
import { UiLayouterCore } from '~/ui-layouter';

function createFallbackKeyboardDesign(): IPersistKeyboardDesign {
  return {
    setup: {
      placementUnit: 'mm',
      placementAnchor: 'center',
      keySizeUnit: 'KP',
    },
    keyEntities: [],
    outlineShapes: [],
    transGroups: [
      {
        x: 0,
        y: 0,
        angle: 0,
      },
    ],
  };
}

function loadLocalStorageKeyboardDesignOrDefault(): IPersistKeyboardDesign {
  const text = localStorage.getItem('kermite_ui_layouter_mock_savedDesign');
  if (text) {
    const obj = JSON.parse(text) as IPersistKeyboardDesign;
    return obj;
  } else {
    return createFallbackKeyboardDesign();
  }
}

function saveLocalStorageKeyboardDesign(design: IPersistKeyboardDesign) {
  const text = JSON.stringify(design);
  localStorage.setItem('kermite_ui_layouter_mock_savedDesign', text);
}

export const UiLayouterDevelopmentComponent = () => {
  Hook.useEffect(() => {
    UiLayouterCore.loadEditDesign(loadLocalStorageKeyboardDesignOrDefault());
    return () =>
      saveLocalStorageKeyboardDesign(UiLayouterCore.emitEditDesign());
  }, []);

  return <UiLayouterCore.Component />;
};
