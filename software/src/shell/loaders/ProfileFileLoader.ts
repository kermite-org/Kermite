import { AppError, IPersistProfileData, IProfileData } from '~/shared';
import { ProfileDataConverter } from '~/shared/modules/ProfileDataConverter';
import {
  cacheRemoteResouce,
  fetchJson,
  fsxReadJsonFile,
  fsxWriteJsonFile,
} from '~/shell/funcs';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';
import { checkProfileDataObjectSchema } from '~/shell/loaders/ProfileDataSchemaChecker';

export namespace ProfileFileLoader {
  export function convertProfileDataFromPersistProfileData(
    sourceProfileData: IPersistProfileData,
    filePath: string,
  ): IProfileData {
    const profileData = ProfileDataMigrator.fixProfileData(sourceProfileData);

    const schemaError = checkProfileDataObjectSchema(profileData);
    if (schemaError) {
      const errorDetail = schemaError.toString().replace(/\\\\/g, '\\');
      console.log(`profile schema error`);
      console.log(filePath);
      console.log(errorDetail);
      throw new AppError('InvalidProfileFileSchema', {
        filePath,
        schemaErrorDetail: errorDetail,
      });
    }
    return ProfileDataConverter.convertProfileDataFromPersist(profileData);
  }

  export async function loadProfileFromFile(
    filePath: string,
  ): Promise<IProfileData> {
    const _profileData = (await fsxReadJsonFile(
      filePath,
    )) as IPersistProfileData;
    return convertProfileDataFromPersistProfileData(_profileData, filePath);
  }

  export async function loadProfileFromUri(uri: string): Promise<IProfileData> {
    const _profileData = (await cacheRemoteResouce(
      fetchJson,
      uri,
    )) as IPersistProfileData;
    return convertProfileDataFromPersistProfileData(_profileData, uri);
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
