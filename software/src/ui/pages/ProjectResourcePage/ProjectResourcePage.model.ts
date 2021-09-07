import { useEffect } from 'qx';
import {
  encodeProjectResourceItemKey,
  IProjectPackageInfo,
  IProjectResourceItemType,
} from '~/shared';
import { IProjectResourceListItem } from '~/ui/base';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { projectResourceActions } from '~/ui/pages/ProjectResourcePage/ProjectResourceActions';
import { projectResourceReaders } from '~/ui/pages/ProjectResourcePage/ProjectResourceState';

const helpers = {
  createProjectResourceListItem(
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
  },
  createProjectResourceListItems(
    projectInfo: IProjectPackageInfo,
    selectedItemKey: string,
    setSelectedItemKey: (key: string) => void,
  ) {
    return [
      ...projectInfo.firmwares.map((it) =>
        helpers.createProjectResourceListItem(
          'firmware',
          it.variationName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
      ...projectInfo.layouts.map((it) =>
        helpers.createProjectResourceListItem(
          'layout',
          it.layoutName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
      ...projectInfo.presets.map((it) =>
        helpers.createProjectResourceListItem(
          'preset',
          it.presetName,
          selectedItemKey,
          setSelectedItemKey,
        ),
      ),
    ];
  },
};

const readers = {
  get keyboardName(): string {
    const projectInfo = uiReaders.editTargetProject!;
    return projectInfo.keyboardName;
  },
  get resourceItems(): IProjectResourceListItem[] {
    const projectInfo = uiReaders.editTargetProject!;
    const { selectedItemKey } = projectResourceReaders;
    const { setSelectedItemKey } = projectResourceActions;
    return helpers.createProjectResourceListItems(
      projectInfo,
      selectedItemKey,
      setSelectedItemKey,
    );
  },
  get isSelectedItemKeyIncludedInList() {
    const { selectedItemKey } = projectResourceReaders;
    const { resourceItems } = readers;
    return resourceItems.some((it) => it.itemKey === selectedItemKey);
  },
};

const actions = {
  resetState() {
    if (!readers.isSelectedItemKeyIncludedInList) {
      projectResourceActions.clearSelection();
    }
  },
  handleKeyboardNameChange(value: string) {
    const projectInfo = uiReaders.editTargetProject!;
    const newProjectInfo = { ...projectInfo, keyboardName: value };
    projectPackagesWriter.saveLocalProject(newProjectInfo);
  },
};

export function useProjectResourcePageModel() {
  useEffect(() => actions.resetState, []);
  const { editSelectedResourceItem, clearSelection } = projectResourceActions;
  return {
    ...readers,
    ...actions,
    clearSelection,
    editSelectedResourceItem,
  };
}
