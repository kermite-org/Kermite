import { ISingleAssignEntry_Single2 } from '~defs/ProfileData';

type TargetSlotSig = 'pri' | 'sec';

interface IState {
  targetSlot: TargetSlotSig;
}

const localModelState: IState = {
  targetSlot: 'pri',
};

type IKeyAssignEntryEditModel_Single2 = {
  isPrimaryCurrent: boolean;
  isSecondaryCurrent: boolean;
  setPrimaryCurrent(): void;
  setSecondaryCurrent(): void;
};

export function makeKeyAssignEntryEditModel(
  entry: ISingleAssignEntry_Single2
): IKeyAssignEntryEditModel_Single2 {
  const { targetSlot } = localModelState;
  const setTargetSlot = (sig: TargetSlotSig) =>
    (localModelState.targetSlot = sig);

  const isPrimaryCurrent = targetSlot === 'pri';
  const isSecondaryCurrent = targetSlot === 'sec';
  const setPrimaryCurrent = () => setTargetSlot('pri');
  const setSecondaryCurrent = () => setTargetSlot('sec');

  return {
    isPrimaryCurrent,
    isSecondaryCurrent,
    setPrimaryCurrent,
    setSecondaryCurrent,
  };
}
