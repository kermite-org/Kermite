import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~contract/data';
import { assignPaletteLocalTheme } from '../assignPaletteLocalTheme';
import { AssignSlotCard } from '../components/AssignSlotCard';

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

  const isCurrent =
    isSlotSelected &&
    (currentAssign === undefined ||
      (currentAssign.type === 'keyInput' &&
        currentAssign.virtualKey === 'K_NONE'));

  return (
    <div css={cssBox}>
      <AssignSlotCard
        virtualKey={'K_NONE'}
        isActive={isCurrent}
        onClick={() => clearCurrentAssign()}
      ></AssignSlotCard>
    </div>
  );
};
