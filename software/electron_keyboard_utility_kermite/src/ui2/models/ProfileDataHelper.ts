import {
  IProfileData,
  IAssignEntry_Single,
  IAssignEntry_Dual,
  IProfileAssignType
} from '~defs/ProfileData';
import { mapObjectValues } from '~funcs/Utils';

function convertSignleAssignToDualAssign(
  src: IAssignEntry_Single
): IAssignEntry_Dual {
  return {
    type: 'dual',
    primaryOp: src.op
  };
}

function convertDualAssignToSingleAssign(
  src: IAssignEntry_Dual
): IAssignEntry_Single {
  return {
    type: 'single',
    op: src.primaryOp
  };
}

export function changeProfileDataAssignType(
  profile: IProfileData,
  dstAssignType: IProfileAssignType
): IProfileData {
  if (profile.assignType === dstAssignType) {
    return profile;
  }

  if (profile.assignType === 'single' && dstAssignType === 'dual') {
    return {
      ...profile,
      assignType: 'dual',
      settings: {
        type: 'dual',
        primaryDefaultTrigger: 'down',
        tapHoldThresholdMs: 200,
        useInterruptHold: true
      },
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertSignleAssignToDualAssign(it)
      )
    };
  }
  if (profile.assignType === 'dual' && dstAssignType === 'single') {
    return {
      ...profile,
      assignType: 'single',
      settings: {},
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertDualAssignToSingleAssign(it)
      )
    };
  }
  return profile;
}
