import { ISingleAssignEntry_Single2 } from '~defs/ProfileData';
import { IAssignEditSingle2_TargetSlotSig } from '~models/AssignEditSingle2Model';
import { editorModel } from '~models/EditorModel';

export interface IOperationSlotViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export type IKeyAssignEntryEditViewModel_Single2 = {
  slots: IOperationSlotViewModel[];
};

type ITargetSlotSig = IAssignEditSingle2_TargetSlotSig;

const targetSlotSigs: ITargetSlotSig[] = ['pri', 'sec'];

const targetSlotSigToTextMap: { [key in ITargetSlotSig]: string } = {
  pri: 'primary',
  sec: 'secondary',
};

export function makeKeyAssignEntryEditViewModel_Single2(
  entry: ISingleAssignEntry_Single2
): IKeyAssignEntryEditViewModel_Single2 {
  const {
    targetSlotSig,
    setTargetSlotSig,
  } = editorModel.assignEditSingle2Model;
  const slots = targetSlotSigs.map((sig) => {
    return {
      text: targetSlotSigToTextMap[sig],
      isCurrent: targetSlotSig === sig,
      setCurrent: () => setTargetSlotSig(sig),
    };
  });
  return { slots };
}
