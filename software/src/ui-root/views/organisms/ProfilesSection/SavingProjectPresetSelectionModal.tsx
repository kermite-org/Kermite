import { h, Hook } from 'qx';
import { IProjectResourceInfo } from '~/shared';
import { ipcAgent } from '~/ui-common';
import {
  IProjectAttachmentFileSelectorModalModel,
  ProjectAttachmentFileSelectorModal,
} from '~/ui-common/parts/ProjectAttachementFileSelectorModal';
import { fieldSetter } from '~/ui-root/base/helper/ViewHelpers';
import { IProfileManagementPartViewModel } from '~/ui-root/viewModels/ProfileManagementPartViewModel';

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
  const [local] = Hook.useState({
    resourceInfos: [] as IProjectResourceInfo[],
    currentProjectId: '',
    currentPresetName: '',
  });

  Hook.useEffect(() => {
    ipcAgent.async
      .projects_getAllProjectResourceInfos()
      .then(fieldSetter(local, 'resourceInfos'));
  }, []);

  const projectOptions = local.resourceInfos.map((info) => ({
    id: info.projectId,
    text: info.projectPath,
  }));

  const currentProject = local.resourceInfos.find(
    (info) => info.projectId === local.currentProjectId,
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
    projectOptions,
    currentProjectId: local.currentProjectId,
    setCurrentProjectId: fieldSetter(local, 'currentProjectId'),
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
    buttonActive: !!(local.currentProjectId && local.currentProjectId),
    buttonHandler: () => {
      baseVm.saveProfileAsPreset(
        local.currentProjectId,
        local.currentPresetName,
      );
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
