import { css, FC, jsx } from 'qx';
import { editorModel } from '~/ui/pages/editor-page/models/EditorModel';

type ISlotTriggerDisplayText = 'normal' | 'tap' | 'hold' | 'double-tap';

function getSlotTriggerText(
  slotSig: string,
  hasPrimary: boolean,
  hasSecondary: boolean,
  hasTertiary: boolean,
): ISlotTriggerDisplayText {
  if (slotSig === 'pri') {
    return hasSecondary || hasTertiary ? 'tap' : 'normal';
  } else if (slotSig === 'sec') {
    return hasPrimary || hasTertiary ? 'hold' : 'normal';
  } else if (slotSig === 'ter') {
    return 'double-tap';
  } else {
    throw new Error(`invalid variable slotSig: ${slotSig}`);
  }
}

const style = css`
  font-size: 14px;
`;

export const SlotTriggerDisplay: FC<{ className?: string }> = ({
  className,
}) => {
  const { assignEntry, dualModeEditTargetOperationSig: slotSig } = editorModel;
  if (assignEntry?.type === 'dual') {
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
      );
      return (
        <div css={style} className={className}>
          trigger:
          <br /> {triggerText}
        </div>
      );
    }
  }
  return null;
};
