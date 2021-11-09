import { ILayoutEditSource } from '~/shared';
import { LayoutEditorCore } from '~/ui/featureEditors';
import {
  ILayoutManagerEditTarget,
  ILayoutManagerModalState,
  layoutManagerState,
} from '~/ui/pages/layout-editor-page/models/LayoutManagerBase';
import { layoutManagerHelpers } from '~/ui/pages/layout-editor-page/models/LayoutManagerHelpers';
import { projectPackagesReader, uiReaders, uiState } from '~/ui/store';

export const layoutManagerReader = {
  get editSource(): ILayoutEditSource {
    return uiState.core.layoutEditSource;
  },
  get isModified(): boolean {
    return LayoutEditorCore.getIsModified();
  },
  get hasLayoutEntities(): boolean {
    return LayoutEditorCore.hasEditLayoutEntities();
  },
  get modalState(): ILayoutManagerModalState {
    return layoutManagerState.modalState;
  },
  get canEditCurrentProfile(): boolean {
    return (
      uiState.core.profileEditSource.type === 'InternalProfile' ||
      uiState.core.profileEditSource.type === 'ProfileNewlyCreated'
    );
  },
  get editTargetRadioSelection(): ILayoutManagerEditTarget {
    const { editSource } = layoutManagerReader;
    return editSource.type === 'CurrentProfile'
      ? 'CurrentProfile'
      : 'LayoutFile';
  },
  get editSourceText(): string {
    const { editSource } = layoutManagerReader;
    const editTargetProject = projectPackagesReader.getEditTargetProject();
    return layoutManagerHelpers.getEditSourceDisplayText(
      editSource,
      editTargetProject,
    );
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
  get saveButtonVisible(): boolean {
    return layoutManagerReader.editSource.type !== 'CurrentProfile';
  },
};
