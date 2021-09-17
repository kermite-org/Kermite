import { useState } from 'qx';
import { ISelectorOption } from '~/ui/base';
import { projectPackagesReader, uiReaders } from '~/ui/commonStore';
import { IProjectAttachmentFileSelectorModalModel } from '~/ui/components';
import { LayoutEditorCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layout-editor-page/models/LayoutManagerActions';
import { ILayoutManagerModalState } from '~/ui/pages/layout-editor-page/models/LayoutManagerBase';
import { layoutManagerHelpers } from '~/ui/pages/layout-editor-page/models/LayoutManagerHelpers';
import { layoutManagerReader } from '~/ui/pages/layout-editor-page/models/LayoutManagerReaders';

const configs = {
  selectorSize: 7,
  canSelectProject: false,
  attachmentFileTypeHeader: 'Layout',
};

function makeCoreProps() {
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

  return {
    projectOptions,
    currentProjectId,
    currentProject,
    layoutOptions,
  };
}

type IOperationMode = 'Load' | 'Save';

function getOperationMode(
  modalState: ILayoutManagerModalState,
): IOperationMode {
  const isLoad = modalState === 'LoadFromProject';
  return isLoad ? 'Load' : 'Save';
}

function getTitleText(operationMode: IOperationMode) {
  return operationMode === 'Load'
    ? 'Load From Project Layout'
    : 'Save To Project Layout';
}

function getCanSubmit(
  operationMode: IOperationMode,
  currentProjectId: string,
  currentLayoutName: string,
  layoutOptions: ISelectorOption[],
): boolean {
  const base = !!(currentProjectId && currentLayoutName);
  if (operationMode === 'Load') {
    return (
      (currentLayoutName &&
        layoutOptions.some((it) => it.value === currentLayoutName)) ||
      false
    );
  } else {
    return base;
  }
}

function submit(
  operationMode: IOperationMode,
  currentProjectId: string,
  currentLayoutName: string,
) {
  if (operationMode === 'Load') {
    layoutManagerActions.loadFromProject(currentProjectId, currentLayoutName);
  } else if (operationMode === 'Save') {
    layoutManagerActions.saveToProject(
      currentProjectId,
      currentLayoutName,
      LayoutEditorCore.emitSavingDesign(),
    );
  }
  layoutManagerActions.closeModal();
}

export function makeProjectLayoutSelectorModalModel():
  | IProjectAttachmentFileSelectorModalModel
  | undefined {
  const [currentLayoutName, setCurrentLayoutName] = useState('');
  const { modalState } = layoutManagerReader;
  if (modalState === 'None') {
    return undefined;
  }

  const { closeModal } = layoutManagerActions;
  const { selectorSize, attachmentFileTypeHeader, canSelectProject } = configs;
  const { projectOptions, currentProjectId, currentProject, layoutOptions } =
    makeCoreProps();

  const currentProjectKey = currentProject?.projectKey || '';
  const currentProjectKeyboardName = currentProject?.keyboardName || '';
  const targetProjectLayoutFilePath =
    layoutManagerHelpers.getSavingPackageFilePath();

  const operationMode = getOperationMode(modalState);
  const titleText = getTitleText(operationMode);
  const buttonText = operationMode;
  const buttonActive = getCanSubmit(
    operationMode,
    currentProjectId,
    currentLayoutName,
    layoutOptions,
  );
  const buttonHandler = () => {
    submit(operationMode, currentProjectId, currentLayoutName);
  };

  return {
    selectorSize,
    attachmentFileTypeHeader,
    canSelectProject,
    titleText,
    closeModal,
    projectOptions,
    currentProjectKey,
    setCurrentProjectKey: () => {},
    currentProjectKeyboardName,
    attachmentFileNameOptions: layoutOptions,
    currentAttachmentFileName: currentLayoutName,
    setCurrentAttachmentFileName: setCurrentLayoutName,
    targetAttachmentFilePath: targetProjectLayoutFilePath,
    buttonText,
    buttonActive,
    buttonHandler,
  };
}
