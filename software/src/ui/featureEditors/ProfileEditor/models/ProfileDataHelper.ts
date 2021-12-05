import {
  IProfileData,
  IProfileAssignType,
  mapObjectValues,
  IAssignEntry,
} from '~/shared';

function convertSingleAssignToDualAssign(src: IAssignEntry): IAssignEntry {
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
        shiftCancelMode: profile.settings.shiftCancelMode,
        primaryDefaultTrigger: 'down',
        secondaryDefaultTrigger: 'down',
        tapHoldThresholdMs: 200,
        useInterruptHold: true,
      },
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertSingleAssignToDualAssign(it),
      ),
    };
  }
  if (profile.settings.assignType === 'dual' && dstAssignType === 'single') {
    return {
      ...profile,
      settings: {
        assignType: 'single',
        shiftCancelMode: profile.settings.shiftCancelMode,
      },
      assigns: mapObjectValues(
        profile.assigns,
        (it) => it && convertDualAssignToSingleAssign(it),
      ),
    };
  }
  return profile;
}

export function checkAssignValid(assign?: IAssignEntry): boolean {
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
