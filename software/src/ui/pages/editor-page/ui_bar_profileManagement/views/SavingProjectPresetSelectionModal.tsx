import { jsx, useLocal } from 'qx';
import { texts } from '~/ui/base';
import { projectPackagesReader, uiGlobalStore } from '~/ui/commonModels';
import {
  IProjectAttachmentFileSelectorModalModel,
  modalConfirm,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/components';
import { fieldSetter } from '~/ui/helpers';
import { IProfileManagementPartViewModel } from '~/ui/pages/editor-page/ui_bar_profileManagement/viewModels/ProfileManagementPartViewModel';

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
  const local = useLocal({
    currentPresetName: '',
  });

  const resourceInfos = uiGlobalStore.allProjectPackageInfos;

  const projectOptions = resourceInfos.map((info) => ({
    value: info.projectId,
    label: info.keyboardName,
  }));

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProjectId = baseVm.currentProfileProjectId;

  const includedInResources = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const currentProject = resourceInfos.find(
    (info) => info.projectId === currentProjectId,
  );

  const presetNameOptions =
    currentProject?.presets.map(({ presetName }) => ({
      value: presetName,
      label: presetName,
    })) || [];

  return {
    titleText:
      texts.label_projectAttachmentFileSelectionModal_savePreset_modalTitle,
    closeModal: baseVm.closeExportingPresetSelectionModal,
    selectorSize: 7,
    canSelectProject: false,
    projectOptions,
    currentProjectId,
    setCurrentProjectId: () => {},
    currentProejctKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader:
      texts.label_projectAttachmentFileSelectionModal_preset,
    attachmentFileNameOptions: presetNameOptions,
    currentAttachmentFileName: local.currentPresetName,
    setCurrentAttachmentFileName: fieldSetter(local, 'currentPresetName'),
    targetAttachementFilePath: getSavingPackageFilePath(),
    buttonText: 'Save',
    buttonActive: !!(
      currentProjectId &&
      local.currentPresetName &&
      includedInResources
    ),
    buttonHandler: async () => {
      const savingName = local.currentPresetName;
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
      baseVm.saveProfileAsPreset(currentProjectId, local.currentPresetName);
      baseVm.closeExportingPresetSelectionModal();
    },
  };
}

export const SavingProjectPresetSelectionModal = (props: {
  baseVm: IProfileManagementPartViewModel;
}) => {
  const vm = useProjectAttachmentFileSelectorViewModel(props.baseVm);
  return <ProjectAttachmentFileSelectorModal vm={vm} />;
};
