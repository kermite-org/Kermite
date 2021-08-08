import { useEffect } from 'qx';
import {
  forceChangeFilePathExtension,
  IGlobalSettings,
  IKeyboardDeviceStatus,
  IProfileData,
  IProfileEditSource,
} from '~/shared';
import {
  getProjectOriginAndIdFromSig,
  joinProjectProfileName,
  splitProjectProfileName,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, ISelectorOption, ISelectorSource, texts } from '~/ui/base';
import {
  globalSettingsModel,
  uiStatusModel,
  useKeyboardBehaviorModeModel,
  useKeyboardDeviceStatus,
} from '~/ui/commonModels';
import { useModalDisplayStateModel } from '~/ui/commonModels/GeneralUiStateModels';
import { modalAlert, modalConfirm, modalTextEdit } from '~/ui/components';
import { getFileNameFromPath } from '~/ui/helpers';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { ProfilesModel } from '~/ui/pages/editor-page/models/ProfilesModel';
import { editorPageModel } from '~/ui/pages/editor-page/models/editorPageModel';
import { callProfileSetupModal } from '~/ui/pages/editor-page/ui_modal_profileSetup/ProfileSetupModal';

export interface IProfileManagementPartViewModel {
  createProfile(): void;
  saveProfile(): void;
  renameProfile(): void;
  copyProfile(): void;
  deleteProfile(): void;
  openConfiguration(): void;
  canSave: boolean;
  canWrite: boolean;
  onSaveButton(): void;
  onWriteButton(): void;
  profileSelectorSource: ISelectorSource;
  isExportingPresetSelectionModalOpen: boolean;
  openExportingPresetSelectionModal(): void;
  closeExportingPresetSelectionModal(): void;
  saveProfileAsPreset(projectId: string, presetName: string): void;
  currentProfileProjectId: string;
  handleImportFromFile(): void;
  handleExportToFile(): void;
  isCurrentProfileInternal: boolean;
  handleSaveUnsavedProfile(): void;
  openUserProfilesFolder(): void;

  toggleRoutingPanel(): void;
  isMenuItemSaveEnabled: boolean;
  isEditProfileAvailable: boolean;
}

export const profilesModel = new ProfilesModel(editorModel);

function makeProfileNameSelectorOption(profileName: string): ISelectorOption {
  const omitFolder = !!globalSettingsModel.globalSettings.globalProjectId;
  return {
    value: profileName,
    label: omitFolder ? profileName.replace(/^.*\//, '') : profileName,
  };
}

function makeProfileSelectionSource(
  allProfileNames: string[],
  editSource: IProfileEditSource,
  loadProfile: (profileName: string) => void,
): ISelectorSource {
  if (editSource.type === 'NoProfilesAvailable') {
    return {
      options: [],
      value: '',
      setValue: () => {},
    };
  } else if (editSource.type === 'ProfileNewlyCreated') {
    return {
      options: [
        { label: '(untitled)', value: '__NEWLY_CREATED_PROFILE__' },
        ...allProfileNames.map(makeProfileNameSelectorOption),
      ],
      value: '__NEWLY_CREATED_PROFILE__',
      setValue: loadProfile,
    };
  } else if (editSource.type === 'ExternalFile') {
    return {
      options: [
        {
          label: `(file)${getFileNameFromPath(editSource.filePath)}`,
          value: '__EXTERNALY_LOADED_PROFILE__',
        },
        ...allProfileNames.map(makeProfileNameSelectorOption),
      ],
      value: '__EXTERNALY_LOADED_PROFILE__',
      setValue: loadProfile,
    };
  } else {
    return {
      options: allProfileNames.map(makeProfileNameSelectorOption),
      value: editSource.profileName,
      setValue: loadProfile,
    };
  }
}

const checkValidNewProfileName = async (
  newProfileName: string,
): Promise<boolean> => {
  if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
    await modalAlert(
      `${newProfileName} is not for valid filename. operation cancelled.`,
    );
    return false;
  }

  const lowered = newProfileName.toLowerCase();
  if (
    profilesModel.allProfileEntries.find(
      (it) => it.profileName.toLowerCase() === lowered,
    )
  ) {
    await modalAlert(
      `${newProfileName} is already exists. operation cancelled.`,
    );
    return false;
  }
  return true;
};

const createProfile = async () => {
  const res = await callProfileSetupModal(undefined);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (res && res.profileName && res.projectKey && res.layoutKey) {
    const { profileName, projectKey, layoutKey } = res;
    const nameValid = await checkValidNewProfileName(profileName);
    if (nameValid) {
      const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
      const fullProfileName = joinProjectProfileName(projectId, profileName);
      profilesModel.createProfile(fullProfileName, origin, projectId, {
        type: 'blank',
        layoutName: layoutKey,
      });
    }
  }
};

const inputNewProfileName = async (
  caption: string,
  defaultText: string,
): Promise<string | undefined> => {
  const newProfileName = await modalTextEdit({
    message: texts.label_assigner_profileNameEditModal_newProfileName,
    defaultText,
    caption,
  });
  if (newProfileName) {
    const nameValid = await checkValidNewProfileName(newProfileName);
    if (nameValid) {
      return newProfileName;
    }
  }
  return undefined;
};

const renameProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const { folderPart, filePart } = splitProjectProfileName(
    profilesModel.currentProfileName,
  );
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleRename,
    filePart,
  );
  if (newFilePart) {
    const newProfileName = joinProjectProfileName(folderPart, newFilePart);
    profilesModel.renameProfile(newProfileName);
  }
};

const copyProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const { folderPart, filePart } = splitProjectProfileName(
    profilesModel.currentProfileName,
  );
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleCopy,
    filePart,
  );
  if (newFilePart) {
    const newProfileName = joinProjectProfileName(folderPart, newFilePart);
    profilesModel.copyProfile(newProfileName);
  }
};

const deleteProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const { filePart } = splitProjectProfileName(
    profilesModel.currentProfileName,
  );
  const ok = await modalConfirm({
    message: texts.label_assigner_confirmModal_deleteProfile_modalMessage.replace(
      '{PROFILE_NAME}',
      filePart,
    ),
    caption: texts.label_assigner_confirmModal_deleteProfile_modalTitle,
  });
  if (ok) {
    profilesModel.deleteProfile();
  }
};

const handleSaveUnsavedProfile = async () => {
  if (profilesModel.editSource.type === 'InternalProfile') {
    return;
  }
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleSave,
    profilesModel.currentProfileName,
  );
  if (newFilePart) {
    const projectId = editorModel.profileData.projectId;
    const newProfileName = joinProjectProfileName(projectId, newFilePart);
    profilesModel.saveUnsavedProfileAs(newProfileName);
  }
};

const openConfiguration = () => {
  uiStatusModel.status.profileConfigModalVisible = true;
};

const onSaveButton = () => {
  const editSourceType = profilesModel.editSource.type;
  if (
    editSourceType === 'ProfileNewlyCreated' ||
    editSourceType === 'ExternalFile'
  ) {
    handleSaveUnsavedProfile();
  } else {
    profilesModel.saveProfile();
  }
};

const handleImportFromFile = async () => {
  const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
  if (filePath) {
    profilesModel.importFromFile(filePath);
  }
};

const handleExportToFile = async () => {
  const filePath = await ipcAgent.async.file_getSaveJsonFilePathWithDialog();
  if (filePath) {
    const modFilePath = forceChangeFilePathExtension(filePath, '.profile.json');
    profilesModel.exportToFile(modFilePath);
  }
};

const simulatorProfileUpdator = new (class {
  private profileStringified: string = '';

  affectToSimulatorIfEditProfileChanged(
    profile: IProfileData,
    isSimulatorMode: boolean,
  ) {
    if (isSimulatorMode) {
      const str = JSON.stringify(profile);
      if (str !== this.profileStringified) {
        this.profileStringified = str;
        ipcAgent.async.simulator_postSimulationTargetProfile(profile);
      }
    }
  }
})();

function getCanWrite(
  deviceStatus: IKeyboardDeviceStatus,
  globalSettings: IGlobalSettings,
): boolean {
  const { developerMode, allowCrossKeyboardKeyMappingWrite } = globalSettings;
  const { editSource } = profilesModel;

  const isInternalProfile = editSource.type === 'InternalProfile';

  const isDeviceConnected = deviceStatus.isConnected;

  const refProjectId = editorModel.profileData.projectId;
  const isProjectMatched = deviceStatus.deviceAttrs?.projectId === refProjectId;

  if (developerMode && allowCrossKeyboardKeyMappingWrite) {
    return isInternalProfile && isDeviceConnected;
  } else {
    return isInternalProfile && isDeviceConnected && isProjectMatched;
  }
}

function getCanSave(): boolean {
  const { editSource } = profilesModel;
  return (
    editSource.type === 'ProfileNewlyCreated' ||
    editSource.type === 'ExternalFile' ||
    (editSource.type === 'InternalProfile' && profilesModel.checkDirty())
  );
}

const loadProfile = async (profileName: string) => {
  if (profilesModel.checkDirty()) {
    const ok = await modalConfirm({
      caption: texts.label_assigner_confirmModal_loadProfile_modalTitle,
      message: texts.label_assigner_confirmModal_loadProfile_modalMessage,
    });
    if (!ok) {
      return;
    }
  }
  profilesModel.loadProfile(profileName);
};

const openUserProfilesFolder = async () => {
  await ipcAgent.async.profile_openUserProfilesFolder();
};

const onWriteButton = async () => {
  await profilesModel.saveProfile();
  uiStatusModel.setLoading();
  const done = await ipcAgent.async.config_writeKeyMappingToDevice();
  uiStatusModel.clearLoading();
  // todo: トーストにする?
  if (done) {
    await modalAlert('write succeeded.');
  } else {
    await modalAlert('write failed.');
  }
};

const toggleRoutingPanel = () => {
  editorPageModel.routingPanelVisible = !editorPageModel.routingPanelVisible;
};

export function makeProfileManagementPartViewModel(): IProfileManagementPartViewModel {
  useEffect(profilesModel.startPageSession, []);

  const { editSource, allProfileEntries, saveProfile } = profilesModel;

  const allProfileNames = allProfileEntries.map((it) => it.profileName);

  const deviceStatus = useKeyboardDeviceStatus();

  const { globalSettings } = globalSettingsModel;

  const { isSimulatorMode } = useKeyboardBehaviorModeModel();

  const presetsModalDisplayStateModel = useModalDisplayStateModel();

  const canWrite = getCanWrite(deviceStatus, globalSettings);

  const canSave = getCanSave();

  simulatorProfileUpdator.affectToSimulatorIfEditProfileChanged(
    editorModel.profileData,
    isSimulatorMode,
  );

  return {
    createProfile,
    saveProfile,
    renameProfile,
    copyProfile,
    deleteProfile,
    openConfiguration,
    canSave,
    canWrite,
    onSaveButton,
    onWriteButton,
    profileSelectorSource: makeProfileSelectionSource(
      allProfileNames,
      editSource,
      loadProfile,
    ),
    isExportingPresetSelectionModalOpen: presetsModalDisplayStateModel.isOpen,
    openExportingPresetSelectionModal: presetsModalDisplayStateModel.open,
    closeExportingPresetSelectionModal: presetsModalDisplayStateModel.close,
    saveProfileAsPreset: profilesModel.exportProfileAsProjectPreset,
    currentProfileProjectId: editorModel.loadedPorfileData.projectId,
    isCurrentProfileInternal: editSource.type === 'InternalProfile',
    handleSaveUnsavedProfile,
    handleImportFromFile,
    handleExportToFile,
    openUserProfilesFolder,
    toggleRoutingPanel,
    isMenuItemSaveEnabled:
      editSource.type === 'ProfileNewlyCreated' ||
      editSource.type === 'ExternalFile',
    isEditProfileAvailable: profilesModel.isEditProfileAvailable,
  };
}
