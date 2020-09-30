import { IDualModeEditTargetOperationSig } from '~ui/models/EditorModel';
import { editorModel } from '~ui/models';

export interface IOperationSlotViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export type IOperationSlotsPartViewModel = {
  slots: IOperationSlotViewModel[];
};

const targetSlotSigs: IDualModeEditTargetOperationSig[] = ['pri', 'sec', 'ter'];

const targetSlotSigToTextMap: {
  [key in IDualModeEditTargetOperationSig]: string;
} = {
  pri: 'pri',
  sec: 'sec',
  ter: 'ter'
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
