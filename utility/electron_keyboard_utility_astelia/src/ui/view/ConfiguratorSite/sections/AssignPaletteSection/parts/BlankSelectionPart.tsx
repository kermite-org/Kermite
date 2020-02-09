import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~contract/data';
import { assignPaletteLocalTheme } from '../assignPaletteLocalTheme';
import { AssignSlotCard } from '../components/AssignSlotCard';
import { isAssignKeyBlank } from '~ui/state/editor';

export const BlankSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  isSlotSelected: boolean;
  clearCurrentAssign(): void;
}) => {
  const { currentAssign, clearCurrentAssign, isSlotSelected } = props;

  const cssBox = css`
    flex-shrink: 0;
    margin: ${assignPaletteLocalTheme.commonMargin};
  `;

  const isActive = isSlotSelected && isAssignKeyBlank(currentAssign);

  return (
    <div css={cssBox}>
      <AssignSlotCard
        virtualKey={'K_NONE'}
        isActive={isActive}
        onClick={() => clearCurrentAssign()}
      ></AssignSlotCard>
    </div>
  );
};
