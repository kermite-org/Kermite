import { models } from '~/ui-root/zones/common/commonModels';
import { IDualModeEditTargetOperationSig } from '~/ui-root/zones/editor/models/EditorModel';

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
  ter: 'ter',
};

export function makeOperationSlotsPartViewModel(): IOperationSlotsPartViewModel {
  const {
    assignEntry,
    isSlotSelected,
    dualModeEditTargetOperationSig,
    setDualModeEditTargetOperationSig,
  } = models.editorModel;

  const slots = targetSlotSigs.map((sig) => {
    return {
      text: targetSlotSigToTextMap[sig],
      isCurrent:
        isSlotSelected &&
        assignEntry?.type !== 'block' &&
        assignEntry?.type !== 'transparent' &&
        dualModeEditTargetOperationSig === sig,
      setCurrent: () => setDualModeEditTargetOperationSig(sig),
    };
  });
  return { slots };
}
