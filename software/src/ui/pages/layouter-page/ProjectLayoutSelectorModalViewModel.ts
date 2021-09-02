import { useState } from 'qx';
import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import { IProjectAttachmentFileSelectorModalModel } from '~/ui/components';
import { UiLayouterCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layouter-page/LayoutManagerActions';
import { ILayoutManagerViewModel } from '~/ui/pages/layouter-page/LayoutManagerViewModel';

export function makeLayoutSelectorModalViewModel(
  baseVm: ILayoutManagerViewModel,
): IProjectAttachmentFileSelectorModalModel | undefined {
  const [currentLayoutName, setCurrentLayoutName] = useState('');

  if (baseVm.modalState === 'None') {
    return undefined;
  }
  const isLoading = baseVm.modalState === 'LoadFromProject';

  const resourceInfos = uiReaders.allProjectPackageInfos;

  const projectOptions = resourceInfos.map((info) => ({
    value: info.projectKey,
    label: info.keyboardName,
  }));

  const editTargetProject = projectPackagesReader.getEditTargetProject();

  // 編集しているプロファイルのプロジェクトを規定で選び、変更させない
  const currentProjectId = editTargetProject?.projectId || '';

  const currentProject = resourceInfos.find(
    (info) => info.origin === 'local' && info.projectId === currentProjectId,
  );

  const layoutOptions =
    currentProject?.layouts.map(({ layoutName }) => ({
      value: layoutName,
      label: layoutName,
    })) || [];

  const titleText = isLoading
    ? 'Load From Project Layout'
    : 'Save To Project Layout';

  const isCustomName =
    currentLayoutName &&
    !layoutOptions.some((it) => it.value === currentLayoutName);

  const selectorSize = 7;

  const buttonText = isLoading ? (isCustomName ? 'Create' : 'Load') : 'Save';

  const buttonActive = !!(editTargetProject && currentLayoutName);

  const createForProject = () => {
    layoutManagerActions.createForProject(currentProjectId, currentLayoutName);
    baseVm.closeModal();
  };
  const loadFromProject = () => {
    layoutManagerActions.loadFromProject(currentProjectId, currentLayoutName);
    baseVm.closeModal();
  };

  const saveToProject = () => {
    layoutManagerActions.saveToProject(
      currentProjectId,
      currentLayoutName,
      UiLayouterCore.emitSavingDesign(),
    );
    baseVm.closeModal();
  };

  const buttonHandler = isLoading
    ? isCustomName
      ? createForProject
      : loadFromProject
    : saveToProject;

  const attachmentFileTypeHeader = 'Layout';

  const { closeModal, targetProjectLayoutFilePath } = baseVm;

  return {
    titleText,
    closeModal,
    selectorSize,
    canSelectProject: false,
    projectOptions,
    currentProjectKey: currentProject?.projectKey || '',
    setCurrentProjectKey: () => {},
    currentProjectKeyboardName: currentProject?.keyboardName || '',
    attachmentFileTypeHeader,
    attachmentFileNameOptions: layoutOptions,
    currentAttachmentFileName: currentLayoutName,
    setCurrentAttachmentFileName: setCurrentLayoutName,
    targetAttachmentFilePath: targetProjectLayoutFilePath,
    buttonText,
    buttonActive,
    buttonHandler,
  };
}
