import { fallbackProfileData, IProfileData } from '../defs/ProfileData';
import { duplicateObjectByJsonStringifyParse } from '../funcs/utils';

export class EditorModel {
  loadedPorfileData: IProfileData = fallbackProfileData;
  profileData: IProfileData = fallbackProfileData;

  setProfileData(profileData: IProfileData) {
    this.loadedPorfileData = profileData;
    this.profileData = duplicateObjectByJsonStringifyParse(profileData);
  }
}
