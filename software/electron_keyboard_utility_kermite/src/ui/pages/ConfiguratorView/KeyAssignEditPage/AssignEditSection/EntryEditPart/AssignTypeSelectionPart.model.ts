/* eslint-disable @typescript-eslint/no-unused-vars */
import { IAssignEntryType } from '~defs/ProfileData';
import { editorModel } from '~ui/models';

interface IAssignTypeSlotViewModel {
  assignType: IAssignEntryType;
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

const entryTypes: IAssignEntryType[] = [
  'none',
  'single'
  // 'transparent',
  // 'single1',
  // 'single2'
  // 'singleVersatile1'
];

const entryTypeToTextMap: { [key in IAssignEntryType]: string } = {
  none: '無',
  single: 'S',
  dual: 'D'
  // transparent: '透',
  // single1: 'S1',
  // single2: 'S2'
  // singleVersatile1: 'SV1'
};

export interface IKeyAssignTypeSelectionViewModel {
  slots: IAssignTypeSlotViewModel[];
}

export function makeKeyAssignTypeSelectionPartViewModel(): IKeyAssignTypeSelectionViewModel {
  // const { editAssignType, setEditAssignType } = editorModel.assignEditModel;
  // const slots = entryTypes.map((assignType) => {
  //   return {
  //     assignType,
  //     text: entryTypeToTextMap[assignType],
  //     isCurrent: assignType === editAssignType,
  //     setCurrent: () => setEditAssignType(assignType)
  //   };
  // });

  return {
    slots: [
      {
        assignType: 'single',
        text: 'S1',
        isCurrent: true,
        setCurrent: () => {}
      }
    ]
  };
  // return { slots };
}
