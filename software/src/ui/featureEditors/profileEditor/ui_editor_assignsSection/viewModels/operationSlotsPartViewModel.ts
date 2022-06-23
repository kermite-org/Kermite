import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/profileEditor/models/assignerModel';

export interface IOperationSlotViewModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
  hint: string;
}

export type IOperationSlotsPartViewModel = {
  slots: IOperationSlotViewModel[];
};

type ISlotSource = {
  sig: 'pri' | 'sec' | 'ter';
  text: string;
  hint: string;
};

const slotsSource: ISlotSource[] = [
  { sig: 'pri', text: 'primary', hint: texts.assignerAssignsPaletteHint.pri },
  {
    sig: 'sec',
    text: 'secondary',
    hint: texts.assignerAssignsPaletteHint.sec,
  },
  { sig: 'ter', text: 'tertiary', hint: texts.assignerAssignsPaletteHint.ter },
];

export function makeOperationSlotsPartViewModel(): IOperationSlotsPartViewModel {
  const {
    assignEntry,
    isSlotSelected,
    dualModeEditTargetOperationSig,
    setDualModeEditTargetOperationSig,
  } = assignerModel;

  const slots = slotsSource.map((it) => {
    return {
      text: it.text,
      isCurrent:
        isSlotSelected &&
        assignEntry?.type !== 'block' &&
        assignEntry?.type !== 'transparent' &&
        dualModeEditTargetOperationSig === it.sig,
      setCurrent: () => setDualModeEditTargetOperationSig(it.sig),
      hint: it.hint,
    };
  });
  return { slots };
}
