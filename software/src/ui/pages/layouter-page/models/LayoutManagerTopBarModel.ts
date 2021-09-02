import { IGeneralMenuItem } from '~/ui/base';
import { layoutManagerActions } from '~/ui/pages/layouter-page/models/LayoutManagerActions';
import { ILayoutManagerEditTarget } from '~/ui/pages/layouter-page/models/LayoutManagerBase';
import { createLayoutManagerMenuItems } from '~/ui/pages/layouter-page/models/LayoutManagerMenuItems';
import { layoutManagerReader } from '~/ui/pages/layouter-page/models/LayoutManagerReaders';

type LayoutManagerTopBarModel = {
  canEditCurrentProfile: boolean;
  editTargetRadioSelection: ILayoutManagerEditTarget;
  setEditTargetRadioSelection(value: ILayoutManagerEditTarget): void;
  menuItems: IGeneralMenuItem[];
  editSourceText: string;
  canOverwrite: boolean;
  overwriteLayout(): void;
};

export function useLayoutManagerTopBarModel(): LayoutManagerTopBarModel {
  const menuItems = createLayoutManagerMenuItems();
  const {
    canEditCurrentProfile,
    editTargetRadioSelection,
    editSourceText,
    canOverwrite,
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
  };
}
