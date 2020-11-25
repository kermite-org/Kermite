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
          ProfileHelper.patchProfileKeyboardShapeBodyPathMarkupText(
            profileData
          );
          return profileData;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return undefined;
  }

  private async createBlankProfileFromLayoutFile(
    projectId: string,
    layoutName: string
  ) {
    const layoutFilePath = this.projectResourceInfoProvider.getLayoutFilePath(
      projectId,
      layoutName
    );
    if (layoutFilePath) {
      try {
        const keyboardShape = await KeyboardLayoutFileLoader.loadShapeFromFile(
          layoutFilePath
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
    presetName: string
  ) {
    if (!presetName.startsWith('@')) {
      return await this.loadPresetProfileFromPresetFile(projectId, presetName);
    } else {
      const layoutName = presetName.slice(1);
      return await this.createBlankProfileFromLayoutFile(projectId, layoutName);
    }
  }

  private profileDataCache: { [key in string]: IProfileData | undefined } = {};

  async loadPresetProfileData(
    projectId: string,
    presetName: string
  ): Promise<IProfileData | undefined> {
    const profileKey = `${projectId}__${presetName}`;
    const cache = this.profileDataCache;
    if (profileKey in cache) {
      return cache[profileKey];
    }
    const profile = await this.loadPresetProfileDataImpl(projectId, presetName);
    cache[profileKey] = profile;
    return profile;
  }
}
