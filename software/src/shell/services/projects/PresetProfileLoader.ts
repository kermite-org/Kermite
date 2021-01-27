import {
  IProfileData,
  duplicateObjectByJsonStringifyParse,
  fallbackProfileData,
  IPresetSpec,
} from '~/shared';
import { layoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';
import {
  IPresetProfileLoadingFeature,
  IProjectResourceInfoProvider,
} from '../serviceInterfaces';

export class PresetProfileLoader implements IPresetProfileLoadingFeature {
  constructor(
    private projectResourceInfoProvider: IProjectResourceInfoProvider,
  ) {}

  private async loadPresetProfileFromPresetFile(
    projectId: string,
    presetName: string,
  ) {
    const presetFilePath = this.projectResourceInfoProvider.getPresetProfileFilePath(
      projectId,
      presetName,
    );
    if (presetFilePath) {
      try {
        return await ProfileFileLoader.loadProfileFromFile(presetFilePath);
      } catch (error) {
        console.log(`errorr on loading preset file`);
        console.error(error);
      }
    }
    return undefined;
  }

  private async createBlankProfileFromLayoutFile(
    projectId: string,
    layoutName: string,
  ) {
    const layoutFilePath = this.projectResourceInfoProvider.getLayoutFilePath(
      projectId,
      layoutName,
    );
    if (layoutFilePath) {
      try {
        const design = await layoutFileLoader.loadLayoutFromFile(
          layoutFilePath,
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
  }

  private async loadPresetProfileDataImpl(
    projectId: string,
    presetSpec: IPresetSpec,
  ) {
    if (presetSpec.type === 'preset') {
      return await this.loadPresetProfileFromPresetFile(
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
