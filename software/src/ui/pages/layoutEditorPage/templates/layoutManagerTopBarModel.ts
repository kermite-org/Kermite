import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/layoutEditorPage/models/layoutManagerActions';
import { ILayoutManagerEditTarget } from '~/ui/pages/layoutEditorPage/models/layoutManagerBase';
import { layoutManagerReader } from '~/ui/pages/layoutEditorPage/models/layoutManagerReaders';
import { createLayoutManagerMenuItems } from '~/ui/pages/layoutEditorPage/templates/layoutManagerMenuItems';

type LayoutManagerTopBarModel = {
  canEditCurrentProfile: boolean;
  editTargetRadioSelection: ILayoutManagerEditTarget;
  setEditTargetRadioSelection(value: ILayoutManagerEditTarget): void;
  menuItems: IGeneralMenuItem[];
  editSourceText: string;
  canOverwrite: boolean;
  overwriteLayout(): void;
  saveButtonVisible: boolean;
};

export function useLayoutManagerTopBarModel(): LayoutManagerTopBarModel {
  const menuItems = createLayoutManagerMenuItems();
  const {
    canEditCurrentProfile,
    editTargetRadioSelection,
    editSourceText,
    canOverwrite,
    saveButtonVisible,
  } = layoutManagerReader;
  const { setEditTargetRadioSelection, overwriteLayout } = layoutManagerActions;
  return {
    canEditCurrentProfile,
    editTargetRadioSelection,
    setEditTargetRadioSelection,
    menuItems,
    editSourceText,
    canOverwrite,
    overwriteLayout,
    saveButtonVisible,
  };
}
