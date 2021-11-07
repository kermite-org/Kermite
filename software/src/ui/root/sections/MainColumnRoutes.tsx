import { FC, jsx } from 'qx';
import {
  PresetBrowserPage,
  PresetBrowserPage2,
  ProjectCustomFirmwareCreatePage,
  ProjectLayoutEditPage,
  ProjectPresetEditPage,
  ProjectQuickSetupPage,
  ProjectResourcePage,
  ProjectSelectionPage,
  ProjectStandardFirmwareEditPage,
  SettingsPage,
  WelcomePage,
} from '~/ui/pages';
import { FirmwareFlashPage } from '~/ui/pages/FirmwareFlashPage';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { FirmwareUpdatePage } from '~/ui/pages/firmware-update-page';
import { LayoutManagerPageComponent } from '~/ui/pages/layout-editor-page';
import { ShapePreviewPage } from '~/ui/pages/shape-preview-page';
import { uiReaders, uiState } from '~/ui/store';

export const MainColumnRoutes: FC = () => {
  const { pageSpec } = uiState;
  if (pageSpec) {
    return (
      <div>
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
    <div>
      {pagePath === '/assigner' && <AssignerPage />}
      {pagePath === '/layoutEditor' && <LayoutManagerPageComponent />}
      {pagePath === '/shapePreview' && <ShapePreviewPage />}
      {pagePath === '/firmwareUpdate' && <FirmwareUpdatePage />}
      {pagePath === '/firmwareFlash' && <FirmwareFlashPage />}
      {pagePath === '/presetBrowser' && <PresetBrowserPage />}
      {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
      {pagePath === '/settings' && <SettingsPage />}
      {pagePath === '/projectSelection' && <ProjectSelectionPage />}
      {pagePath === '/home' && <WelcomePage />}
      {pagePath === '/projectResource' && <ProjectResourcePage />}
      {pagePath.startsWith('/projectQuickSetup') && <ProjectQuickSetupPage />}
    </div>
  );
};
