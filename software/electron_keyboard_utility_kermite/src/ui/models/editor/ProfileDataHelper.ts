import {
  IAssignEntry,
  IAssignEntry_DualEx,
  IAssignEntry_SingleEx,
  IProfileAssignType,
  IProfileData
} from '~defs/ProfileData';
import { mapObjectValues } from '~funcs/Utils';

function convertSignleAssignToDualAssign(
  src: IAssignEntry_SingleEx
): IAssignEntry_DualEx {
  if (src.type === 'block' || src.type === 'transparent') {
    return src;
  }
  return {
    type: 'dual',
    primaryOp: src.op
  };
}

function convertDualAssignToSingleAssign(
  src: IAssignEntry_DualEx
): IAssignEntry_SingleEx {
  if (src.type === 'block' || src.type === 'transparent') {
    return src;
  }
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

function checkAssignValid(assign?: IAssignEntry): boolean {
  if (assign === undefined) {
    return false;
  }
  if (assign.type === undefined) {
    return false;
  }
  if (assign.type === 'block') {
    return true;
  }
  if (assign.type === 'transparent') {
    return true;
  }

  if (assign.type === 'single') {
    return !!assign.op;
  }
  if (assign.type === 'dual') {
    return !!assign.primaryOp || !!assign.secondaryOp || !!assign.tertiaryOp;
  }

  return false;
}

export function removeInvalidProfileAssigns(profile: IProfileData) {
  let cnt = 0;
  const { assigns } = profile;
  for (const key in assigns) {
    const assign = assigns[key];
    if (!checkAssignValid(assign)) {
      delete assigns[key];
      cnt++;
    }
  }
  if (cnt > 0) {
    console.log(`${cnt} invalid assigns removed`);
  }
}
