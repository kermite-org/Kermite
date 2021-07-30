import {
  IPresetSpec,
  IProfileData,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { IEventPort } from '~/shell/funcs';

export interface IProfileManager {
  getCurrentProfileProjectId(): string;
  getCurrentProfileAsync(): Promise<IProfileData | undefined>;
  getAllProfileNamesAsync(): Promise<string[]>;
  statusEventPort: IEventPort<Partial<IProfileManagerStatus>>;
  executeCommands(commands: IProfileManagerCommand[]): Promise<void>;
  saveCurrentProfile(profileData: IProfileData): Promise<void>;
}

export interface IPresetProfileLoader {
  loadPresetProfileData(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined>;
  deleteProjectPresetProfileCache(projectId: string): void;
}
