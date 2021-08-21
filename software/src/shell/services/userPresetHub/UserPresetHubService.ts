import { IPersistProfileData, IServerProfileInfo } from '~/shared';
import { cacheRemoteResource, fetchJson } from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';
import { IUserPresetHubService } from '~/shell/services/userPresetHub/Interfaces';
import { PresetHubServerTypes } from '~/shell/services/userPresetHub/PresetHubServerTypes';

const serverUrlBase = `http://dev.server.kermite.org`;
export class UserPresetHubService implements IUserPresetHubService {
  async getServerProjectIds(): Promise<string[]> {
    const url = `${serverUrlBase}/api/projects/distinctedids`;
    const data = await cacheRemoteResource<PresetHubServerTypes.GetDistinctedProjectIdsResponse>(
      fetchJson,
      url,
    );
    return data.projectIds || [];
  }

  async getServerProfiles(projectId: string): Promise<IServerProfileInfo[]> {
    const url = `${serverUrlBase}/api/profiles/projects/${projectId}`;
    const data = await cacheRemoteResource<PresetHubServerTypes.GetPublicProfilesResponse>(
      fetchJson,
      url,
    );
    return (
      data.profiles?.map((item) => {
        const persistProfileData = JSON.parse(item.data) as IPersistProfileData;
        const profileData = ProfileFileLoader.convertProfileDataFromPersistProfileData(
          persistProfileData,
          'from-krs-api-project-profiles',
        );
        return {
          id: item.id,
          userName: item.userDisplayName,
          profileName: item.name,
          profileData,
        };
      }) || []
    );
  }
}
