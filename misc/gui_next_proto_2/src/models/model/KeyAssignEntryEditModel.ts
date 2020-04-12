import { ISingleAssignEntry_Single2 } from '~defs/ProfileData';
import { IAssignEditSingle2_TargetSlotSig } from '~models/core/AssignEditSingle2Module';
import { editorModule } from '~models/core/EditorModule';

export interface IOperationSlotModel {
  text: string;
  isCurrent: boolean;
  setCurrent(): void;
}

export type IKeyAssignEntryEditModel_Single2 = {
  slots: IOperationSlotModel[];
};

type ITargetSlotSig = IAssignEditSingle2_TargetSlotSig;

const targetSlotSigs: ITargetSlotSig[] = ['pri', 'sec'];

const targetSlotSigToTextMap: { [key in ITargetSlotSig]: string } = {
  pri: 'primary',
  sec: 'secondary',
};

export function makeKeyAssignEntryEditModel_Single2(
  entry: ISingleAssignEntry_Single2
): IKeyAssignEntryEditModel_Single2 {
  const {
    targetSlotSig,
    setTargetSlotSig,
  } = editorModule.assignEditSingle2Module;
  const slots = targetSlotSigs.map((sig) => {
    return {
      text: targetSlotSigToTextMap[sig],
      isCurrent: targetSlotSig === sig,
      setCurrent: () => setTargetSlotSig(sig),
    };
  });
  return { slots };
}
