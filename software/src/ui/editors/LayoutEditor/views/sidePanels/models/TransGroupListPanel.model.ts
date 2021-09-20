import { editMutations, editReader } from '~/ui/editors/LayoutEditor/models';

interface ITransGroupListPartModel {
  canAddGroup: boolean;
  canDeleteGroup: boolean;
  addGroup(): void;
  deleteGroup(): void;

  groupItems: {
    id: string;
    isActive: boolean;
    setActive(): void;
  }[];
}

export function useTransGroupListPartModel(): ITransGroupListPartModel {
  const { allTransGroups, currentTransGroupId } = editReader;

  const groupItems = allTransGroups.map((group) => ({
    id: group.id,
    isActive: group.id === currentTransGroupId,
    setActive: () => editMutations.setCurrentTransGroupById(group.id),
  }));
  if (groupItems.length > 0) {
    groupItems.unshift({
      id: '--',
      isActive: currentTransGroupId === undefined,
      setActive: () => editMutations.setCurrentTransGroupById(undefined),
    });
  }

  const canDeleteGroup =
    allTransGroups.length > 0 &&
    currentTransGroupId === allTransGroups[allTransGroups.length - 1].id;

  return {
    canAddGroup: true,
    canDeleteGroup,
    addGroup: () => editMutations.addTransGroup(),
    deleteGroup: () => editMutations.deleteLastTransGroup(),
    groupItems,
  };
}
