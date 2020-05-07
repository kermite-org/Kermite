import { IDualModeEditTargetOperationSig } from '~ui2/models/EditorModel';
import { editorModel } from '~ui2/models/zAppDomain';

export interface IOperationSlotViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export type IOperationSlotsPartViewModel = {
  slots: IOperationSlotViewModel[];
};

const targetSlotSigs: IDualModeEditTargetOperationSig[] = ['pri', 'sec'];

const targetSlotSigToTextMap: {
  [key in IDualModeEditTargetOperationSig]: string;
} = {
  pri: 'pri',
  sec: 'sec'
};

export function makeOperationSlotsPartViewModel(): IOperationSlotsPartViewModel {
  const {
    isSlotSelected,
    dualModeEditTargetOperationSig,
    setDualModeEditTargetOperationSig
  } = editorModel;

  const slots = targetSlotSigs.map((sig) => {
    return {
      text: targetSlotSigToTextMap[sig],
      isCurrent: isSlotSelected && dualModeEditTargetOperationSig === sig,
      setCurrent: () => setDualModeEditTargetOperationSig(sig)
    };
  });
  return { slots };
}
