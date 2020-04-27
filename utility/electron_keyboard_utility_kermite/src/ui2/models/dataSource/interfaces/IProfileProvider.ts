import { IProfileData } from '~defs/ProfileData';

export interface IProfileProvider {
  loadProfile(): IProfileData | undefined;
  saveProfile(profile: IProfileData): void;
}
