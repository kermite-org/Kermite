import { defaultKeyboardDesignSetup, IPersistKeyboardDesign } from '~/shared';

export namespace LayoutDataMigrator {
  export function patchOldFormatLayoutData(layout: IPersistKeyboardDesign) {
    if (!layout.formatRevision) {
      throw new Error('layout file format too old');
    }
    // LA00 --> LA01
    // keySizeUnitに縦横のサイズを追加
    if (layout.formatRevision === <string>'LA00') {
      layout.formatRevision = 'LA01';
      if (layout.setup.keySizeUnit === 'KP') {
        if (layout.setup.placementUnit.startsWith('KP')) {
          layout.setup.keySizeUnit = layout.setup.placementUnit;
        } else {
          layout.setup.keySizeUnit = defaultKeyboardDesignSetup.keySizeUnit;
        }
      }
    }
  }
}
