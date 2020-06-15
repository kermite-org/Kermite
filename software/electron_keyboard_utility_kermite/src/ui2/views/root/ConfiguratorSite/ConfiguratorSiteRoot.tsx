import { css } from 'goober';
import { KeyAssignEditPage } from './KeyAssingEditPage/KeyAssignEditPage';
import { h } from '~ui2/views/basis/qx';
import { ProfileManagementPart } from './KeyAssingEditPage/ProfilesSection/ProfileManagementPart';
import { CustomWindowFrame } from './WindowFrame/CustomWindowFrame';
import { UiTheme } from '~ui2/views/common/UiTheme';
import { DeviceControlSection } from './KeyAssingEditPage/DeviceControlSection';
import { GlobalMenuPart } from './GlobalMenu';
import { appDomain } from '~ui2/models/zAppDomain';
import { KeyboardShapePreviewPage } from './KeyboardShapePreviewPage';

export function ConfiguratorSiteRootContent() {
  const cssPageRoot = css`
    height: 100%;
    display: flex;
    flex-direction: column;

    > .topRow {
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      background: #000;
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
    </div>
  );
}

export const ConfiguratorSiteRoot = () => {
  const cssContentRow = css`
    background: ${UiTheme.clBackground};
    color: #fff;
    display: flex;
  `;

  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${UiTheme.clNavigationColumn};
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
