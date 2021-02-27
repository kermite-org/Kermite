import { h } from 'qx';
import { css } from 'qx/cssinjs';
import { uiTheme } from '~/ui-common';
import { DeviceControlSection } from './DeviceControl/DeviceControlSection';
import { ProfileConfigratuionModalLayer } from './EditorMainPart/views/modals/ProfileConfigurationPart';
import { KeyAssignEditView } from './KeyAssignEditView';
import { ProfileManagementPart } from './ProfileManagement/ProfileManagementPart';

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
        <ProfileManagementPart />
        <DeviceControlSection />
      </div>
      <div className="mainRow">
        <KeyAssignEditView />
      </div>
      <ProfileConfigratuionModalLayer />
    </div>
  );
}
