import { IPersistKeyboardDesign } from '~/shared';

export namespace LayoutDataMigrator {
  export function patchOldFormatLayoutData(layout: IPersistKeyboardDesign) {
    if (!layout.formatRevision) {
      layout.formatRevision = 'LA00';
    }
  }
}
