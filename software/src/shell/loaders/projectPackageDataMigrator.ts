import {
  IPersistProfileData,
  IProjectFirmwareEntry,
  IProjectPackageFileContent,
} from '~/shared';
import { migrateStandardFirmwareConfig } from '~/shared/loaders';
import { LayoutDataMigrator } from '~/shell/loaders/layoutDataMigrator';
import { ProfileDataMigrator } from '~/shell/loaders/profileDataMigrator';

export interface IProjectProfileEntryOld {
  presetName: string;
  data: IPersistProfileData;
}

type IProjectPackageFileContentOldMix = IProjectPackageFileContent & {
  presets?: IProjectProfileEntryOld[];
};

export function migrateProjectPackageData(
  _packageContent: IProjectPackageFileContent,
) {
  const packageContent = _packageContent as IProjectPackageFileContentOldMix;

  if (packageContent.formatRevision === 'PKG0') {
    if (!packageContent.profiles && packageContent.presets) {
      packageContent.profiles = packageContent.presets.map((it) => ({
        profileName: it.presetName,
        data: it.data,
      }));
      delete packageContent.presets;
    }

    packageContent.layouts.forEach((layout) =>
      LayoutDataMigrator.patchOldFormatLayoutData(layout.data),
    );
    packageContent.profiles.forEach(
      (profile) =>
        (profile.data = ProfileDataMigrator.fixProfileData(profile.data)),
    );
    packageContent.firmwares.forEach((_firmware) => {
      const firmware = _firmware as IProjectFirmwareEntry & {
        variationName?: string;
      };
      if (!firmware.firmwareName && firmware.variationName) {
        firmware.firmwareName = firmware.variationName;
      }

      if (firmware.type === 'standard') {
        migrateStandardFirmwareConfig(firmware.standardFirmwareConfig);
      }
    });
  }
}
