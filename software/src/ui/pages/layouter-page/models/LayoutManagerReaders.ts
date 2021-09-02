import { ILayoutEditSource } from '~/shared';
import { uiReaders, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';

export const layoutManagerReader = {
  get editSource(): ILayoutEditSource {
    return uiState.core.layoutEditSource;
  },
  get isModified() {
    return UiLayouterCore.getIsModified();
  },
  get hasLayoutEntities() {
    return UiLayouterCore.hasEditLayoutEntities();
  },
  get canCreateNewLayout() {
    const { editSource, hasLayoutEntities } = layoutManagerReader;
    return editSource.type === 'LayoutNewlyCreated' ? hasLayoutEntities : true;
  },
  get canCreateProfileFromCurrentLayout() {
    return layoutManagerReader.hasLayoutEntities;
  },
  get canSaveToFile() {
    return layoutManagerReader.hasLayoutEntities;
  },
  get canOpenProjectIoModal() {
    return uiReaders.isLocalProjectSelectedForEdit;
  },
  get canShowEditLayoutFileInFiler() {
    const { editSource } = layoutManagerReader;
    return editSource.type === 'File' || editSource.type === 'ProjectLayout';
  },
  get canOverwrite() {
    const { editSource, isModified } = layoutManagerReader;
    return editSource.type !== 'LayoutNewlyCreated' && isModified;
  },
};
