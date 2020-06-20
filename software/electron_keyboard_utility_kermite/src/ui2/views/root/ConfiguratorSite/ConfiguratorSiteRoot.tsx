import { css } from 'goober';
import { KeyAssignEditPage } from './KeyAssignEditPage/KeyAssignEditPage';
import { h } from '~ui2/views/basis/qx';
import { ProfileManagementPart } from './KeyAssignEditPage/ProfilesSection/ProfileManagementPart';
import { CustomWindowFrame } from './WindowFrame/CustomWindowFrame';
import { DeviceControlSection } from './KeyAssignEditPage/DeviceControlSection';
import { GlobalMenuPart } from './GlobalMenu';
import { appDomain } from '~ui2/models/zAppDomain';
import { KeyboardShapePreviewPage } from './ShapePreviewPage/ShapePreviewPage';
import { ProfileConfigratuionModalLayer } from './KeyAssignEditPage/ProfileConfigurationPart';
import { uiTheme } from '~ui2/models/UiTheme';

export function ConfiguratorSiteRootContent() {
  const cssPageRoot = css`
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

  return (
    <div css={cssPageRoot}>
      <div className="topRow">
        <ProfileManagementPart />
        <DeviceControlSection />
      </div>
      <div className="mainRow">
        <KeyAssignEditPage />
      </div>
      <ProfileConfigratuionModalLayer />
    </div>
  );
}

export const ConfiguratorSiteRoot = () => {
  const cssContentRow = css`
    background: ${uiTheme.colors.clBackground};
    color: ${uiTheme.colors.clMainText};
    display: flex;
  `;

  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${uiTheme.colors.clNavigationColumn};
    padding: 10px;
  `;

  const cssMainColumn = css`
    flex-grow: 1;
  `;

  const showEditor = appDomain.uiStatusModel.settings.page === 'editor';
  const showShapePreview =
    appDomain.uiStatusModel.settings.page === 'shapePreview';
  return (
    <CustomWindowFrame>
      <div css={cssContentRow}>
        <div css={cssNavigationColumn}>
          <GlobalMenuPart />
        </div>
        <div css={cssMainColumn}>
          {showEditor && <ConfiguratorSiteRootContent />}
          {showShapePreview && <KeyboardShapePreviewPage />}
        </div>
      </div>
    </CustomWindowFrame>
  );
};
