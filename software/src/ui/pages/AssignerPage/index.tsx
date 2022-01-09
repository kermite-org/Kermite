import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { KeyAssignEditView } from '~/ui/featureEditors';
import { ProfileConfigurationModalLayer } from '~/ui/featureEditors/ProfileEditor/ui_modal_profileConfiguration';
import { updateProfileDataSourceHandling } from '~/ui/pages/AssignerPage/models';
import { DeviceControlSection } from './ui_bar_deviceControlSection/DeviceControlSection';
import { ProfileManagementPart } from './ui_bar_profileManagement/ProfileManagementPart';

export const AssignerPage: FC = () => {
  updateProfileDataSourceHandling();
  return (
    <div class={style}>
      <div class="topRow">
        <ProfileManagementPart class="profile-management-part" />
        <DeviceControlSection />
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
      margin-right: 50px;
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
