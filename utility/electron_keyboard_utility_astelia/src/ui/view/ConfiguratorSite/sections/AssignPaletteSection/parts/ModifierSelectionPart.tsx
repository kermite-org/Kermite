import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~contract/data';
import { ModifierVirtualKeys } from '~model/HighLevelDefs';
import { assignPaletteLocalTheme } from '../assignPaletteLocalTheme';
import { AssignSlotCard } from '../components/AssignSlotCard';
import { isAssignModifierActive } from '~ui/state/editor';

const modifiresGroup: ModifierVirtualKeys[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_OS'
];

export const ModifierSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  setCurrentModifiers(modifierKey: ModifierVirtualKeys, enabled: boolean): void;
}) => {
  const { currentAssign, setCurrentModifiers } = props;

  const cssBox = css`
    flex-shrink: 0;
    > * {
      margin: ${assignPaletteLocalTheme.commonMargin};
    }
  `;

  return (
    <div css={cssBox}>
      {modifiresGroup.map(mo => {
        const isActive = isAssignModifierActive(currentAssign, mo);
        return (
          <AssignSlotCard
            virtualKey={mo}
            isActive={isActive}
            onClick={() => setCurrentModifiers(mo, !isActive)}
            key={mo}
          ></AssignSlotCard>
        );
      })}
    </div>
  );
};
