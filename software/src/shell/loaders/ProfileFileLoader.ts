import { AppError, IProfileData } from '~/shared';
import { fsxReadJsonFile } from '~/shell/funcs';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';
import { checkProfileDataObjectSchema } from '~/shell/loaders/ProfileDataSchemaChecker';

export namespace ProfileFileLoader {
  export async function loadProfileFromFile(
    filePath: string,
  ): Promise<IProfileData> {
    const _profileData = (await fsxReadJsonFile(filePath)) as IProfileData;
    const profileData = ProfileDataMigrator.fixProfileData(_profileData);

    const schemaError = checkProfileDataObjectSchema(profileData);
    if (schemaError) {
      const errorDetail = schemaError.toString().replace(/\\\\/g, '\\');
      // console.log(`profile schema error`);
      // console.log(filePath);
      // console.log(errorDetail);
      throw new AppError({
        type: 'InvalidLayoutFileSchema',
        filePath,
        errorDetail,
      });
    }

    return profileData;
  }
}
