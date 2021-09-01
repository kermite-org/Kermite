import { jsx, useState } from 'qx';
import { texts } from '~/ui/base';
import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import {
  IProjectAttachmentFileSelectorModalModel,
  modalConfirm,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/components';
import { profilesActions } from '~/ui/pages/editor-page/models';
import { IProfileManagementPartViewModel } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfilesOperationModel';

function getSavingPackageFilePath() {
  const projectInfo = projectPackagesReader.getEditTargetProject();
  if (projectInfo) {
    return `data/projects/${projectInfo.packageName}.kmpkg.json`;
  }
  return '';
}

function useProjectAttachmentFileSelectorViewModel(
  baseVm: IProfileManagementPartViewModel,
): IProjectAttachmentFileSelectorModalModel {
  const isLoading = baseVm.modalState === 'LoadFromProject';

  const titleText = isLoading
    ? 'Load From Project Preset'
    : texts.label_projectAttachmentFileSelectionModal_savePreset_modalTitle;

  const [currentPresetName, setCurrentPresetName] = useState('');

  const resourceInfos = uiReaders.allProjectPackageInfos;

  const projectOptions = resourceInfos.map((info) => ({
    value: info.projectId,
    label: info.keyboardName,
  }));

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProjectId = baseVm.currentProfileProjectId;

  const currentProject = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const presetNameOptions =
    currentProject?.presets.map(({ presetName }) => ({
      value: presetName,
      label: presetName,
    })) || [];

  const selectorSize = 7;

  const buttonText = isLoading ? 'Load' : 'Save';

  let buttonActive = !!(
    currentProjectId &&
    currentPresetName &&
    currentProject
  );

  if (
    isLoading &&
    !presetNameOptions.some((it) => it.value === currentPresetName)
  ) {
    buttonActive = false;
  }

  const buttonHandler = async () => {
    if (isLoading) {
      profilesActions.createProfileUnnamed('local', currentProjectId, {
        type: 'preset',
        presetName: currentPresetName,
      });
      baseVm.closeModal();
    } else {
      const savingName = currentPresetName;
      const overwriting = presetNameOptions.some(
        (it) => it.value === savingName,
      );
      if (overwriting) {
        const isOk = await modalConfirm({
          caption: 'save',
          message: 'overwrite it?',
        });
        if (!isOk) {
          return;
        }
      }
      baseVm.saveProfileAsPreset(currentProjectId, currentPresetName);
      baseVm.closeModal();
    }
  };

  return {
    titleText,
    closeModal: baseVm.closeModal,
    selectorSize,
    canSelectProject: false,
    projectOptions,
    currentProjectId,
    setCurrentProjectId: () => {},
    currentProjectKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader:
      texts.label_projectAttachmentFileSelectionModal_preset,
    attachmentFileNameOptions: presetNameOptions,
    currentAttachmentFileName: currentPresetName,
    setCurrentAttachmentFileName: setCurrentPresetName,
    targetAttachmentFilePath: getSavingPackageFilePath(),
    buttonText,
    buttonActive,
    buttonHandler,
  };
}

export const SavingProjectPresetSelectionModal = (props: {
  baseVm: IProfileManagementPartViewModel;
}) => {
  const vm = useProjectAttachmentFileSelectorViewModel(props.baseVm);
  return <ProjectAttachmentFileSelectorModal vm={vm} />;
};
