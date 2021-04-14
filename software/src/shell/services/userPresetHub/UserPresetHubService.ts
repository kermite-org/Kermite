import { IPersistProfileData, IServerPorfileInfo } from '~/shared';
import { cacheRemoteResouce, fetchJson } from '~/shell/funcs';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';
import { IUserPresetHubService } from '~/shell/services/userPresetHub/Interfaces';
import { PresetHubServerTypes } from '~/shell/services/userPresetHub/PresetHubServerTypes';

const serverUrlBase = `http://localhost:5000`;

export class UserPresetHubService implements IUserPresetHubService {
  async getServerProjectIds(): Promise<string[]> {
    const url = `${serverUrlBase}/api/projects/distinctedids`;
    const data = await cacheRemoteResouce<PresetHubServerTypes.GetDistinctedProjectIdsResponse>(
      fetchJson,
      url,
    );
    return data.projectIds || [];
  }

  async getServerProfiles(projectId: string): Promise<IServerPorfileInfo[]> {
    const url = `${serverUrlBase}/api/profiles/projects/${projectId}`;
    const data = await cacheRemoteResouce<PresetHubServerTypes.GetPublicProfilesResponse>(
      fetchJson,
      url,
    );
    return (
      data.profiles?.map((item) => {
        const persistProfileData = JSON.parse(item.data) as IPersistProfileData;
        const profileData = ProfileDataConverter.convertProfileDataFromPersist(
          persistProfileData,
        );
        return {
          id: item.id,
          userName: item.userName,
          profileName: item.name,
          profileData,
        };
      }) || []
    );
  }
}
