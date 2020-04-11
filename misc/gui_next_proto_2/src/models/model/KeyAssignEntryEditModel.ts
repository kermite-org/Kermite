import { ISingleAssignEntry_Single2 } from '~defs/ProfileData';

type TargetSlotSig = 'pri' | 'sec';

interface IState {
  targetSlot: TargetSlotSig;
}

const localModelState: IState = {
  targetSlot: 'pri',
};

export interface IOperationSlotModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

const targetSlotSigs: TargetSlotSig[] = ['pri', 'sec'];

type IKeyAssignEntryEditModel_Single2 = {
  slots: IOperationSlotModel[];
};

export function makeKeyAssignEntryEditModel(
  entry: ISingleAssignEntry_Single2
): IKeyAssignEntryEditModel_Single2 {
  const { targetSlot } = localModelState;
  const setTargetSlot = (sig: TargetSlotSig) =>
    (localModelState.targetSlot = sig);
  const slots: IOperationSlotModel[] = targetSlotSigs.map((sig) => {
    return {
      text: sig === 'pri' ? 'primary' : 'secondary',
      isCurrent: targetSlot === sig,
      setCurrent: () => setTargetSlot(sig),
    };
  });
  return {
    slots,
  };
}
