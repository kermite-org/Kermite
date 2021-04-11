import { editMutations, editReader } from '~/ui/layouter/editor/store';

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

  return {
    canAddGroup: true,
    canDeleteGroup: allTransGroups.length > 1 && !!currentTransGroupId,
    addGroup: () => editMutations.addTransGroup(),
    deleteGroup: () => editMutations.deleteLastTransGroup(),
    groupItems: allTransGroups.map((group) => ({
      id: group.id,
      isActive: group.id === currentTransGroupId,
      setActive: () => editMutations.setCurrentTransGroupById(group.id),
    })),
  };
}
