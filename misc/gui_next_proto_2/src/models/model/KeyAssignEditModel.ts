import { ISingleAssignEntryType } from '~defs/ProfileData';
import {
  makeKeyAssignEntryEditModel_Single2,
  IKeyAssignEntryEditModel_Single2,
} from './KeyAssignEntryEditModel';
import { editorModule } from '~models/core/EditorModule';

interface IAssignTypeSlotModel {
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

export interface IKeyAssignEditModel {
  assignTypeSlotModels: IAssignTypeSlotModel[];
  assignEntryModel: IKeyAssignEntryEditModel_Single2 | undefined;
}

export function makeKeyAssignEditModel(): IKeyAssignEditModel {
  const { editAssignType, setEditAssignType } = editorModule.assignEditModule;
  const assignTypeSlotModels = entryTypes.map((assignType) => {
    return {
      assignType,
      text: entryTypeToTextMap[assignType],
      isCurrent: assignType === editAssignType,
      setCurrent: () => setEditAssignType(assignType),
    };
  });

  const { assignEntry } = editorModule;
  const assignEntryModel =
    (assignEntry?.type === 'single2' &&
      makeKeyAssignEntryEditModel_Single2(assignEntry)) ||
    undefined;

  return {
    assignEntryModel,
    assignTypeSlotModels,
  };
}
