import {
  IProjectPresetEntry,
  IProjectLayoutEntry,
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
  cloneObject,
  fallbackProfileData,
  IProfileData,
  ProfileDataConverter,
} from '~/shared';
import { uiReaders } from '~/ui/commonStore';

export const projectResourceHelpers = {
  createProjectResourceListItemKeys(
    projectInfo: IProjectPackageInfo,
  ): string[] {
    return [
      ...projectInfo.presets.map((it) =>
        encodeProjectResourceItemKey('preset', it.presetName),
      ),
      ...projectInfo.layouts.map((it) =>
        encodeProjectResourceItemKey('layout', it.layoutName),
      ),
      ...projectInfo.firmwares.map((it) =>
        encodeProjectResourceItemKey('firmware', it.variationName),
      ),
    ];
  },
  getPresetEntry(presetName: string): IProjectPresetEntry {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.presets.find((it) => it.presetName === presetName)!;
  },
  getLayoutEntry(layoutName: string): IProjectLayoutEntry {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.layouts.find((it) => it.layoutName === layoutName)!;
  },
  getFirmwareEntry(firmwareName: string) {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.firmwares.find(
      (it) => it.variationName === firmwareName,
    );
  },
  loadProfileData(presetName: string): IProfileData {
    const presetEntry = projectResourceHelpers.getPresetEntry(presetName);
    return ProfileDataConverter.convertProfileDataFromPersist(presetEntry.data);
  },
  loadLayoutProfileData(layoutName: string): IProfileData {
    const layoutEntry = projectResourceHelpers.getLayoutEntry(layoutName);
    const profileData = cloneObject(fallbackProfileData);
    profileData.keyboardDesign = layoutEntry.data;
    return profileData;
  },
};
