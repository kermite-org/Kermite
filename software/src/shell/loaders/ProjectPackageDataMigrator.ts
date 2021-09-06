import { IProjectPackageFileContent } from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';

export function migrateProjectPackageData(
  packageContent: IProjectPackageFileContent,
) {
  if (packageContent.formatRevision === 'PKG0') {
    packageContent.layouts.forEach((layout) =>
      LayoutDataMigrator.patchOldFormatLayoutData(layout.data),
    );
    packageContent.presets.forEach(
      (preset) =>
        (preset.data = ProfileDataMigrator.fixProfileData(preset.data)),
    );
  }
}
