import { asyncRerender } from 'qx';
import { forceChangeFilePathExtension } from '~/shared';
import { getProjectOriginAndIdFromSig } from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, texts } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { modalAlert, modalConfirm, modalTextEdit } from '~/ui/components';
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

const checkValidNewProfileName = async (
  projectId: string,
  newProfileName: string,
): Promise<boolean> => {
  // eslint-disable-next-line no-irregular-whitespace
  // eslint-disable-next-line no-misleading-character-class
  if (!newProfileName.match(/^[^/./\\:*?"<>| \u3000\u0e49]+$/)) {
    await modalAlert(
      `${newProfileName} is not a valid profile name. operation cancelled.`,
    );
    return false;
  }

  const isExist = profilesReader.allProfileEntries.some(
    (it) =>
      it.projectId === projectId &&
      it.profileName.toLowerCase() === newProfileName.toLowerCase(),
  );
  if (isExist) {
    await modalAlert(
      `${newProfileName} is already exists. operation cancelled.`,
    );
    return false;
  }
  return true;
};

const createProfile = async () => {
  if (!(await checkShallLoadData())) {
    return;
  }
  asyncRerender();
  const res = await callProfileSetupModal(undefined);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (res && res.projectKey && res.layoutKey) {
    const { projectKey, layoutKey } = res;
    const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
    profilesActions.createProfileUnnamed(origin, projectId, {
      type: 'blank',
      layoutName: layoutKey,
    });
  }
};

const inputNewProfileName = async (
  caption: string,
  projectId: string,
  defaultText: string,
): Promise<string | undefined> => {
  const newProfileName = await modalTextEdit({
    message: texts.label_assigner_profileNameEditModal_newProfileName,
    defaultText,
    caption,
  });
  if (newProfileName !== undefined) {
    const nameValid = await checkValidNewProfileName(projectId, newProfileName);
    if (nameValid) {
      return newProfileName;
    }
  }
  return undefined;
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
  uiStatusModel.status.profileConfigModalVisible = true;
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
