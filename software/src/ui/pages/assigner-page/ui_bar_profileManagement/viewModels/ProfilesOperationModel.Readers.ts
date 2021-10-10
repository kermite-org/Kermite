import { standardFirmwareIds } from '~/shared';
import { assignerModel } from '~/ui/editors';
import { profilesReader } from '~/ui/pages/assigner-page/models';
import { uiReaders } from '~/ui/store';

export const profilesOperationReader = {
  get CanWriteKeyMappingToDevice(): boolean {
    const { deviceStatus, globalSettings, allProjectPackageInfos } = uiReaders;
    const { developerMode, allowCrossKeyboardKeyMappingWrite } = globalSettings;
    const { profileEditSource } = profilesReader;
    const isInternalProfile = profileEditSource.type === 'InternalProfile';
    const isDeviceConnected = deviceStatus.isConnected;

    const refProjectId = assignerModel.profileData.projectId;

    const deviceFirmwareId = deviceStatus.isConnected
      ? deviceStatus.deviceAttrs.firmwareId
      : '';
    const deviceProjectId = deviceStatus.isConnected
      ? deviceStatus.deviceAttrs.projectId
      : '';
    const isProjectMatched =
      (standardFirmwareIds.includes(deviceFirmwareId) &&
        deviceProjectId === refProjectId) ||
      allProjectPackageInfos.some(
        (info) =>
          info.projectId === refProjectId &&
          info.firmwares.some(
            (firmware) =>
              firmware.type === 'custom' &&
              firmware.customFirmwareId === deviceFirmwareId,
          ),
      );

    if (developerMode && allowCrossKeyboardKeyMappingWrite) {
      return isInternalProfile && isDeviceConnected;
    } else {
      return isInternalProfile && isDeviceConnected && isProjectMatched;
    }
  },
  get canSaveProfile(): boolean {
    const { profileEditSource } = profilesReader;
    return (
      profileEditSource.type === 'ProfileNewlyCreated' ||
      (profileEditSource.type === 'InternalProfile' &&
        assignerModel.checkDirty())
    );
  },
  get isCurrentProfileInternal(): boolean {
    return profilesReader.profileEditSource.type === 'InternalProfile';
  },
  get isMenuItemSaveEnabled(): boolean {
    const { profileEditSource } = profilesReader;
    return profileEditSource.type === 'ProfileNewlyCreated';
  },
};
