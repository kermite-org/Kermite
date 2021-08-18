import { forceChangeFilePathExtension } from '~/shared';
import {
  getProjectOriginAndIdFromSig,
  joinProjectProfileName,
  splitProjectProfileName,
} from '~/shared/funcs/DomainRelatedHelpers';
import { ipcAgent, texts } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { modalAlert, modalConfirm, modalTextEdit } from '~/ui/components';
import { profilesActions, profilesReader } from '~/ui/pages/editor-page/models';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';
import { editorPageModel } from '~/ui/pages/editor-page/models/editorPageModel';
import { callProfileSetupModal } from '~/ui/pages/editor-page/ui_modal_profileSetup/ProfileSetupModal';

const checkValidNewProfileName = async (
  newProfileName: string,
  projectId: string,
): Promise<boolean> => {
  if (!newProfileName.match(/^[^/./\\:*?"<>|]+$/)) {
    await modalAlert(
      `${newProfileName} is not for valid filename. operation cancelled.`,
    );
    return false;
  }

  const newFullName = joinProjectProfileName(projectId, newProfileName);
  const lowered = newFullName.toLowerCase();
  if (
    profilesReader.allProfileEntries.find(
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
    const { origin, projectId } = getProjectOriginAndIdFromSig(projectKey);
    const nameValid = await checkValidNewProfileName(profileName, projectId);
    if (nameValid) {
      const fullProfileName = joinProjectProfileName(projectId, profileName);
      profilesActions.createProfile(fullProfileName, origin, projectId, {
        type: 'blank',
        layoutName: layoutKey,
      });
    }
  }
};

const inputNewProfileName = async (
  caption: string,
  defaultText: string,
  projectId: string,
): Promise<string | undefined> => {
  const newProfileName = await modalTextEdit({
    message: texts.label_assigner_profileNameEditModal_newProfileName,
    defaultText,
    caption,
  });
  if (newProfileName) {
    const nameValid = await checkValidNewProfileName(newProfileName, projectId);
    if (nameValid) {
      return newProfileName;
    }
  }
  return undefined;
};

const renameProfile = async () => {
  if (profilesReader.editSource.type !== 'InternalProfile') {
    return;
  }
  const { folderPart, filePart } = splitProjectProfileName(
    profilesReader.currentProfileName,
  );
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleRename,
    filePart,
    folderPart,
  );
  if (newFilePart) {
    const newProfileName = joinProjectProfileName(folderPart, newFilePart);
    profilesActions.renameProfile(newProfileName);
  }
};

const copyProfile = async () => {
  if (profilesReader.editSource.type !== 'InternalProfile') {
    return;
  }
  const { folderPart, filePart } = splitProjectProfileName(
    profilesReader.currentProfileName,
  );
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleCopy,
    filePart,
    folderPart,
  );
  if (newFilePart) {
    const newProfileName = joinProjectProfileName(folderPart, newFilePart);
    profilesActions.copyProfile(newProfileName);
  }
};

const deleteProfile = async () => {
  if (profilesReader.editSource.type !== 'InternalProfile') {
    return;
  }
  const { filePart } = splitProjectProfileName(
    profilesReader.currentProfileName,
  );
  const ok = await modalConfirm({
    message: texts.label_assigner_confirmModal_deleteProfile_modalMessage.replace(
      '{PROFILE_NAME}',
      filePart,
    ),
    caption: texts.label_assigner_confirmModal_deleteProfile_modalTitle,
  });
  if (ok) {
    profilesActions.deleteProfile();
  }
};

const handleSaveUnsavedProfile = async () => {
  if (profilesReader.editSource.type === 'InternalProfile') {
    return;
  }
  const projectId = editorModel.profileData.projectId;
  const newFilePart = await inputNewProfileName(
    texts.label_assigner_profileNameEditModal_modalTitleSave,
    profilesReader.currentProfileName,
    projectId,
  );
  if (newFilePart) {
    const newProfileName = joinProjectProfileName(projectId, newFilePart);
    profilesActions.saveUnsavedProfileAs(newProfileName);
  }
};

const openConfiguration = () => {
  uiStatusModel.status.profileConfigModalVisible = true;
};

const onSaveButton = () => {
  const editSourceType = profilesReader.editSource.type;
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
  const filePath = await ipcAgent.async.file_getOpenJsonFilePathWithDialog();
  if (filePath) {
    profilesActions.importFromFile(filePath);
  }
};

const handleExportToFile = async () => {
  const filePath = await ipcAgent.async.file_getSaveJsonFilePathWithDialog();
  if (filePath) {
    const modFilePath = forceChangeFilePathExtension(filePath, '.profile.json');
    profilesActions.exportToFile(modFilePath);
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
