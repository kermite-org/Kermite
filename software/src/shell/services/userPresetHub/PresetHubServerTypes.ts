export namespace PresetHubServerTypes {
  export type GetDistinctedProjectIdsResponse = {
    projectIds?: string[] | null;
  };

  export type PublicProfileInfomation = {
    id: string;
    name: string;
    userName: string;
    projectId: string;
    data: string;
    lastUpdate: string;
  };

  export type GetPublicProfilesResponse = {
    profiles?: PublicProfileInfomation[] | null;
  };
}
