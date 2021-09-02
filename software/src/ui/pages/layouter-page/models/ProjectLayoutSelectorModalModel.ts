import { useState } from 'qx';
import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import { IProjectAttachmentFileSelectorModalModel } from '~/ui/components';
import { UiLayouterCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { layoutManagerHelpers } from '~/ui/pages/layouter-page/models/LayoutManagerHelpers';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerReaders';

export function makeProjectLayoutSelectorModalModel():
  | IProjectAttachmentFileSelectorModalModel
  | undefined {
  const [currentLayoutName, setCurrentLayoutName] = useState('');

  const { modalState } = layoutManagerReader;
  const { closeModal } = layoutManagerActions;

  if (modalState === 'None') {
    return undefined;
  }
  const isLoading = modalState === 'LoadFromProject';

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
    closeModal();
  };
  const loadFromProject = () => {
    layoutManagerActions.loadFromProject(currentProjectId, currentLayoutName);
    closeModal();
  };

  const saveToProject = () => {
    layoutManagerActions.saveToProject(
      currentProjectId,
      currentLayoutName,
      UiLayouterCore.emitSavingDesign(),
    );
    closeModal();
  };

  const buttonHandler = isLoading
    ? isCustomName
      ? createForProject
      : loadFromProject
    : saveToProject;

  const attachmentFileTypeHeader = 'Layout';

  const targetProjectLayoutFilePath =
    layoutManagerHelpers.getSavingPackageFilePath();

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
