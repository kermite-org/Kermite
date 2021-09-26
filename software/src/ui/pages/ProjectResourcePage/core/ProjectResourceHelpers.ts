import {
  IProjectPresetEntry,
  IProjectLayoutEntry,
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
  cloneObject,
  fallbackProfileData,
  IProfileData,
  ProfileDataConverter,
  IProjectFirmwareEntry,
} from '~/shared';
import { uiReaders } from '~/ui/store';

export const projectResourceHelpers = {
  createProjectResourceListItemKeys(
    projectInfo?: IProjectPackageInfo,
  ): string[] {
    if (!projectInfo) {
      return [];
    }
    const keys = [
      ...projectInfo.presets.map((it) =>
        encodeProjectResourceItemKey('profile', it.presetName),
      ),
      ...projectInfo.layouts.map((it) =>
        encodeProjectResourceItemKey('layout', it.layoutName),
      ),
      ...projectInfo.firmwares.map((it) =>
        encodeProjectResourceItemKey('firmware', it.firmwareName),
      ),
    ];
    keys.sort();
    return keys;
  },
  getPresetEntry(presetName: string): IProjectPresetEntry | undefined {
    return uiReaders.editTargetProject?.presets.find(
      (it) => it.presetName === presetName,
    );
  },
  getLayoutEntry(layoutName: string): IProjectLayoutEntry | undefined {
    return uiReaders.editTargetProject?.layouts.find(
      (it) => it.layoutName === layoutName,
    );
  },
  getFirmwareEntry(firmwareName: string): IProjectFirmwareEntry | undefined {
    return uiReaders.editTargetProject?.firmwares.find(
      (it) => it.firmwareName === firmwareName,
    );
  },
  loadProfileData(presetName: string): IProfileData {
    const presetEntry = projectResourceHelpers.getPresetEntry(presetName);
    return (
      (presetEntry &&
        ProfileDataConverter.convertProfileDataFromPersist(presetEntry.data)) ||
      fallbackProfileData
    );
  },
  loadLayoutProfileData(layoutName: string): IProfileData {
    const layoutEntry = projectResourceHelpers.getLayoutEntry(layoutName);
    const profileData = cloneObject(fallbackProfileData);
    if (layoutEntry) {
      profileData.keyboardDesign = layoutEntry.data;
    }
    return profileData;
  },
};
