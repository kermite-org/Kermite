import { Hook } from 'qx';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import {
  ISelectorSource,
  makePlainSelectorOption,
  useLocal,
} from '~/ui-common';
import {
  modalAlert,
  modalConfirm,
  modalTextEdit,
} from '~/ui-common/fundamental/dialog/BasicModals';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { editorModel } from '~/ui-editor-page/EditorMainPart/models/EditorModel';
import { callProfileSetupModal } from '~/ui-editor-page/EditorMainPart/views/modals/ProfileSetupModal';
import { keyboardConfigModel } from '~/ui-editor-page/ProfileManagement/models/KeyboardConfigModel';
import { ProfilesModel } from '~/ui-editor-page/ProfileManagement/models/ProfilesModel';

export interface IProfileManagementPartViewModel {
  currentProfileName: string;
  allProfileNames: string[];
  createProfile(): void;
  loadProfile(name: string): void;
  saveProfile(): void;
  renameProfile(): void;
  copyProfile(): void;
  deleteProfile(): void;
  openConfiguration(): void;
  onLaunchButton(): void;
  profileSelectorSource: ISelectorSource;
  isExportingPresetSelectionModalOpen: boolean;
  openExportingPresetSelectionModal(): void;
  closeExportingPresetSelectionModal(): void;
  saveProfileAsPreset(projectId: string, presetName: string): void;
  currentProfileProjectId: string;
}

export const profilesModel = new ProfilesModel(editorModel);

export function makeProfileManagementPartViewModel(): IProfileManagementPartViewModel {
  Hook.useEffect(() => {
    profilesModel.initialize();
    return () => profilesModel.finalize();
  }, []);

  const state = useLocal({ isPresetsModalOpen: false });

  const openExportingPresetSelectionModal = async () => {
    state.isPresetsModalOpen = true;
  };
  const closeExportingPresetSelectionModal = () => {
    state.isPresetsModalOpen = false;
  };

  const {
    currentProfileName,
    allProfileNames,
    loadProfile,
    saveProfile,
  } = profilesModel;

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
      defaultText: currentProfileName,
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
    const newProfileName = await inputNewProfileName('Rename Profile');
    if (newProfileName) {
      profilesModel.renameProfile(newProfileName);
    }
  };

  const copyProfile = async () => {
    const newProfileName = await inputNewProfileName('Copy Profile');
    if (newProfileName) {
      profilesModel.copyProfile(newProfileName);
    }
  };

  const deleteProfile = async () => {
    const ok = await modalConfirm({
      message: `Profile ${currentProfileName} will be deleted. Are you sure?`,
      caption: 'Delete Profile',
    });
    if (ok) {
      profilesModel.deleteProfile();
    }
  };

  const openConfiguration = () => {
    uiStatusModel.status.profileConfigModalVisible = true;
  };

  const onLaunchButton = () => {
    profilesModel.saveProfile();
    keyboardConfigModel.writeConfigurationToDevice();
  };

  return {
    currentProfileName,
    allProfileNames,
    createProfile,
    loadProfile,
    saveProfile,
    renameProfile,
    copyProfile,
    deleteProfile,
    openConfiguration,
    onLaunchButton,
    profileSelectorSource: {
      options: allProfileNames.map(makePlainSelectorOption),
      value: currentProfileName,
      setValue: loadProfile,
    },
    isExportingPresetSelectionModalOpen: state.isPresetsModalOpen,
    openExportingPresetSelectionModal,
    closeExportingPresetSelectionModal,
    saveProfileAsPreset: profilesModel.exportProfileAsProjectPreset,
    currentProfileProjectId: editorModel.loadedPorfileData.projectId,
  };
}
