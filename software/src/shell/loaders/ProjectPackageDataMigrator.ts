import { IProjectPackageFileContent } from '~/shared';
import { LayoutDataMigrator } from '~/shell/loaders/LayoutDataMigrator';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';

function makeResourceId(prefix: string, index: number) {
  return prefix + ('00' + index.toString()).slice(-2);
}

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
    const hasResourceId =
      packageContent.layouts[0]?.resourceId ||
      packageContent.presets[0]?.resourceId ||
      packageContent.firmwares[0]?.resourceId;
    if (!hasResourceId) {
      packageContent.layouts.forEach(
        (it, index) => (it.resourceId = makeResourceId('lt', index + 1)),
      );
      packageContent.presets.forEach(
        (it, index) => (it.resourceId = makeResourceId('pr', index + 1)),
      );
      packageContent.firmwares.forEach(
        (it, index) => (it.resourceId = makeResourceId('fw', index + 1)),
      );
    }
  }
}
