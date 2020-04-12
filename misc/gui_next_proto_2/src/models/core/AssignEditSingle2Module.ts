export type IAssignEditSingle2_TargetSlotSig = 'pri' | 'sec';

export class AssignEditSingle2Module {
  //state
  targetSlotSig: IAssignEditSingle2_TargetSlotSig = 'pri';

  //getters
  get fieldPath(): 'primaryOp' | 'secondaryOp' {
    return this.targetSlotSig === 'pri' ? 'primaryOp' : 'secondaryOp';
  }

  //mutations
  setTargetSlotSig = (sig: IAssignEditSingle2_TargetSlotSig) => {
    this.targetSlotSig = sig;
  };
}
