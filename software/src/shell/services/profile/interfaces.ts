import {
  IPresetSpec,
  IProfileData,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { IEventPort2 } from '~/shell/funcs';

export interface IProfileManager {
  getCurrentProfileProjectId(): string;
  getCurrentProfileAsync(): Promise<IProfileData>;
  getAllProfileNamesAsync(): Promise<string[]>;
  statusEventPort: IEventPort2<Partial<IProfileManagerStatus>>;
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
