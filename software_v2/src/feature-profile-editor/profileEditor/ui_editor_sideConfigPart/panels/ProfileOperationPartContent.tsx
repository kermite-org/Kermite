import { css, domStyled, FC, jsx } from 'alumina';
import { texts } from '~/app-shared';
import { ConfigurationButton, OperationButtonWithIcon } from '~/fe-shared';
import { profileEditorConfig } from '../../adapters';

export const ProfileOperationPartContent: FC = () => {
  const { isEditProfileAvailable, readers, actions } = profileEditorConfig;
  return domStyled(
    <div>
      <div class="config-buttons-part">
        <ConfigurationButton
          onClick={actions.openConfigurationModal}
          iconSpec="fa fa-cog"
          disabled={!isEditProfileAvailable}
        />
        <ConfigurationButton
          onClick={actions.toggleRoutingPanel}
          iconSpec="fa fa-list"
          disabled={!isEditProfileAvailable}
        />
      </div>
      <OperationButtonWithIcon
        onClick={actions.writeKeymapping}
        disabled={!readers.canWriteKeymapping}
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
