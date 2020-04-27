import { ISingleAssignEntryType, ISingleAssignEntry } from '~defs/ProfileData';
import { EditorModel } from './EditorModel';

export type IEditEntriesStock = {
  [K in ISingleAssignEntryType]: ISingleAssignEntry;
};

export const createDefaultEntriesStock = (): IEditEntriesStock => ({
  none: undefined,
  single: { type: 'single' }
  // transparent: { type: 'transparent' },
  // single2: { type: 'single2', mode: 'dual' }
});

export class AssignEditModel {
  constructor(private editorModule: EditorModel) {}

  //state

  editAssignType: ISingleAssignEntryType = 'none';
  editEntriesStock: IEditEntriesStock = createDefaultEntriesStock();

  //mutations

  handleAssignSlotChange = () => {
    const assign = this.editorModule.assignEntry;
    //assign S2 if blank
    // if (!assign) {
    //   assign = {
    //     type: 'single2',
    //     mode: 'dual',
    //     primaryOp: undefined,
    //     secondaryOp: undefined,
    //   };
    //   this.editorModule.writeAssignEntry(assign);
    // }
    this.editEntriesStock = createDefaultEntriesStock();
    const assignType = assign?.type || 'none';
    this.editEntriesStock[assignType] = assign;
    this.editAssignType = assignType;
  };

  setEditAssignType = (type: ISingleAssignEntryType) => {
    this.editorModule.writeAssignEntry(this.editEntriesStock[type]);
    this.editAssignType = type;
  };
}
