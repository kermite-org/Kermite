import { IServerPorfileInfo } from '~/shared';
import { cacheRemoteResouce, fetchJson } from '~/shell/funcs';
import { PresetHubServerTypes } from '~/shell/services/userPresetHub/PresetHubServerTypes';
import { IUserPresetHubService } from '~/shell/services/userPresetHub/interfaces';

const serverUrlBase = `http://localhost:5000`;

export class UserPresetHubService implements IUserPresetHubService {
  async getServerProjectIds(): Promise<string[]> {
    const url = `${serverUrlBase}/api/Projects/distinctedids`;
    const data = await cacheRemoteResouce<PresetHubServerTypes.GetDistinctedProjectIdsResponse>(
      fetchJson,
      url,
    );
    return data.projectIds || [];
  }

  async getServerProfiles(projectId: string): Promise<IServerPorfileInfo[]> {
    const url = `${serverUrlBase}/api/Profiles/projects/${projectId}`;
    const data = await cacheRemoteResouce<PresetHubServerTypes.GetPublicProfilesResponse>(
      fetchJson,
      url,
    );
    return (
      data.profiles?.map((item) => ({
        id: item.id,
        userName: item.userName,
        profileName: item.name,
        profileData: JSON.parse(item.data),
      })) || []
    );
  }
}
