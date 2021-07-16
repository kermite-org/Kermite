import { Hook } from 'qx';
import {
  forceChangeFilePathExtension,
  IGlobalSettings,
  IKeyboardDeviceStatus,
  IProfileData,
  IProfileEditSource,
} from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getFileNameFromPath,
  ipcAgent,
  ISelectorSource,
  makePlainSelectorOption,
  modalAlert,
  modalConfirm,
  modalTextEdit,
  texts,
  uiStatusModel,
  useDeviceStatusModel,
  useGlobalSettingsFetch,
  useLocal,
} from '~/ui/common';
import { useKeyboardBehaviorModeModel } from '~/ui/common/sharedModels/KeyboardBehaviorModeModel';
import { editorModel } from '~/ui/editor-page/models/EditorModel';
import { ProfilesModel } from '~/ui/editor-page/models/ProfilesModel';
import { editorPageModel } from '~/ui/editor-page/models/editorPageModel';
import { callProfileSetupModal } from '~/ui/editor-page/ui_modal_profileSetup/ProfileSetupModal';

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
}

export const profilesModel = new ProfilesModel(editorModel);

function makeProfileSelectionSource(
  allProfileNames: string[],
  editSource: IProfileEditSource,
  loadProfile: (profileName: string) => void,
): ISelectorSource {
  if (editSource.type === 'NewlyCreated') {
    return {
      options: [
        { label: '(untitled)', value: '__NEWLY_CREATED_PROFILE__' },
        ...allProfileNames.map(makePlainSelectorOption),
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
        ...allProfileNames.map(makePlainSelectorOption),
      ],
      value: '__EXTERNALY_LOADED_PROFILE__',
      setValue: loadProfile,
    };
  } else {
    return {
      options: allProfileNames.map(makePlainSelectorOption),
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
    profilesModel.allProfileNames.find((name) => name.toLowerCase() === lowered)
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
      profilesModel.createProfile(profileName, origin, projectId, {
        type: 'blank',
        layoutName: layoutKey,
      });
    }
  }
};

const inputNewProfileName = async (
  caption: string,
): Promise<string | undefined> => {
  const newProfileName = await modalTextEdit({
    message: texts.label_assigner_profileNameEditModal_newProfileName,
    defaultText: profilesModel.currentProfileName,
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
  const newProfileName = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleRename,
  );
  if (newProfileName) {
    profilesModel.renameProfile(newProfileName);
  }
};

const copyProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const newProfileName = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleCopy,
  );
  if (newProfileName) {
    profilesModel.copyProfile(newProfileName);
  }
};

const deleteProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const ok = await modalConfirm({
    message: texts.label_assigner_confirmModal_deleteProfile_modalMessage.replace(
      '{PROFILE_NAME}',
      profilesModel.currentProfileName,
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
  const newProfileName = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleSave,
  );
  if (newProfileName) {
    profilesModel.saveUnsavedProfileAs(newProfileName);
  }
};

const openConfiguration = () => {
  uiStatusModel.status.profileConfigModalVisible = true;
};

const onSaveButton = () => {
  const editSourceType = profilesModel.editSource.type;
  if (editSourceType === 'NewlyCreated' || editSourceType === 'ExternalFile') {
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
  const { allowCrossKeyboardKeyMappingWrite } = globalSettings;
  const { editSource } = profilesModel;

  const isInternalProfile = editSource.type === 'InternalProfile';

  const isDeviceConnected = deviceStatus.isConnected;

  const refProjectId = editorModel.loadedPorfileData.projectId;
  const isProjectMatched = deviceStatus.deviceAttrs?.projectId === refProjectId;

  if (allowCrossKeyboardKeyMappingWrite) {
    return isInternalProfile && isDeviceConnected;
  } else {
    return isInternalProfile && isDeviceConnected && isProjectMatched;
  }
}

function getCanSave(): boolean {
  const { editSource, checkDirty } = profilesModel;
  return (
    editSource.type === 'NewlyCreated' ||
    editSource.type === 'ExternalFile' ||
    (editSource.type === 'InternalProfile' && checkDirty())
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
  Hook.useEffect(profilesModel.startPageSession, []);

  const deviceStatus = useDeviceStatusModel();

  const globalSettings = useGlobalSettingsFetch();

  const { isSimulatorMode } = useKeyboardBehaviorModeModel();

  const { editSource, allProfileNames, saveProfile } = profilesModel;

  const state = useLocal({ isPresetsModalOpen: false });

  const openExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = true;
  };
  const closeExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = false;
  };

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
    isExportingPresetSelectionModalOpen: state.isPresetsModalOpen,
    openExportingPresetSelectionModal,
    closeExportingPresetSelectionModal,
    saveProfileAsPreset: profilesModel.exportProfileAsProjectPreset,
    currentProfileProjectId: editorModel.loadedPorfileData.projectId,
    isCurrentProfileInternal: editSource.type === 'InternalProfile',
    handleSaveUnsavedProfile,
    handleImportFromFile,
    handleExportToFile,
    openUserProfilesFolder,
    toggleRoutingPanel,
  };
}
