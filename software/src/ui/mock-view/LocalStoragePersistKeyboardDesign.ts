import { IPersistKeyboardDesign } from '~/shared';

function createFallbackKeyboardDesign(): IPersistKeyboardDesign {
  return {
    formatRevision: 'LA01',
    setup: {
      placementUnit: 'mm',
      placementAnchor: 'center',
      keySizeUnit: 'KP 19',
      keyIdMode: 'auto',
    },
    keyEntities: [],
    outlineShapes: [],
    transformationGroups: [
      {
        x: 0,
        y: 0,
        angle: 0,
      },
    ],
  };
}

export function loadLocalStorageKeyboardDesignOrDefault(): IPersistKeyboardDesign {
  const text = localStorage.getItem('kermite_ui_layouter_mock_savedDesign');
  if (text) {
    const obj = JSON.parse(text) as IPersistKeyboardDesign;
    return obj;
  } else {
    return createFallbackKeyboardDesign();
  }
}

export function saveLocalStorageKeyboardDesign(design: IPersistKeyboardDesign) {
  const text = JSON.stringify(design);
  localStorage.setItem('kermite_ui_layouter_mock_savedDesign', text);
}
