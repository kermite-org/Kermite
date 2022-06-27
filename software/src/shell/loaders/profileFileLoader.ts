import {
  AppError,
  IFileReadHandle,
  IFileWriteHandle,
  IPersistProfileData,
  IPersistProfileFileData,
  IProfileData,
  ProfileDataConverter,
} from '~/shared';
import {
  cacheRemoteResource,
  fetchJson,
  fsxReadJsonFile,
  fsxReadJsonFromFileHandle,
  fsxWriteJsonFile,
  fsxWriteJsonToFileHandle,
} from '~/shell/funcs';
import { ProfileDataMigrator } from '~/shell/loaders/profileDataMigrator';
import { checkProfileDataObjectSchema } from '~/shell/loaders/profileDataSchemaChecker';

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

  export function loadProfileFromFile(filePath: string): IProfileData {
    const profileFileData = fsxReadJsonFile(
      filePath,
    ) as IPersistProfileFileData;
    return convertProfileDataFromPersistProfileData(profileFileData, filePath);
  }

  export async function loadProfileFromUri(uri: string): Promise<IProfileData> {
    const profileFileData = (await cacheRemoteResource(
      fetchJson,
      uri,
    )) as IPersistProfileFileData;
    return convertProfileDataFromPersistProfileData(profileFileData, uri);
  }

  export async function loadProfileFromLocalFile(
    fileHandle: IFileReadHandle,
  ): Promise<IProfileData> {
    const profileFileData = (await fsxReadJsonFromFileHandle(
      fileHandle,
    )) as IPersistProfileFileData;
    const fileName = (await fileHandle.getFile()).name;
    return convertProfileDataFromPersistProfileData(profileFileData, fileName);
  }

  export function saveProfileToFile(
    filePath: string,
    profileData: IProfileData,
    profileName: string,
  ): void {
    const persistProfileData =
      ProfileDataConverter.convertProfileToPersistFileData(
        profileData,
        profileName,
      );
    fsxWriteJsonFile(filePath, persistProfileData);
  }

  export async function saveProfileToLocalFile(
    fileHandle: IFileWriteHandle,
    profileData: IProfileData,
    profileName: string,
  ) {
    const persistProfileData =
      ProfileDataConverter.convertProfileToPersistFileData(
        profileData,
        profileName,
      );
    await fsxWriteJsonToFileHandle(fileHandle, persistProfileData);
  }
}
