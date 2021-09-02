import { ILayoutEditSource, IProjectPackageInfo } from '~/shared';
import { projectPackagesReader, uiState } from '~/ui/commonStore';
import { UiLayouterCore } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerBase';
import { ILayoutManagerEditTargetRadioSelection } from '~/ui/pages/layouter-page/models/LayoutManagerViewModel';

type LayoutManagerTopBarModel = {
  editTargetRadioSelection: ILayoutManagerEditTargetRadioSelection;
  canEditCurrentProfile: boolean;
  editSourceText: string;
  canOverwrite: boolean;
  setEditTargetRadioSelection(
    value: ILayoutManagerEditTargetRadioSelection,
  ): void;
  overwriteLayout(): void;
};

function getEditSourceDisplayText(
  editSource: ILayoutEditSource,
  editProjectInfo?: IProjectPackageInfo,
) {
  if (editSource.type === 'LayoutNewlyCreated') {
    return `[NewlyCreated]`;
  } else if (editSource.type === 'CurrentProfile') {
    return `[CurrentProfileLayout]`;
  } else if (editSource.type === 'File') {
    return `[File]${editSource.filePath}`;
  } else if (editSource.type === 'ProjectLayout') {
    const { layoutName } = editSource;
    return `[ProjectLayout] ${editProjectInfo?.packageName} ${layoutName}`;
  }
  return '';
}

const readers = {
  get editTargetRadioSelection() {
    const { editSource } = layoutManagerReader;
    return editSource.type === 'CurrentProfile'
      ? 'CurrentProfile'
      : 'LayoutFile';
  },
  get canEditCurrentProfile() {
    return (
      uiState.core.profileEditSource.type === 'InternalProfile' ||
      uiState.core.profileEditSource.type === 'ProfileNewlyCreated'
    );
  },
  get editSourceText() {
    const { editSource } = layoutManagerReader;
    const editTargetProject = projectPackagesReader.getEditTargetProject();
    return getEditSourceDisplayText(editSource, editTargetProject);
  },
  get canOverwrite() {
    const { editSource, isModified } = layoutManagerReader;
    return editSource.type !== 'LayoutNewlyCreated' && isModified;
  },
};

const actions = {
  setEditTargetRadioSelection(value: ILayoutManagerEditTargetRadioSelection) {
    const { editTargetRadioSelection } = readers;
    if (editTargetRadioSelection !== value) {
      if (value === 'CurrentProfile') {
        layoutManagerActions.loadCurrentProfileLayout();
      } else {
        layoutManagerActions.createNewLayout();
      }
    }
  },
  overwriteLayout() {
    layoutManagerActions.save(UiLayouterCore.emitSavingDesign());
  },
};

export function useLayoutManagerTopBarModel(): LayoutManagerTopBarModel {
  return { ...readers, ...actions };
}
