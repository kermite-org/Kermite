import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~contract/data';
import { ModifierVirtualKey } from '~model/HighLevelDefs';
import { AssignSlotCard } from './AssignSlotCards';
import { isAssignModifierActive } from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';

const modifiresGroup: ModifierVirtualKey[] = [
  'K_Shift',
  'K_Ctrl',
  'K_Alt',
  'K_OS'
];

export const ModifierSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  setCurrentModifiers(modifierKey: ModifierVirtualKey, enabled: boolean): void;
}) => {
  const { currentAssign, setCurrentModifiers } = props;

  const cssBox = css`
    flex-shrink: 0;
    > * {
      margin: ${UiTheme.assignPallet.commonMargin};
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
