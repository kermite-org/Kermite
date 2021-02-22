import { Hook } from 'qx';
import { forceChangeFilePathExtension, IProfileEditSource } from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import {
  getFileNameFromPath,
  ipcAgent,
  ISelectorSource,
  makePlainSelectorOption,
  useLocal,
} from '~/ui-common';
import {
  modalAlert,
  modalConfirm,
  modalTextEdit,
} from '~/ui-common/fundamental/dialog/BasicModals';
import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';
import { callProfileSetupModal } from '~/ui-editor-page/EditorMainPart/views/modals/ProfileSetupModal';
import { keyboardConfigModel } from '~/ui-editor-page/ProfileManagement/models/KeyboardConfigModel';
import { ProfilesModel } from '~/ui-editor-page/ProfileManagement/models/ProfilesModel';

export interface IProfileManagementPartViewModel {
  createProfile(): void;
  loadProfile(name: string): void;
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
  if (res && res.profileName && res.targetProjectSig && res.layoutName) {
    const { profileName, targetProjectSig, layoutName } = res;
    const nameValid = await checkValidNewProfileName(profileName);
    if (nameValid) {
      const { origin, projectId } = getProjectOriginAndIdFromSig(
        targetProjectSig,
      );
      profilesModel.createProfile(profileName, origin, projectId, {
        type: 'blank',
        layoutName,
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

const onWriteButton = () => {
  profilesModel.saveProfile();
  keyboardConfigModel.writeConfigurationToDevice();
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

  const openExportingPresetSelectionModal = async () => {
    state.isPresetsModalOpen = true;
  };
  const closeExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = false;
  };

  const {
    editSource,
    allProfileNames,
    loadProfile,
    saveProfile,
  } = profilesModel;

  const canSave =
    editSource.type === 'InternalProfile' && profilesModel.checkDirty();

  const canWrite =
    editSource.type === 'InternalProfile' &&
    deviceStatus.isConnected &&
    deviceStatus.deviceAttrs?.projectId ===
      profilesModel.getCurrentProfileProjectId();

  return {
    createProfile,
    loadProfile,
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
  };
}
