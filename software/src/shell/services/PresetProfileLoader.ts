import { fallbackProfileData, IProfileData } from '~defs/ProfileData';
import { fsxReadJsonFile } from '~funcs/Files';
import { duplicateObjectByJsonStringifyParse } from '~funcs/Utils';
import { KeyboardLayoutFileLoader } from '~shell/services/KeyboardShape/KeyboardLayoutFileLoader';
import { ProfileHelper } from './ProfileManager/ProfileHelper';
import {
  IPresetProfileLoadingFeature,
  IProjectResourceInfoProvider
} from './serviceInterfaces';

export class PresetProfileLoader implements IPresetProfileLoadingFeature {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider
  ) {}

  private async loadPresetProfileFromPresetFile(
    projectId: string,
    presetName: string
  ) {
    const presetFilePath = this.projectResourceInfoProvider.getPresetProfileFilePath(
      projectId,
      presetName
    );
    if (presetFilePath) {
      try {
        const profileData = (await fsxReadJsonFile(presetFilePath)) as
          | IProfileData
          | undefined;
        if (profileData) {
          ProfileHelper.fixProfileData(profileData);
          return profileData;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return undefined;
  }

  private async createBlankProfileFromLayoutFile(projectId: string) {
    const info = this.projectResourceInfoProvider.internal_getProjectInfoSourceById(
      projectId
    );
    if (info?.layoutFilePath) {
      try {
        const keyboardShape = await KeyboardLayoutFileLoader.loadShapeFromFile(
          info.layoutFilePath
        );
        if (keyboardShape) {
          const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
            fallbackProfileData
          );
          if (keyboardShape) {
            profileData.keyboardShape = keyboardShape;
          }
          return profileData;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  private async loadPresetProfileDataImpl(
    projectId: string,
    presetName: string | undefined
  ) {
    if (presetName) {
      return await this.loadPresetProfileFromPresetFile(projectId, presetName);
    } else {
      return await this.createBlankProfileFromLayoutFile(projectId);
    }
  }

  private profileDataCache: { [key in string]: IProfileData | undefined } = {};

  async loadPresetProfileData(
    projectId: string,
    presetName: string | undefined
  ): Promise<IProfileData | undefined> {
    const profileKey = `${projectId}__${presetName || 'blank'}`;
    const cache = this.profileDataCache;
    if (profileKey in cache) {
      return cache[profileKey];
    }
    const profile = await this.loadPresetProfileDataImpl(projectId, presetName);
    cache[profileKey] = profile;
    return profile;
  }
}
