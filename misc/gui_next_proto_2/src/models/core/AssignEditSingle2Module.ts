export type IAssignEditSingle2_TargetSlotSig = 'pri' | 'sec';

interface IAssignEditSingle2 {
  targetSlotSig: IAssignEditSingle2_TargetSlotSig;
}

export const assignEditSing2State: IAssignEditSingle2 = {
  targetSlotSig: 'pri',
};

export const assignEditSingle2Getters = new (class {
  get targetSlotSig() {
    return assignEditSing2State.targetSlotSig;
  }
})();

export const assignEditSingle2Mutations = {
  setTargetSlotSig(sig: IAssignEditSingle2_TargetSlotSig) {
    assignEditSing2State.targetSlotSig = sig;
  },
};
