import { asyncRerender } from 'alumina';
import { fileExtensions } from '~/shared';
import { getOriginAndProjectIdFromProjectKey } from '~/shared/funcs/domainRelatedHelpers';
import { ipcAgent, texts } from '~/ui/base';
import { modalAlert, modalConfirm } from '~/ui/components';
import { assignerModel } from '~/ui/featureEditors';
import {
  profilesActions,
  profilesReader,
} from '~/ui/pages/assignerPage/models';
import { callProfileSetupModal } from '~/ui/pages/assignerPage/ui_modal_profileSetup/ProfileSetupModal';
import { commitUiState, uiActions, uiState } from '~/ui/store';
import { resourceManagementUtils } from '~/ui/utils';

async function checkShallLoadData(): Promise<boolean> {
  if (!assignerModel.checkDirty()) {
    return true;
  }
  return await modalConfirm({
    message: 'Unsaved changes will be lost. Are you OK?',
    caption: 'Load',
  });
}

const createProfile = async () => {
  if (!(await checkShallLoadData())) {
    return;
  }
  asyncRerender();
  const res = await callProfileSetupModal(undefined);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (res && res.projectKey && res.layoutKey) {
    const { projectKey, layoutKey } = res;
    const { origin, projectId } =
      getOriginAndProjectIdFromProjectKey(projectKey);
    profilesActions.createProfileUnnamed(origin, projectId, {
      type: 'blank',
      layoutName: layoutKey,
    });
  }
};

const inputNewProfileName = async (
  modalTitle: string,
  projectId: string,
  currentName: string,
  allowSavingWithCurrentName?: boolean,
): Promise<string | undefined> => {
  const existingProfileNames = profilesReader.allProfileEntries
    .filter((it) => it.projectId === projectId)
    .map((it) => it.profileName);
  return await resourceManagementUtils.inputSavingResourceName({
    modalTitle,
    modalMessage: texts.assignerProfileNameEditModal.newProfileName,
    resourceTypeNameText: 'profile name',
    currentName,
    existingResourceNames: existingProfileNames,
    allowSavingWithCurrentName,
  });
};

const renameProfile = async () => {
  const profileEntry = profilesReader.currentProfileEntry;
  if (profileEntry) {
    const newProfileName = await inputNewProfileName(
      texts.assignerProfileNameEditModal.modalTitleRename,
      profileEntry.projectId,
      profileEntry.profileName,
    );
    if (newProfileName) {
      profilesActions.renameProfile(newProfileName);
    }
  }
};

const copyProfile = async () => {
  const profileEntry = profilesReader.currentProfileEntry;
  if (profileEntry) {
    const newProfileName = await inputNewProfileName(
      texts.assignerProfileNameEditModal.modalTitleCopy,
      profileEntry.projectId,
      profileEntry.profileName,
    );
    if (newProfileName) {
      profilesActions.copyProfile(newProfileName);
    }
  }
};

const deleteProfile = async () => {
  const profileEntry = profilesReader.currentProfileEntry;
  if (profileEntry) {
    const ok = await modalConfirm({
      message: texts.assignerConfirmModal.deleteProfile_modalMessage.replace(
        '{PROFILE_NAME}',
        profileEntry.profileName,
      ),
      caption: texts.assignerConfirmModal.loadProfile_modalTitle,
    });
    if (ok) {
      profilesActions.deleteProfile();
    }
  }
};

const handleSaveUnsavedProfile = async () => {
  const { profileEditSource } = profilesReader;
  if (profileEditSource.type !== 'InternalProfile') {
    const projectId = assignerModel.profileData.projectId;

    const defaultSavingName =
      (profileEditSource.type === 'ProfileNewlyCreated' &&
        profileEditSource.sourceProfileName) ||
      '';
    const newProfileName = await inputNewProfileName(
      texts.assignerProfileNameEditModal.modalTitleSave,
      projectId,
      defaultSavingName,
      true,
    );
    if (newProfileName !== undefined) {
      const isAlreadyExist = profilesReader.allProfileEntries.find(
        (it) => it.projectId === projectId && it.profileName === newProfileName,
      );
      if (isAlreadyExist) {
        const isOk = await modalConfirm({
          caption: 'save',
          message: `Profile ${newProfileName} already exists. Overwrite it?`,
        });
        if (!isOk) {
          return;
        }
      }

      profilesActions.saveUnsavedProfileAs(newProfileName);
    }
  }
};

const openConfiguration = () => {
  commitUiState({ profileConfigModalVisible: true });
};

const onSaveButton = () => {
  const editSourceType = profilesReader.profileEditSource.type;
  if (editSourceType === 'ProfileNewlyCreated') {
    handleSaveUnsavedProfile();
  } else {
    profilesActions.saveProfile();
  }
};

const handleImportFromFile = async () => {
  if (!(await checkShallLoadData())) {
    return;
  }
  const fileHandle = await ipcAgent.async.file_getOpenJsonFilePathWithDialog(
    fileExtensions.profile,
  );
  if (fileHandle) {
    await profilesActions.importFromFile(fileHandle);
  }
};

const handleExportToFile = async () => {
  const es = profilesReader.profileEditSource;
  const profileName =
    es.type === 'InternalProfile' ? es.profileEntry.profileName : 'untitled';

  const fileName = `${profileName.toLowerCase()}${fileExtensions.profile}`;
  const fileHandle = await ipcAgent.async.file_getSaveJsonFilePathWithDialog(
    fileExtensions.profile,
    fileName,
  );
  if (fileHandle) {
    await profilesActions.exportToFile(fileHandle);
    if (fileHandle.isPreSelectedFile) {
      await modalConfirm({ caption: 'export to file', message: 'file saved.' });
    }
  }
};

const openUserProfilesFolder = () => {
  profilesActions.openUserProfilesFolder();
};

const onWriteButton = async () => {
  await profilesActions.saveProfile();
  uiActions.setLoading();
  const done = await ipcAgent.async.config_writeKeyMappingToDevice();
  uiActions.clearLoading();
  // todo: トーストにする?
  if (done) {
    await modalAlert('write succeeded.');
  } else {
    await modalAlert('write failed.');
  }
};

const toggleRoutingPanel = () => {
  commitUiState({
    profileRoutingPanelVisible: !uiState.profileRoutingPanelVisible,
  });
};

export const profilesOperationActions = {
  createProfile,
  renameProfile,
  copyProfile,
  deleteProfile,
  openConfiguration,
  onSaveButton,
  handleImportFromFile,
  handleExportToFile,
  openUserProfilesFolder,
  onWriteButton,
  toggleRoutingPanel,
  handleSaveUnsavedProfile,
};
