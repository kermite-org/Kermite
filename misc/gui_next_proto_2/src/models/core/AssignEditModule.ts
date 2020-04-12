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

export class AssignEditModule {
  //state

  editAssignType: ISingleAssignEntryType = 'none';
  editEntriesStock: IEditEntriesStock = createDefaultEntriesStock();

  //mutations

  private resetEntriesStock = (assign: ISingleAssignEntry) => {
    const stock = createDefaultEntriesStock();
    if (assign) {
      stock[assign.type] = assign;
    }
    this.editEntriesStock = stock;
  };

  private setEditAssignEntryType = (type: ISingleAssignEntryType) => {
    this.editAssignType = type;
  };

  loadAssignSlot = (assign: ISingleAssignEntry) => {
    this.resetEntriesStock(assign);
    this.setEditAssignEntryType(assign?.type || 'none');
  };

  linkAssignSlot = (slotAddress: string, type: ISingleAssignEntryType) => {
    editorState.profileData.assigns[slotAddress] = this.editEntriesStock[type];
  };

  setEditAssignType = (slotAddress: string, type: ISingleAssignEntryType) => {
    this.setEditAssignEntryType(type);
    this.linkAssignSlot(slotAddress, type);
  };
}
export const assignEditModule = new AssignEditModule();
