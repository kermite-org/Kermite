import {
  IProfileData,
  IProfileManagerCommand,
  IProfileManagerStatus,
} from '~/shared';
import { EventPort } from '~/shell/funcs';

export interface IProfileManager {
  getStatus(): IProfileManagerStatus;
  getCurrentProfile(): IProfileData | undefined;
  statusEventPort: EventPort<Partial<IProfileManagerStatus>>;
  reserveSaveProfileTask(prof: IProfileData): void;
  executeCommands(commands: IProfileManagerCommand[]): Promise<void>;
  saveCurrentProfile(profileData: IProfileData): Promise<boolean>;
}
