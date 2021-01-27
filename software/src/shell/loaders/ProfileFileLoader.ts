import { AppError, IPersistProfileData, IProfileData } from '~/shared';
import { fsxReadJsonFile, fsxWriteJsonFile } from '~/shell/funcs';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';
import { checkProfileDataObjectSchema } from '~/shell/loaders/ProfileDataSchemaChecker';

export namespace ProfileFileLoader {
  export async function loadProfileFromFile(
    filePath: string,
  ): Promise<IProfileData> {
    const _profileData = (await fsxReadJsonFile(
      filePath,
    )) as IPersistProfileData;
    const profileData = ProfileDataMigrator.fixProfileData(_profileData);

    const schemaError = checkProfileDataObjectSchema(profileData);
    if (schemaError) {
      const errorDetail = schemaError.toString().replace(/\\\\/g, '\\');
      console.log(`profile schema error`);
      console.log(filePath);
      console.log(errorDetail);
      throw new AppError({
        type: 'InvalidLayoutFileSchema',
        filePath,
        errorDetail,
      });
    }
    return ProfileDataConverter.convertProfileDataFromPersist(profileData);
  }

  export async function saveProfileToFile(
    filePath: string,
    profileData: IProfileData,
  ): Promise<void> {
    const persistProfileData = ProfileDataConverter.convertProfileDataToPersist(
      profileData,
    );
    await fsxWriteJsonFile(filePath, persistProfileData);
  }
}
