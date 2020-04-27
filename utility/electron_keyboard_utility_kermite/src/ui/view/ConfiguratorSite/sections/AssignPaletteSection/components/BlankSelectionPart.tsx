import { css, jsx } from '@emotion/core';
import { IKeyAssignEntry } from '~defs/data';
import { isAssignKeyBlank } from '~ui/state/editor';
import { UiTheme } from '~ui/view/ConfiguratorSite/UiTheme';
import { AssignModeButtonRaw } from './AssignSlotCards';

export const BlankSelectionPart = (props: {
  currentAssign: IKeyAssignEntry | undefined;
  isSlotSelected: boolean;
  clearCurrentAssign(): void;
}) => {
  const { currentAssign, clearCurrentAssign, isSlotSelected } = props;

  const cssBox = css`
    flex-shrink: 0;
    margin: ${UiTheme.assignPallet.commonMargin};
  `;

  const isActive = isSlotSelected && isAssignKeyBlank(currentAssign);

  return (
    <div css={cssBox}>
      <AssignModeButtonRaw
        text="none"
        isActive={isActive}
        onClick={() => clearCurrentAssign()}
      ></AssignModeButtonRaw>
    </div>
  );
};
