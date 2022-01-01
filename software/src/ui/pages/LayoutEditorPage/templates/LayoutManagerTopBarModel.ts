import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/LayoutEditorPage/models/LayoutManagerActions';
import { ILayoutManagerEditTarget } from '~/ui/pages/LayoutEditorPage/models/LayoutManagerBase';
import { layoutManagerReader } from '~/ui/pages/LayoutEditorPage/models/LayoutManagerReaders';
import { createLayoutManagerMenuItems } from '~/ui/pages/LayoutEditorPage/templates/LayoutManagerMenuItems';

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
