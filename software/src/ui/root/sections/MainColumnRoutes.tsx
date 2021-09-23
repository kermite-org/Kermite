import { css, FC, jsx } from 'qx';
import {
  ProjectResourcePage,
  ProjectLayoutEditPage,
  ProjectPresetEditPage,
  ProjectSelectionPage,
  ProjectStandardFirmwareEditPage,
  SettingsPage,
  WelcomePage,
  ProjectCustomFirmwareCreatePage,
} from '~/ui/pages';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { FirmwareUpdatePage } from '~/ui/pages/firmware-update-page';
import { LayoutManagerPageComponent } from '~/ui/pages/layout-editor-page';
import { PresetBrowserPage } from '~/ui/pages/preset-browser-page';
import { PresetBrowserPage2 } from '~/ui/pages/preset-browser-page2';
import { ShapePreviewPage } from '~/ui/pages/shape-preview-page';
import { uiReaders, uiState } from '~/ui/store';

export const MainColumnRoutes: FC = () => {
  const { pageSpec } = uiState;
  if (pageSpec) {
    return (
      <div css={style}>
        {pageSpec.type === 'projectLayoutEdit' && (
          <ProjectLayoutEditPage spec={pageSpec} />
        )}
        {pageSpec.type === 'projectPresetEdit' && (
          <ProjectPresetEditPage spec={pageSpec} />
        )}
        {pageSpec.type === 'projectCustomFirmwareCreate' && (
          <ProjectCustomFirmwareCreatePage />
        )}
        {pageSpec.type === 'projectStandardFirmwareEdit' && (
          <ProjectStandardFirmwareEditPage spec={pageSpec} />
        )}
      </div>
    );
  }

  const { pagePath } = uiReaders;
  return (
    <div css={style}>
      {pagePath === '/assigner' && <AssignerPage />}
      {pagePath === '/layoutEditor' && <LayoutManagerPageComponent />}
      {pagePath === '/shapePreview' && <ShapePreviewPage />}
      {pagePath === '/firmwareUpdate' && <FirmwareUpdatePage />}
      {pagePath === '/presetBrowser' && <PresetBrowserPage />}
      {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
      {pagePath === '/settings' && <SettingsPage />}
      {pagePath === '/projectSelection' && <ProjectSelectionPage />}
      {pagePath === '/home' && <WelcomePage />}
      {pagePath === '/projectResource' && <ProjectResourcePage />}
    </div>
  );
};

const style = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;
