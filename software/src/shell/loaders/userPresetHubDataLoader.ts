import { IPersistProfileData, IServerProfileInfo } from '~/shared';
import { cacheRemoteResource, fetchJson } from '~/shell/funcs';
import { ProfileFileLoader } from '~/shell/loaders/profileFileLoader';

export namespace PresetHubServerTypes {
  export type GetProfilesProjectIdsResponse = {
    projectIds?: string[] | null;
  };

  export type PublicProfileInformation = {
    id: string;
    name: string;
    description: string;
    projectId: string;
    data: string;
    lastUpdate: string;
    userId: string;
    userDisplayName: string;
    loginProvider: string | null;
    showLinkId: boolean | null;
  };

  export type GetPublicProfilesResponse = {
    profiles?: PublicProfileInformation[] | null;
  };
}

const serverUrlBase = `https://server.kermite.org`;

export const userPresetHubDataLoader = {
  async getServerProjectIds(): Promise<string[]> {
    const url = `${serverUrlBase}/api/profiles/projectids`;
    const data =
      await cacheRemoteResource<PresetHubServerTypes.GetProfilesProjectIdsResponse>(
        fetchJson,
        url,
      );
    return data.projectIds || [];
  },
  async getServerProfiles(projectId: string): Promise<IServerProfileInfo[]> {
    const url = `${serverUrlBase}/api/profiles/projects/${projectId}`;
    const data =
      await cacheRemoteResource<PresetHubServerTypes.GetPublicProfilesResponse>(
        fetchJson,
        url,
      );
    return (
      data.profiles?.map((item) => {
        const persistProfileData = JSON.parse(item.data) as IPersistProfileData;
        const profileData =
          ProfileFileLoader.convertProfileDataFromPersistProfileData(
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
  },
};
