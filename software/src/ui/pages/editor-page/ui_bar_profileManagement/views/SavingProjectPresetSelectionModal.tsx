import { jsx, useState } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { ISelectorOption, texts } from '~/ui/base';
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

type ICoreProps = {
  currentPresetName: string;
  setCurrentPresetName(text: string): void;
  projectOptions: ISelectorOption[];
  currentProjectId: string;
  currentProject: IProjectPackageInfo | undefined;
  presetNameOptions: ISelectorOption[];
};

function useCoreProps(baseVm: IProfileManagementPartViewModel): ICoreProps {
  const [currentPresetName, setCurrentPresetName] = useState('');

  const resourceInfos = uiReaders.allProjectPackageInfos;

  const projectOptions = resourceInfos.map((info) => ({
    value: info.projectId,
    label: info.keyboardName,
  }));

  const currentProjectId = baseVm.currentProfileProjectId;

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProject = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const presetNameOptions =
    currentProject?.presets.map(({ presetName }) => ({
      value: presetName,
      label: presetName,
    })) || [];

  return {
    currentPresetName,
    setCurrentPresetName,
    projectOptions,
    currentProjectId,
    currentProject,
    presetNameOptions,
  };
}

function makeProjectAttachmentFileSelectorViewModel_Loading(
  baseVm: IProfileManagementPartViewModel,
  coreProps: ICoreProps,
): IProjectAttachmentFileSelectorModalModel {
  const {
    currentPresetName,
    setCurrentPresetName,
    projectOptions,
    currentProjectId,
    currentProject,
    presetNameOptions,
  } = coreProps;

  const buttonActive = presetNameOptions.some(
    (it) => it.value === currentPresetName,
  );

  const buttonHandler = () => {
    profilesActions.createProfileUnnamed('local', currentProjectId, {
      type: 'preset',
      presetName: currentPresetName,
    });
    baseVm.closeModal();
  };

  return {
    titleText: 'Load From Project Preset',
    closeModal: baseVm.closeModal,
    selectorSize: 7,
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
    buttonText: 'Load',
    buttonActive,
    buttonHandler,
  };
}

function makeProjectAttachmentFileSelectorViewModel_Saving(
  baseVm: IProfileManagementPartViewModel,
  coreProps: ICoreProps,
): IProjectAttachmentFileSelectorModalModel {
  const {
    currentPresetName,
    setCurrentPresetName,
    projectOptions,
    currentProjectId,
    currentProject,
    presetNameOptions,
  } = coreProps;

  const buttonActive = !!(
    currentProjectId &&
    currentPresetName &&
    currentProject
  );

  const buttonHandler = async () => {
    const savingName = currentPresetName;
    const overwriting = presetNameOptions.some((it) => it.value === savingName);
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
  };

  return {
    titleText:
      texts.label_projectAttachmentFileSelectionModal_savePreset_modalTitle,
    closeModal: baseVm.closeModal,
    selectorSize: 7,
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
    buttonText: 'Save',
    buttonActive,
    buttonHandler,
  };
}

function useProjectAttachmentFileSelectorViewModel(
  baseVm: IProfileManagementPartViewModel,
): IProjectAttachmentFileSelectorModalModel {
  const isLoading = baseVm.modalState === 'LoadFromProject';
  const coreProps = useCoreProps(baseVm);
  if (isLoading) {
    return makeProjectAttachmentFileSelectorViewModel_Loading(
      baseVm,
      coreProps,
    );
  } else {
    return makeProjectAttachmentFileSelectorViewModel_Saving(baseVm, coreProps);
  }
}

export const SavingProjectPresetSelectionModal = (props: {
  baseVm: IProfileManagementPartViewModel;
}) => {
  const vm = useProjectAttachmentFileSelectorViewModel(props.baseVm);
  return <ProjectAttachmentFileSelectorModal vm={vm} />;
};
