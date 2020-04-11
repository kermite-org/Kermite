import { ISingleAssignEntryType, ISingleAssignEntry } from '~defs/ProfileData';
import { editorState } from './EditorModule';

export type IEditEntriesStock = {
  [K in ISingleAssignEntryType]: ISingleAssignEntry;
};

export const createDefaultEntriesStock = (): IEditEntriesStock => ({
  none: undefined,
  transparent: { type: 'transparent' },
  single2: { type: 'single2', mode: 'dual' },
});

interface IAssignEditState {
  editAssignType: ISingleAssignEntryType;
  editEntriesStock: IEditEntriesStock;
}

const assignEditState: IAssignEditState = {
  editAssignType: 'none',
  editEntriesStock: createDefaultEntriesStock(),
};

export const assignEditGetters = new (class {
  get editAssignType() {
    return assignEditState.editAssignType;
  }
})();

export const assignEditMutations = new (class {
  resetEntriesStock(assign: ISingleAssignEntry) {
    const stock = createDefaultEntriesStock();
    if (assign) {
      stock[assign.type] = assign;
    }
    assignEditState.editEntriesStock = stock;
  }

  setEditAssignEntryType(type: ISingleAssignEntryType) {
    assignEditState.editAssignType = type;
  }

  loadAssignSlot(assign: ISingleAssignEntry) {
    this.resetEntriesStock(assign);
    this.setEditAssignEntryType(assign?.type || 'none');
  }

  linkAssignSlot(slotAddress: string, type: ISingleAssignEntryType) {
    editorState.profileData.assigns[slotAddress] =
      assignEditState.editEntriesStock[type];
  }

  setEditAssignType(slotAddress: string, type: ISingleAssignEntryType) {
    this.setEditAssignEntryType(type);
    this.linkAssignSlot(slotAddress, type);
  }
})();
