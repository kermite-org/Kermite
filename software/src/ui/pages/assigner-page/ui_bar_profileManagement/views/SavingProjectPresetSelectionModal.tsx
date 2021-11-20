import { jsx, useState } from 'alumina';
import { validateResourceName, IProjectPackageInfo } from '~/shared';
import { ISelectorOption, texts } from '~/ui/base';
import { modalConfirm, modalError } from '~/ui/components';
import {
  IProjectAttachmentFileSelectorModalModel,
  ProjectAttachmentFileSelectorModal,
} from '~/ui/elements/featureModals';
import { profilesActions } from '~/ui/pages/assigner-page/models';
import { IProfileManagementPartViewModel } from '~/ui/pages/assigner-page/ui_bar_profileManagement/viewModels/ProfilesOperationModel';
import { projectPackagesReader, uiReaders } from '~/ui/store';

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
    value: info.projectKey,
    label: info.keyboardName,
  }));

  const currentProjectId = baseVm.currentProfileProjectId;

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProject = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const presetNameOptions =
    currentProject?.profiles.map(({ profileName: presetName }) => ({
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
    currentProjectKey: currentProject?.projectKey || '',
    setCurrentProjectKey: () => {},
    currentProjectKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader: texts.projectAttachmentFileSelectionModal.preset,
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
    const error = validateResourceName(savingName, 'preset name');
    if (error) {
      modalError(error);
    } else {
      baseVm.saveProfileAsPreset(currentProjectId, currentPresetName);
      baseVm.closeModal();
    }
  };

  return {
    titleText: texts.projectAttachmentFileSelectionModal.savePreset_modalTitle,
    closeModal: baseVm.closeModal,
    selectorSize: 7,
    canSelectProject: false,
    projectOptions,
    currentProjectKey: currentProject?.projectKey || '',
    setCurrentProjectKey: () => {},
    currentProjectKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader: texts.projectAttachmentFileSelectionModal.preset,
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
