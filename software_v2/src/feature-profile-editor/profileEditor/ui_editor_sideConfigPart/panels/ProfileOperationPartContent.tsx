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
    actions: {
      openConfigurationPanel,
      openRoutingPanel,
      toggleShowTestInputArea,
    },
  } = profileEditorStore;
  return domStyled(
    <div>
      <div class="config-buttons-part">
        <ConfigurationButton
          iconSpec="fa fa-cog"
          onClick={openConfigurationPanel}
        />
        <ConfigurationButton iconSpec="fa fa-list" onClick={openRoutingPanel} />
        <ConfigurationButton
          iconSpec="far fa-edit"
          onClick={toggleShowTestInputArea}
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
