import { IProfileData } from '@shared';
import { IListenerPort } from '@shell/base';

export interface IProfileService {
  getCurrentProfile(): IProfileData | undefined;
  onCurrentProfileChanged: IListenerPort<void>;
  initialize(): Promise<void>;
  terminate(): Promise<void>;
}
