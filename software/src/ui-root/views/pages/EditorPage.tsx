import { uiTheme } from '@ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { ProfileConfigratuionModalLayer } from '../modals/ProfileConfigurationPart';
import { DeviceControlSection } from '../organisms/DeviceControlSection';
import { KeyAssignEditView } from '../organisms/KeyAssignEditView';
import { ProfileManagementPart } from '../organisms/ProfilesSection/ProfileManagementPart';

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
