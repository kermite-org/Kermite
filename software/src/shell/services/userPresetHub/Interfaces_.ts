import { IServerPorfileInfo } from '~/shared';

export interface IUserPresetHubService {
  getServerProjectIds(): Promise<string[]>;
  getServerProfiles(projectId: string): Promise<IServerPorfileInfo[]>;
}
