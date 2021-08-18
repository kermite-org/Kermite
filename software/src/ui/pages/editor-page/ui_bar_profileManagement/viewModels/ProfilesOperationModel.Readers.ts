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
    const { editSource } = profilesReader;
    const isInternalProfile = editSource.type === 'InternalProfile';
    const isDeviceConnected = deviceStatus.isConnected;
    const refProjectId = editorModel.profileData.projectId;
    const allProjectInfos = uiStateReader.allProjectPackageInfos;
    const standardFirmwareIds = ['HCV52K', 'HCV52L'];
    const deviceFirmwareId = deviceStatus.deviceAttrs?.firmwareId || '';
    const isProjectMatched = allProjectInfos.some(
      (info) =>
        info.projectId === refProjectId &&
        info.firmwares.some(
          (firmware) =>
            ('standardFirmwareDefinition' in firmware &&
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
    const { editSource } = profilesReader;
    return (
      editSource.type === 'ProfileNewlyCreated' ||
      editSource.type === 'ExternalFile' ||
      (editSource.type === 'InternalProfile' && editorModel.checkDirty(false))
    );
  },
  get isCurrentProfileInternal(): boolean {
    return profilesReader.editSource.type === 'InternalProfile';
  },
  get isMenuItemSaveEnabled(): boolean {
    const { editSource } = profilesReader;
    return (
      editSource.type === 'ProfileNewlyCreated' ||
      editSource.type === 'ExternalFile'
    );
  },
};
