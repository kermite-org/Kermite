import { texts } from '~/ui/base';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';

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
  { sig: 'pri', text: 'primary', hint: texts.hint_assigner_assigns_pri },
  { sig: 'sec', text: 'secondary', hint: texts.hint_assigner_assigns_sec },
  { sig: 'ter', text: 'tertiary', hint: texts.hint_assigner_assigns_ter },
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
