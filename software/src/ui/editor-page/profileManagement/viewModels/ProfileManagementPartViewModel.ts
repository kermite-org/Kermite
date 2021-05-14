import { asyncRerender, Hook } from 'qx';
import { forceChangeFilePathExtension, IProfileEditSource } from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getFileNameFromPath,
  ipcAgent,
  ISelectorSource,
  makePlainSelectorOption,
  modalAlert,
  modalAlertTop,
  modalConfirm,
  modalTextEdit,
  uiStatusModel,
  useDeviceStatusModel,
  useLocal,
} from '~/ui/common';
import { useKeyboardBehaviorModeModel } from '~/ui/common/sharedModels/KeyboardBehaviorModeModel';
import { editorModel } from '~/ui/editor-page/editorMainPart/models/EditorModel';
import { callProfileSetupModal } from '~/ui/editor-page/editorMainPart/views/modals/ProfileSetupModal';
import { editorPageModel } from '~/ui/editor-page/editorPageModel';
import { ProfilesModel } from '~/ui/editor-page/profileManagement/models/ProfilesModel';

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
  if (profilesModel.allProfileNames.includes(newProfileName)) {
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
    message: 'New Profile Name',
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
  const newProfileName = await inputNewProfileName('Rename Profile');
  if (newProfileName) {
    profilesModel.renameProfile(newProfileName);
  }
};

const copyProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const newProfileName = await inputNewProfileName('Copy Profile');
  if (newProfileName) {
    profilesModel.copyProfile(newProfileName);
  }
};

const deleteProfile = async () => {
  if (profilesModel.editSource.type !== 'InternalProfile') {
    return;
  }
  const ok = await modalConfirm({
    message: `Profile ${profilesModel.currentProfileName} will be deleted. Are you sure?`,
    caption: 'Delete Profile',
  });
  if (ok) {
    profilesModel.deleteProfile();
  }
};

const handleSaveUnsavedProfile = async () => {
  if (profilesModel.editSource.type === 'InternalProfile') {
    return;
  }
  const newProfileName = await inputNewProfileName('Save Profile');
  if (newProfileName) {
    profilesModel.saveUnsavedProfileAs(newProfileName);
  }
};

const openConfiguration = () => {
  uiStatusModel.status.profileConfigModalVisible = true;
};

const onSaveButton = () => {
  profilesModel.saveProfile();
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

export function makeProfileManagementPartViewModel(): IProfileManagementPartViewModel {
  Hook.useEffect(profilesModel.startPageSession, []);

  const deviceStatus = useDeviceStatusModel();

  const state = useLocal({ isPresetsModalOpen: false });

  const openExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = true;
  };
  const closeExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = false;
  };

  const { editSource, allProfileNames, saveProfile } = profilesModel;

  const canSave =
    editSource.type === 'InternalProfile' && profilesModel.checkDirty();

  // todo: デフォルトではProjetIDが異なるデバイスには書き込めないようにする
  // const refProjectId = profilesModel.getCurrentProfileProjectId();
  const canWrite =
    editSource.type === 'InternalProfile' && deviceStatus.isConnected;
  // (refProjectId
  //   ? deviceStatus.deviceAttrs?.projectId === refProjectId
  //   : true);

  const loadProfile = async (profileName: string) => {
    if (profilesModel.checkDirty()) {
      const ok = await modalConfirm({
        caption: 'Load Profile',
        message: 'Unsaved changes will be lost. Are you ok?',
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

  const { behaviorMode } = useKeyboardBehaviorModeModel();

  const onWriteButton = async () => {
    await profilesModel.saveProfile();
    if (behaviorMode === 'Standalone') {
      const done = await ipcAgent.async.config_writeKeyMappingToDevice();
      // todo: トーストにする
      if (done) {
        await modalAlertTop('write succeeded.');
      } else {
        await modalAlertTop('write failed.');
      }
    } else {
      asyncRerender();
      await modalAlertTop('write succeeded. (simulator mode)');
    }
  };

  const toggleRoutingPanel = () => {
    editorPageModel.routingPanelVisible = !editorPageModel.routingPanelVisible;
  };

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
