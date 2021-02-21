import {
  IPresetSpec,
  IProfileData,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { EventPort } from '~/shell/funcs';

export interface IProfileManager {
  getCurrentProfileProjectId(): string | undefined;
  getCurrentProfileAsync(): Promise<IProfileData | undefined>;
  getAllProfileNamesAsync(): Promise<string[]>;
  statusEventPort: EventPort<Partial<IProfileManagerStatus>>;
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
