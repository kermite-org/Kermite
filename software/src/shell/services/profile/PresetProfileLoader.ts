import {
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  IPresetSpec,
  IResourceOrigin,
} from '~/shared';
import { projectResourceProvider } from '~/shell/projectResources';
import { IPresetProfileLoader } from '~/shell/services/profile/interfaces';

export class PresetProfileLoader implements IPresetProfileLoader {
  private async createBlankProfileFromLayoutFile(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ) {
    try {
      const design = await projectResourceProvider.loadProjectLayout(
        origin,
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
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    if (presetSpec.type === 'preset') {
      return await projectResourceProvider.loadProjectPreset(
        origin,
        projectId,
        presetSpec.presetName,
      );
    } else {
      return await this.createBlankProfileFromLayoutFile(
        origin,
        projectId,
        presetSpec.layoutName,
      );
    }
  }

  private profileDataCache: { [key in string]: IProfileData | undefined } = {};

  deleteProjectPresetProfileCache(projectId: string) {
    for (const key in this.profileDataCache) {
      if (key.includes(projectId)) {
        delete this.profileDataCache[key];
      }
    }
  }

  async loadPresetProfileData(
    origin: IResourceOrigin,
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined> {
    const pp = presetSpec as {
      type: string;
      layoutName?: string;
      presetName?: string;
    };
    const profileKey = `${origin}__${projectId}__${pp.type}__${
      pp.layoutName || pp.presetName || ''
    }`;
    const cache = this.profileDataCache;
    if (profileKey in cache) {
      return cache[profileKey];
    }
    const profile = await this.loadPresetProfileDataImpl(
      origin,
      projectId,
      presetSpec,
    );
    cache[profileKey] = profile;
    return profile;
  }
}
