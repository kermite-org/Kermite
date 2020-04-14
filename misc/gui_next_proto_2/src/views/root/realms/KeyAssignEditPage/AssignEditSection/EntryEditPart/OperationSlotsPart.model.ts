import { IAssignEditSingle2_TargetSlotSig } from '~models/AssignEditSingle2Model';
import { editorModel } from '~models/EditorModel';

export interface IOperationSlotViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export type IOperationSlotsPartViewModel_Single2 = {
  slots: IOperationSlotViewModel[];
};

type ITargetSlotSig = IAssignEditSingle2_TargetSlotSig;

const targetSlotSigs: ITargetSlotSig[] = ['pri', 'sec'];

const targetSlotSigToTextMap: { [key in ITargetSlotSig]: string } = {
  pri: 'primary',
  sec: 'secondary',
};

export function makeOperationSlotsPartViewModel_Single2(): IOperationSlotsPartViewModel_Single2 {
  // const { assignEntry } = editorModel;
  // const assignEntryViewModel =
  //   (assignEntry?.type === 'single2' &&
  //     makeKeyAssignEntryEditViewModel_Single2(assignEntry)) ||
  //   undefined;

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
