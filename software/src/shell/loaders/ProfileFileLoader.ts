import { IProfileData } from '~/shared';
import { fsxReadJsonFile } from '~/shell/funcs';
import { ProfileDataMigrator } from '~/shell/loaders/ProfileDataMigrator';

export namespace ProfileFileLoader {
  export async function loadProfileFromFile(
    filePath: string,
  ): Promise<IProfileData> {
    const _profileData = (await fsxReadJsonFile(filePath)) as IProfileData;
    const profileData = ProfileDataMigrator.fixProfileData(_profileData);
    return profileData;
  }
}
