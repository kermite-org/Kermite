import { css, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { KeyAssignEditView } from './KeyAssignEditView';
import { DeviceControlSection } from './ui_bar_deviceControlSection/DeviceControlSection';
import { ProfileManagementPart } from './ui_bar_profileManagement/ProfileManagementPart';
import { ProfileConfigratuionModalLayer } from './ui_modal_profileConfiguration';

const cssEditorPage = css`
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

export function EditorPage() {
  return (
    <div css={cssEditorPage}>
      <div className="topRow">
        <ProfileManagementPart className="profile-management-part" />
        <DeviceControlSection />
      </div>
      <div className="mainRow">
        <KeyAssignEditView />
      </div>
      <ProfileConfigratuionModalLayer />
    </div>
  );
}
