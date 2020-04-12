import { ISingleAssignEntryType } from '~defs/ProfileData';
import {
  makeKeyAssignEntryEditViewModel_Single2,
  IKeyAssignEntryEditViewModel_Single2,
} from './KeyAssignEntryEditViewModel';
import { editorModel } from '~models/EditorModel';

interface IAssignTypeSlotViewModel {
  assignType: ISingleAssignEntryType;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

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

export interface IKeyAssignEditViewModel {
  assignTypeSlotViewModels: IAssignTypeSlotViewModel[];
  assignEntryViewModel: IKeyAssignEntryEditViewModel_Single2 | undefined;
}

export function makeKeyAssignEditViewModel(): IKeyAssignEditViewModel {
  const { editAssignType, setEditAssignType } = editorModel.assignEditModel;
  const assignTypeSlotViewModels = entryTypes.map((assignType) => {
    return {
      assignType,
      text: entryTypeToTextMap[assignType],
      isCurrent: assignType === editAssignType,
      setCurrent: () => setEditAssignType(assignType),
    };
  });

  const { assignEntry } = editorModel;
  const assignEntryViewModel =
    (assignEntry?.type === 'single2' &&
      makeKeyAssignEntryEditViewModel_Single2(assignEntry)) ||
    undefined;

  return {
    assignEntryViewModel,
    assignTypeSlotViewModels,
  };
}
