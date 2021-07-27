import { jsx, Hook, useLocal } from 'qx';
import { IProjectResourceInfo } from '~/shared';
import {
  fieldSetter,
  ipcAgent,
  IProjectAttachmentFileSelectorModalModel,
  ProjectAttachmentFileSelectorModal,
  modalConfirm,
  texts,
} from '~/ui/common';
import { IProfileManagementPartViewModel } from '~/ui/editor-page/ui_bar_profileManagement/viewModels/ProfileManagementPartViewModel';

function getTargetPresetNameFilePath(projectPath: string, presetName: string) {
  if (projectPath && presetName) {
    // todo: __dataフォルダがあるかどうかで保存場所を切り替える
    // return `projects/${projectPath}/__data/${presetName}.profile.json`;
    return `projects/${projectPath}/${presetName}.profile.json`;
  }
  return '';
}

function useProjectAttachmentFileSelectorViewModel(
  baseVm: IProfileManagementPartViewModel,
): IProjectAttachmentFileSelectorModalModel {
  const local = useLocal({
    resourceInfos: [] as IProjectResourceInfo[],
    currentPresetName: '',
  });

  Hook.useEffect(() => {
    ipcAgent.async
      .projects_getAllProjectResourceInfos()
      .then(
        (infos) =>
          (local.resourceInfos = infos.filter(
            (info) => info.origin === 'local',
          )),
      );
  }, []);

  const projectOptions = local.resourceInfos.map((info) => ({
    value: info.projectId,
    label: info.projectPath,
  }));

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProjectId = baseVm.currentProfileProjectId;

  const includedInResources = local.resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const currentProject = local.resourceInfos.find(
    (info) => info.projectId === currentProjectId,
  );

  const presetNameOptions =
    currentProject?.presetNames.map((presetName) => ({
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
    targetAttachementFilePath: getTargetPresetNameFilePath(
      currentProject?.projectPath || '',
      local.currentPresetName,
    ),
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
