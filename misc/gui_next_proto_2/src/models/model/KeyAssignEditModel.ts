import { ISingleAssignEntry, ISingleAssignEntryType } from '~defs/ProfileData';
import { editorState } from '~models/core/EditorState';

const entryTypes: ISingleAssignEntryType[] = [
  'none',
  'transparent',
  // 'single1',
  'single2',
  // 'singleVersatile1'
];

const entryTypeToTextMap: { [key in ISingleAssignEntryType]: string } = {
  none: '無',
  transparent: '透',
  // single1: 'S1',
  single2: 'S2',
  // singleVersatile1: 'SV1'
};

type IEditEntriesStock = {
  [K in ISingleAssignEntryType]: ISingleAssignEntry;
};

const createDefaultEntriesStock = (): IEditEntriesStock => ({
  none: undefined,
  transparent: { type: 'transparent' },
  single2: { type: 'single2', mode: 'dual' },
});

interface IAssignTypeSlotModel {
  assignType: ISingleAssignEntryType;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export class KeyAssignEditModel {
  readonly slotAddress: string;
  private editAssignType: ISingleAssignEntryType;
  private editEntriesStock: IEditEntriesStock;

  private get profileDataAssignEntry(): ISingleAssignEntry {
    return editorState.profileData.assigns[this.slotAddress];
  }

  get assignEntryModel() {
    // return new AssignEntryModel(this.profileDataAssignEntry)
    return this.profileDataAssignEntry;
  }

  constructor(slotAddress: string) {
    this.slotAddress = slotAddress;
    this.editEntriesStock = createDefaultEntriesStock();
    this.editAssignType = this.profileDataAssignEntry?.type || 'none';
    this.editEntriesStock[this.editAssignType] =
      editorState.profileData.assigns[this.slotAddress];
  }

  private setAssignEntryType(type: ISingleAssignEntryType) {
    this.editAssignType = type;
    editorState.profileData.assigns[this.slotAddress] = this.editEntriesStock[
      this.editAssignType
    ];
  }

  get assignTypeSlotModels(): IAssignTypeSlotModel[] {
    return entryTypes.map((assignType) => {
      return {
        assignType,
        text: entryTypeToTextMap[assignType],
        isCurrent: assignType === this.editAssignType,
        setCurrent: () => this.setAssignEntryType(assignType),
      };
    });
  }
}
