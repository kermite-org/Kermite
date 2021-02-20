import {
  IPresetSpec,
  IProfileData,
  IProfileManagerCommand,
  IProfileManagerStatus,
  IResourceOrigin,
} from '~/shared';
import { EventPort } from '~/shell/funcs';

export interface IProfileManager {
  getStatus(): IProfileManagerStatus;
  getCurrentProfile(): IProfileData | undefined;
  statusEventPort: EventPort<Partial<IProfileManagerStatus>>;
  reserveSaveProfileTask(prof: IProfileData): void;
  executeCommands(commands: IProfileManagerCommand[]): Promise<void>;
  saveCurrentProfile(profileData: IProfileData): Promise<void>;
  getCurrentProfileAfterInitialization(): Promise<IProfileData | undefined>;
}

export interface IPresetProfileLoader {
  loadPresetProfileData(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined>;
  deleteProjectPresetProfileCache(projectId: string): void;
}
