import { IProjectFirmwareEntry, IProjectPackageFileContent } from '~/shared';
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
    packageContent.firmwares.forEach((_firmware) => {
      const firmware = _firmware as IProjectFirmwareEntry & {
        variationName?: string;
      };
      if (!firmware.firmwareName && firmware.variationName) {
        firmware.firmwareName = firmware.variationName;
      }
    });
  }
}
