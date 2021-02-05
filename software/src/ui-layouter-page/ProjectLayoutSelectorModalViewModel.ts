import { IProjectAttachmentFileSelectorModalModel } from '~/ui-common/sharedViews/ProjectAttachementFileSelectorModal';
import { ILayoutManagerViewModel } from '~/ui-layouter-page/LayoutManagerViewModel';

export function makeLayoutSelectorModelViewModel(
  baseVm: ILayoutManagerViewModel,
): IProjectAttachmentFileSelectorModalModel | undefined {
  if (baseVm.modalState === 'None') {
    return undefined;
  }
  const isLoading = baseVm.modalState === 'LoadFromProject';

  const titleText = isLoading
    ? 'Load From Project Layout'
    : 'Save To Project Layout';

  const isCustomName =
    baseVm.currentLayoutName &&
    !baseVm.layoutOptions.some((it) => it.value === baseVm.currentLayoutName);

  const selectorSize = 7;

  const buttonText = isLoading ? (isCustomName ? 'Create' : 'Load') : 'Save';
  const buttonHandler = isLoading
    ? isCustomName
      ? baseVm.createForProject
      : baseVm.loadFromProject
    : baseVm.saveToProject;
  const buttonActive = isLoading
    ? baseVm.canLoadFromProject
    : baseVm.canSaveToProject;

  const attachmentFileTypeHeader = 'Layout';

  const {
    closeModal,
    projectOptions,
    currentProjectId,
    setCurrentProjectId,
    currentKeyboardName,
    layoutOptions,
    currentLayoutName,
    setCurrentLayoutName,
    targetProjectLayoutFilePath,
  } = baseVm;

  return {
    titleText,
    closeModal,
    selectorSize,
    canSelectProject: true,
    projectOptions,
    currentProjectId,
    setCurrentProjectId,
    currentProejctKeyboardName: currentKeyboardName,
    attachmentFileTypeHeader,
    attachmentFileNameOptions: layoutOptions,
    currentAttachmentFileName: currentLayoutName,
    setCurrentAttachmentFileName: setCurrentLayoutName,
    targetAttachementFilePath: targetProjectLayoutFilePath,
    buttonText,
    buttonActive,
    buttonHandler,
  };
}
