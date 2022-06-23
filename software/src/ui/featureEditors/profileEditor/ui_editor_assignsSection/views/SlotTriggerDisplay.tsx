import { css, FC, jsx } from 'alumina';
import { IProfileSettings_Dual } from '~/shared';
import { assignerModel } from '~/ui/featureEditors/ProfileEditor/models/AssignerModel';

type Props = {};

type ISlotTriggerDisplayText = 'normal' | 'tap' | 'hold' | 'double-tap';

function getSlotTriggerText(
  slotSig: string,
  hasPrimary: boolean,
  hasSecondary: boolean,
  hasTertiary: boolean,
  settings: IProfileSettings_Dual,
): ISlotTriggerDisplayText {
  if (slotSig === 'pri') {
    if (hasSecondary || hasTertiary) {
      return 'tap';
    } else if (settings.primaryDefaultTrigger === 'tap') {
      return 'tap';
    } else {
      return 'normal';
    }
  } else if (slotSig === 'sec') {
    if (hasPrimary || hasTertiary) {
      return 'hold';
    } else if (settings.secondaryDefaultTrigger === 'hold') {
      return 'hold';
    } else {
      return 'normal';
    }
  } else if (slotSig === 'ter') {
    return 'double-tap';
  } else {
    throw new Error(`invalid variable slotSig: ${slotSig}`);
  }
}

export const SlotTriggerDisplay: FC<Props> = () => {
  const {
    assignEntry,
    dualModeEditTargetOperationSig: slotSig,
    profileData: { settings },
  } = assignerModel;
  if (settings.assignType === 'dual' && assignEntry?.type === 'dual') {
    const hasPrimary = !!assignEntry.primaryOp;
    const hasSecondary = !!assignEntry.secondaryOp;
    const hasTertiary = !!assignEntry.tertiaryOp;

    const showTriggerText =
      (slotSig === 'pri' && hasPrimary) ||
      (slotSig === 'sec' && hasSecondary) ||
      (slotSig === 'ter' && hasTertiary);

    if (showTriggerText) {
      const triggerText = getSlotTriggerText(
        slotSig,
        hasPrimary,
        hasSecondary,
        hasTertiary,
        settings,
      );
      return (
        <div class={style}>
          trigger:
          <br /> {triggerText}
        </div>
      );
    }
  }
  return null;
};

const style = css`
  font-size: 14px;
`;
