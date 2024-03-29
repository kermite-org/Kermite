import { FC, jsx } from 'alumina';
import {
  PresetBrowserPage,
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
import { ExternalFirmwareProjectSetupPage } from '~/ui/pages/ExternalFirmwareProjectSetupWizardPage';
import { FirmwareFlashPage } from '~/ui/pages/FirmwareFlashPage';
import { ProfileSetupWizardPage } from '~/ui/pages/ProfileSetupWizardPage';
import { AssignerPage } from '~/ui/pages/assignerPage';
import { FirmwareUpdatePage } from '~/ui/pages/firmwareUpdatePage';
import { LayoutManagerPageComponent } from '~/ui/pages/layoutEditorPage';
import { ProjectReviewPage } from '~/ui/pages/projectReviewPage';
import { ShapePreviewPage } from '~/ui/pages/shapePreviewPage';
import { uiReaders, uiState } from '~/ui/store';

export const MainColumnRoutes: FC = () => {
  const { pageSpec } = uiState;
  if (pageSpec) {
    return (
      <div>
        {pageSpec.type === 'projectLayoutView' && (
          <ProjectLayoutEditPage spec={pageSpec} />
        )}
        {pageSpec.type === 'projectPresetView' && (
          <ProjectPresetEditPage spec={pageSpec} />
        )}
        {pageSpec.type === 'projectCustomFirmwareCreate' && (
          <ProjectCustomFirmwareCreatePage />
        )}
        {pageSpec.type === 'projectStandardFirmwareView' && (
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
      {pagePath === '/settings' && <SettingsPage />}
      {pagePath === '/projectSelection' && <ProjectSelectionPage />}
      {pagePath === '/projectReview' && <ProjectReviewPage />}
      {pagePath === '/home' && <WelcomePage />}
      {pagePath === '/projectResource' && <ProjectResourcePage />}
      {pagePath.startsWith('/profileSetup') && <ProfileSetupWizardPage />}
      {pagePath.startsWith('/projectQuickSetup') && <ProjectQuickSetupPage />}
      {pagePath.startsWith('/externalFirmwareProjectSetup') && (
        <ExternalFirmwareProjectSetupPage />
      )}
    </div>
  );
};
