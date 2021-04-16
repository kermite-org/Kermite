import { IPersistKeyboardDesign } from '~/shared';

export namespace LayoutDataMigrator {
  export function patchOldFormatLayoutData(layout: IPersistKeyboardDesign) {
    const _layout = layout as {
      transformationGroups?: IPersistKeyboardDesign['transformationGroups'];
      transGroups?: IPersistKeyboardDesign['transformationGroups'];
      formatRevision?: string;
    };
    if (!layout.formatRevision) {
      _layout.formatRevision = 'LA00';
    }
    if (!layout.transformationGroups && _layout.transGroups) {
      layout.transformationGroups = _layout.transGroups;
    }
    // LA00 --> LA01
    // keySizeUnitに縦横のサイズを追加
    if (_layout.formatRevision === 'LA00') {
      layout.formatRevision = 'LA01';
      if (layout.setup.keySizeUnit === 'KP') {
        if (layout.setup.placementUnit.startsWith('KP')) {
          layout.setup.keySizeUnit = layout.setup.placementUnit;
        } else {
          layout.setup.keySizeUnit = 'KP 19';
        }
      }
    }
  }
}
