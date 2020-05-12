import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import { DualModeSettingsPart } from './DualModeSettingsPart';

export const ProfileConfigurationPart = () => {
  const cssBase = css`
    padding: 5px;
  `;

  return (
    <div css={cssBase}>
      <div>profile settings</div>
      <AssignTypeSelectionPart />
      <DualModeSettingsPart />
    </div>
  );
};
