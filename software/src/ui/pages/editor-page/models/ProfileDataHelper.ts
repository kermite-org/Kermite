import {
  IProfileData,
  IProfileAssignType,
  mapObjectValues,
  IAssignEntry,
} from '~/shared';

function convertSignleAssignToDualAssign(src: IAssignEntry): IAssignEntry {
  if (src.type === 'block' || src.type === 'transparent') {
    return src;
  } else if (src.type === 'dual') {
    return src;
  } else if (src.type === 'single') {
    return {
      type: 'dual',
      primaryOp: src.op,
    };
  } else {
    return src as never;
  }
}

function convertDualAssignToSingleAssign(src: IAssignEntry): IAssignEntry {
  if (src.type === 'block' || src.type === 'transparent') {
    return src;
  } else if (src.type === 'single') {
    return src;
  } else if (src.type === 'dual') {
    return {
      type: 'single',
      op: src.primaryOp,
    };
  } else {
    return src as never;
  }
}

export function changeProfileDataAssignType(
  profile: IProfileData,
  dstAssignType: IProfileAssignType,
): IProfileData {
  if (profile.settings.assignType === dstAssignType) {
    return profile;
  }

  if (profile.settings.assignType === 'single' && dstAssignType === 'dual') {
    return {
      ...profile,
      settings: {
        assignType: 'dual',
        useShiftCancel: profile.settings.useShiftCancel,
        primaryDefaultTrigger: 'down',
        tapHoldThresholdMs: 200,
        useInterruptHold: true,
      },
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertSignleAssignToDualAssign(it),
      ),
    };
  }
  if (profile.settings.assignType === 'dual' && dstAssignType === 'single') {
    return {
      ...profile,
      settings: {
        assignType: 'single',
        useShiftCancel: profile.settings.useShiftCancel,
      },
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertDualAssignToSingleAssign(it),
      ),
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
