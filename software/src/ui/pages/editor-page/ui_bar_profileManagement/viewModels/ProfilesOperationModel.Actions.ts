import { asyncRerender } from 'qx';
import { forceChangeFilePathExtension } from '~/shared';
import { getOriginAndProjectIdFromProjectKey } from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, texts } from '~/ui/base';
import { commitUiState, uiActions } from '~/ui/commonStore';
import { modalAlert, modalConfirm } from '~/ui/components';
import { inputSavingResourceName } from '~/ui/helpers';
import { editorModel } from '~/ui/pages/editor-core/models/EditorModel';
import { profilesActions, profilesReader } from '~/ui/pages/editor-page/models';
import { editorPageModel } from '~/ui/pages/editor-page/models/editorPageModel';
import { callProfileSetupModal } from '~/ui/pages/editor-page/ui_modal_profileSetup/ProfileSetupModal';

async function checkShallLoadData(): Promise<boolean> {
  if (!editorModel.checkDirty()) {
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
  defaultText: string,
): Promise<string | undefined> => {
  const existingProfileNames = profilesReader.allProfileEntries
    .filter((it) => it.projectId === projectId)
    .map((it) => it.profileName);
  return await inputSavingResourceName({
    modalTitle,
    modalMessage: texts.label_assigner_profileNameEditModal_newProfileName,
    resourceTypeNameText: 'profile name',
    defaultText,
    existingResourceNames: existingProfileNames,
  });
};

const renameProfile = async () => {
  const profileEntry = profilesReader.currentProfileEntry;
  if (profileEntry) {
    const newProfileName = await inputNewProfileName(
      texts.label_assigner_profileNameEditModal_modalTitleRename,
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
      texts.label_assigner_profileNameEditModal_modalTitleCopy,
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
      message:
        texts.label_assigner_confirmModal_deleteProfile_modalMessage.replace(
          '{PROFILE_NAME}',
          profileEntry.profileName,
        ),
      caption: texts.label_assigner_confirmModal_deleteProfile_modalTitle,
    });
    if (ok) {
      profilesActions.deleteProfile();
    }
  }
};

const handleSaveUnsavedProfile = async () => {
  if (profilesReader.profileEditSource.type !== 'InternalProfile') {
    const projectId = editorModel.profileData.projectId;
    const newProfileName = await inputNewProfileName(
      texts.label_assigner_profileNameEditModal_modalTitleSave,
      projectId,
      '',
    );
    if (newProfileName !== undefined) {
      profilesActions.saveUnsavedProfileAs(newProfileName);
    }
  }
};

const openConfiguration = () => {
  commitUiState({ profileConfigModalVisible: true });
};

const onSaveButton = () => {
  const editSourceType = profilesReader.profileEditSource.type;
  if (
    editSourceType === 'ProfileNewlyCreated' ||
    editSourceType === 'ExternalFile'
  ) {
    handleSaveUnsavedProfile();
  } else {
    profilesActions.saveProfile();
  }
};

const handleImportFromFile = async () => {
  if (!(await checkShallLoadData())) {
    return;
  }
  const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
  if (filePath) {
    profilesActions.importFromFile(filePath);
  }
};

const handleExportToFile = async () => {
  const filePath = await ipcAgent.async.file_getSaveJsonFilePathWithDialog();
  if (filePath) {
    const modFilePath = forceChangeFilePathExtension(filePath, '.profile.json');
    await profilesActions.exportToFile(modFilePath);
    modalConfirm({ caption: 'export to file', message: 'file saved.' });
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
  editorPageModel.routingPanelVisible = !editorPageModel.routingPanelVisible;
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
