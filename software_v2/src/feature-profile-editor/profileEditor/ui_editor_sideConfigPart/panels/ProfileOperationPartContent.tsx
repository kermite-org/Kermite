import { css, domStyled, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { ConfigurationButton, OperationButtonWithIcon } from '~/fe-shared';
import { profileEditorStore } from '../../../store';
import { profileEditorConfig } from '../../adapters';

export const ProfileOperationPartContent: FC = () => {
  const {
    readers: { canWriteKeymapping },
    actions: { writeKeymapping },
  } = profileEditorConfig;
  const {
    actions: { toggleConfigurationPanel, toggleRoutingPanel },
  } = profileEditorStore;
  return domStyled(
    <div>
      <div class="config-buttons-part">
        <ConfigurationButton
          onClick={toggleConfigurationPanel}
          iconSpec="fa fa-cog"
        />
        <ConfigurationButton
          onClick={toggleRoutingPanel}
          iconSpec="fa fa-list"
        />
      </div>
      <OperationButtonWithIcon
        onClick={writeKeymapping}
        disabled={!canWriteKeymapping}
        icon="double_arrow"
        label={texts.assignerTopBar.writeAssignsButton}
        hint={texts.assignerTopBarHint.writeAssignsButton}
      />
    </div>,
    css`
      padding: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      > .config-buttons-part {
        display: flex;
        gap: 10px;
      }
    `,
  );
};
