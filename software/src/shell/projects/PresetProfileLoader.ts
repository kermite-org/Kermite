import {
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  IPresetSpec,
} from '~/shared';
import { projectResourceInfoProvider } from '~/shell/projects';
import { IPresetProfileLoadingFeature } from '~/shell/projects/interfaces';

export class PresetProfileLoader implements IPresetProfileLoadingFeature {
  private async createBlankProfileFromLayoutFile(
    projectId: string,
    layoutName: string,
  ) {
    try {
      const design = await projectResourceInfoProvider.loadProjectLayout(
        projectId,
        layoutName,
      );
      if (design) {
        const profileData: IProfileData = duplicateObjectByJsonStringifyParse(
          fallbackProfileData,
        );
        profileData.projectId = projectId;
        profileData.keyboardDesign = design;
        return profileData;
      }
    } catch (error) {
      console.log(`errorr on loading layout file`);
      console.error(error);
    }
  }

  private async loadPresetProfileDataImpl(
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    if (presetSpec.type === 'preset') {
      return await projectResourceInfoProvider.loadProjectPreset(
        projectId,
        presetSpec.presetName,
      );
    } else {
      return await this.createBlankProfileFromLayoutFile(
        projectId,
        presetSpec.layoutName,
      );
    }
  }

  private profileDataCache: { [key in string]: IProfileData | undefined } = {};

  async loadPresetProfileData(
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined> {
    const pp = presetSpec as {
      type: string;
      layoutName?: string;
      presetName?: string;
    };
    const profileKey = `${projectId}__${pp.type}__${
      pp.layoutName || pp.presetName || ''
    }`;
    const cache = this.profileDataCache;
    if (profileKey in cache) {
      return cache[profileKey];
    }
    const profile = await this.loadPresetProfileDataImpl(projectId, presetSpec);
    cache[profileKey] = profile;
    return profile;
  }
}
