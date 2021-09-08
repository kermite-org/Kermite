import {
  IProjectResourceItemType,
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
} from '~/shared';
import { IProjectResourceListItem } from '~/ui/base';

function createProjectResourceListItem(
  itemType: IProjectResourceItemType,
  itemName: string,
  selectedItemKey: string,
  setSelectedItemKey: (itemKey: string) => void,
): IProjectResourceListItem {
  const itemKey = encodeProjectResourceItemKey(itemType, itemName);
  const selected = itemKey === selectedItemKey;
  const setSelected = () => setSelectedItemKey(itemKey);
  return {
    itemKey,
    itemType,
    itemName,
    selected,
    setSelected,
  };
}

export function createProjectResourceListItems(
  projectInfo: IProjectPackageInfo,
  selectedItemKey: string,
  setSelectedItemKey: (key: string) => void,
): IProjectResourceListItem[] {
  return [
    ...projectInfo.firmwares.map((it) =>
      createProjectResourceListItem(
        'firmware',
        it.variationName,
        selectedItemKey,
        setSelectedItemKey,
      ),
    ),
    ...projectInfo.layouts.map((it) =>
      createProjectResourceListItem(
        'layout',
        it.layoutName,
        selectedItemKey,
        setSelectedItemKey,
      ),
    ),
    ...projectInfo.presets.map((it) =>
      createProjectResourceListItem(
        'preset',
        it.presetName,
        selectedItemKey,
        setSelectedItemKey,
      ),
    ),
  ];
}
