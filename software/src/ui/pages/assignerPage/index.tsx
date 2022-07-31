import { css, FC, jsx } from 'alumina';
import { colors, texts } from '~/ui/base';
import { ConfigurationButton } from '~/ui/elements';
import { KeyAssignEditView } from '~/ui/featureEditors';
import { ProfileConfigurationModalLayer } from '~/ui/featureEditors/profileEditor/ui_modal_profileConfiguration';
import {
  profilesReader,
  updateProfileDataSourceHandling,
} from '~/ui/pages/assignerPage/models';
import { uiActions } from '~/ui/store';
import { ProfileManagementPart } from './ui_bar_profileManagement/ProfileManagementPart';

export const AssignerPage: FC = () => {
  updateProfileDataSourceHandling();
  return (
    <div class={style}>
      <div class="topRow">
        <ProfileManagementPart class="profile-management-part" />
        {/* <DeviceControlSection /> */}
        <div class="buttons-part">
          <ConfigurationButton
            onClick={() => uiActions.navigateTo('/widget')}
            iconSpec="fa fa-feather-alt"
            data-hint={texts.titleBarHint.switchToWidgetView}
            disabled={!profilesReader.isEditProfileAvailable}
          />
        </div>
      </div>
      <div class="mainRow">
        <KeyAssignEditView />
      </div>
      <ProfileConfigurationModalLayer />
    </div>
  );
};

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;

  > .topRow {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    background: ${colors.clPanelBox};
    height: 40px;
    align-items: center;

    > .profile-management-part {
      margin-right: 40px;
    }

    > .buttons-part {
      margin: 0 10px;
    }
  }

  > .mainRow {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    > * {
      flex-grow: 1;
    }
  }
`;
