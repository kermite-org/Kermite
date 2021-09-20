import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { KeyAssignEditView } from '~/ui/editors';
import { ProfileConfigurationModalLayer } from '~/ui/editors/ProfileEditor/ui_modal_profileConfiguration';
import { DeviceControlSection } from './ui_bar_deviceControlSection/DeviceControlSection';
import { ProfileManagementPart } from './ui_bar_profileManagement/ProfileManagementPart';

export const AssignerPage: FC = () => {
  return (
    <div css={style}>
      <div className="topRow">
        <ProfileManagementPart className="profile-management-part" />
        <DeviceControlSection />
      </div>
      <div className="mainRow">
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
    background: ${uiTheme.colors.clPanelBox};
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
