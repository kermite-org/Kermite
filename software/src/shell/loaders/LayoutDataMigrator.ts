import { IPersistKeyboardDesign } from '~/shared';

export namespace LayoutDataMigrator {
  export function patchOldFormatLayoutData(layout: IPersistKeyboardDesign) {
    const _layout = layout as {
      transformationGroups?: IPersistKeyboardDesign['transformationGroups'];
      transGroups?: IPersistKeyboardDesign['transformationGroups'];
    };
    if (!layout.formatRevision) {
      layout.formatRevision = 'LA00';
    }
    if (!layout.transformationGroups && _layout.transGroups) {
      layout.transformationGroups = _layout.transGroups;
    }
  }
}
