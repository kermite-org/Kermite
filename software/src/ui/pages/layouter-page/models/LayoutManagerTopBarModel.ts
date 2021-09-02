import { IGeneralMenuItem } from '~/ui/base';
import { projectPackagesReader, uiState } from '~/ui/commonStore';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { layoutManagerHelpers } from '~/ui/pages/layouter-page/models/LayoutManagerHelpers';
import { createLayoutManagerMenuItems } from '~/ui/pages/layouter-page/models/LayoutManagerMenuItems';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerReaders';

export type ILayoutManagerEditTargetRadioSelection =
  | 'CurrentProfile'
  | 'LayoutFile';

type LayoutManagerTopBarModel = {
  canEditCurrentProfile: boolean;
  editTargetRadioSelection: ILayoutManagerEditTargetRadioSelection;
  setEditTargetRadioSelection(
    value: ILayoutManagerEditTargetRadioSelection,
  ): void;
  menuItems: IGeneralMenuItem[];
  editSourceText: string;
  canOverwrite: boolean;
  overwriteLayout(): void;
};

const readers = {
  get canEditCurrentProfile() {
    return (
      uiState.core.profileEditSource.type === 'InternalProfile' ||
      uiState.core.profileEditSource.type === 'ProfileNewlyCreated'
    );
  },
  get editTargetRadioSelection() {
    const { editSource } = layoutManagerReader;
    return editSource.type === 'CurrentProfile'
      ? 'CurrentProfile'
      : 'LayoutFile';
  },

  get editSourceText() {
    const { editSource } = layoutManagerReader;
    const editTargetProject = projectPackagesReader.getEditTargetProject();
    return layoutManagerHelpers.getEditSourceDisplayText(
      editSource,
      editTargetProject,
    );
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
};

export function useLayoutManagerTopBarModel(): LayoutManagerTopBarModel {
  const menuItems = createLayoutManagerMenuItems();
  const { canOverwrite } = layoutManagerReader;
  const { overwriteLayout } = layoutManagerActions;
  const { canEditCurrentProfile, editTargetRadioSelection, editSourceText } =
    readers;
  const { setEditTargetRadioSelection } = actions;
  return {
    canEditCurrentProfile,
    editTargetRadioSelection,
    setEditTargetRadioSelection,
    menuItems,
    editSourceText,
    canOverwrite,
    overwriteLayout,
  };
}
