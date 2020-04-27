import { IProfileData } from '~defs/ProfileData';
import { IProfileProvider } from '../interfaces/IProfileProvider';

export class ProfileProvider_LocalStorage implements IProfileProvider {
  loadProfile(): IProfileData | undefined {
    const obj = localStorage.getItem('profile');
    if (obj) {
      return JSON.parse(obj);
    }
    return undefined;
  }

  saveProfile(profile: IProfileData) {
    localStorage.setItem('profile', JSON.stringify(profile));
  }
}
