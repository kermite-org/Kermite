import { h, Hook } from 'qx';
import { IProjectResourceInfo } from '~/shared';
import { fieldSetter, ipcAgent, useLocal } from '~/ui-common';
import {
  IProjectAttachmentFileSelectorModalModel,
  ProjectAttachmentFileSelectorModal,
} from '~/ui-common/sharedViews/ProjectAttachementFileSelectorModal';
import { IProfileManagementPartViewModel } from '~/ui-editor-page/ProfileManagement/viewModels/ProfileManagementPartViewModel';

function getTargetPresetNameFilePath(projectPath: string, presetName: string) {
  if (projectPath && presetName) {
    return `projects/${projectPath}/presets/${presetName}.json`;
    // return `<KermiteRoot>/firmare/src/projects/${projectPath}/presets/${fileNamePart}.json`;
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
    id: info.projectId,
    text: info.projectPath,
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
      id: presetName,
      text: presetName,
    })) || [];

  return {
    titleText: 'Save As Project Preset',
    closeModal: baseVm.closeExportingPresetSelectionModal,
    selectorSize: 7,
    canSelectProject: false,
    projectOptions,
    currentProjectId,
    setCurrentProjectId: () => {},
    currentProejctKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader: 'Preset',
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
    buttonHandler: () => {
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