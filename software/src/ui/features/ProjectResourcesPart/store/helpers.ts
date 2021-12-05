import {
  IProjectProfileEntry,
  IProjectLayoutEntry,
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
  cloneObject,
  fallbackProfileData,
  IProfileData,
  ProfileDataConverter,
  IProjectFirmwareEntry,
} from '~/shared';
import { uiReaders } from '~/ui/store/base';

export const projectResourceHelpers = {
  createProjectResourceListItemKeys(
    projectInfo?: IProjectPackageInfo,
  ): string[] {
    if (!projectInfo) {
      return [];
    }
    const keys = [
      ...projectInfo.profiles.map((it) =>
        encodeProjectResourceItemKey('profile', it.profileName),
      ),
      ...projectInfo.layouts.map((it) =>
        encodeProjectResourceItemKey('layout', it.layoutName),
      ),
      ...projectInfo.firmwares.map((it) =>
        encodeProjectResourceItemKey('firmware', it.firmwareName),
      ),
    ];
    return keys;
  },
  getProfileEntry(profileName: string): IProjectProfileEntry | undefined {
    return uiReaders.editTargetProject?.profiles.find(
      (it) => it.profileName === profileName,
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
    const profileEntry = projectResourceHelpers.getProfileEntry(presetName);
    return (
      (profileEntry &&
        ProfileDataConverter.convertProfileDataFromPersist(
          profileEntry.data,
        )) ||
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
