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
import { AssignerPage } from '~/ui/pages/AssignerPage';
import { FirmwareFlashPage } from '~/ui/pages/FirmwareFlashPage';
import { FirmwareUpdatePage } from '~/ui/pages/FirmwareUpdatePage';
import { LayoutManagerPageComponent } from '~/ui/pages/LayoutEditorPage';
import { ProfileSetupWizardPage } from '~/ui/pages/ProfileSetupWizardPage';
import { ProjectReviewPage } from '~/ui/pages/ProjectReviewPage';
import { ShapePreviewPage } from '~/ui/pages/ShapePreviewPage';
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
    </div>
  );
};
