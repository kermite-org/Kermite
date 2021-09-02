import { ILayoutEditSource } from '~/shared';
import { uiReaders, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';

export const layoutManagerReader = {
  get editSource(): ILayoutEditSource {
    return uiState.core.layoutEditSource;
  },
  get isModified(): boolean {
    return UiLayouterCore.getIsModified();
  },
  get hasLayoutEntities(): boolean {
    return UiLayouterCore.hasEditLayoutEntities();
  },
  get canCreateNewLayout(): boolean {
    const { editSource, hasLayoutEntities } = layoutManagerReader;
    return editSource.type === 'LayoutNewlyCreated' ? hasLayoutEntities : true;
  },
  get canCreateProfileFromCurrentLayout(): boolean {
    return layoutManagerReader.hasLayoutEntities;
  },
  get canSaveToFile(): boolean {
    return layoutManagerReader.hasLayoutEntities;
  },
  get canOpenProjectIoModal(): boolean {
    return uiReaders.isLocalProjectSelectedForEdit;
  },
  get canShowEditLayoutFileInFiler(): boolean {
    const { editSource } = layoutManagerReader;
    return editSource.type === 'File' || editSource.type === 'ProjectLayout';
  },
  get canOverwrite(): boolean {
    const { editSource, isModified } = layoutManagerReader;
    return editSource.type !== 'LayoutNewlyCreated' && isModified;
  },
};
