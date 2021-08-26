import { uiStateReader } from '~/ui/commonStore';
import { profilesReader } from '~/ui/pages/editor-page/models';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

export const profilesOperationReader = {
  get CanWriteKeyMappingToDevice(): boolean {
    const { deviceStatus } = uiStateReader;
    const {
      developerMode,
      allowCrossKeyboardKeyMappingWrite,
    } = uiStateReader.globalSettings;
    const { profileEditSource } = profilesReader;
    const isInternalProfile = profileEditSource.type === 'InternalProfile';
    const isDeviceConnected = deviceStatus.isConnected;
    const refProjectId = editorModel.profileData.projectId;
    const allProjectInfos = uiStateReader.allProjectPackageInfos;
    const standardFirmwareIds = ['HCV52K', 'HCV52L'];
    const deviceFirmwareId = deviceStatus.isConnected
      ? deviceStatus.deviceAttrs.firmwareId
      : '';
    const isProjectMatched = allProjectInfos.some(
      (info) =>
        info.projectId === refProjectId &&
        info.firmwares.some(
          (firmware) =>
            ('standardFirmwareConfig' in firmware &&
              standardFirmwareIds.includes(deviceFirmwareId)) ||
            ('customFirmwareId' in firmware &&
              firmware.customFirmwareId === deviceFirmwareId),
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
      profileEditSource.type === 'ExternalFile' ||
      (profileEditSource.type === 'InternalProfile' && editorModel.checkDirty())
    );
  },
  get isCurrentProfileInternal(): boolean {
    return profilesReader.profileEditSource.type === 'InternalProfile';
  },
  get isMenuItemSaveEnabled(): boolean {
    const { profileEditSource } = profilesReader;
    return (
      profileEditSource.type === 'ProfileNewlyCreated' ||
      profileEditSource.type === 'ExternalFile'
    );
  },
};
