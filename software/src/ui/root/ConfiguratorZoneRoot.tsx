import { css, jsx } from 'qx';
import { appUi, router, uiTheme } from '~/ui/base';
import { siteModel, uiStatusModel } from '~/ui/commonModels';
import { CustomWindowFrame, DevToolPullTab } from '~/ui/components';
import { LoadingOverlay } from '~/ui/components/overlay/LoadingOverlay';
import { OnboadingFrame } from '~/ui/features/OnboardingPanel';
import { EditorPage } from '~/ui/pages/editor-page';
import { FirmwareUpdationPage } from '~/ui/pages/firmware-updation-page';
import { UiLayouterPageComponent } from '~/ui/pages/layouter-page';
import { PresetBrowserPage } from '~/ui/pages/preset-browser-page';
import { PresetBrowserPage2 } from '~/ui/pages/preset-browser-page2';
import { ProjectSelectionPage } from '~/ui/pages/project-selection-page';
import { UiSettingsPage } from '~/ui/pages/settings-page';
import { ShapePreviewPage } from '~/ui/pages/shape-preview-page';
import { WelcomePage } from '~/ui/pages/welcome-page';
import {
  NavigationColumn,
  WindowStatusBarSection,
  WindowTitleBarSection,
} from '~/ui/root/sections';

const MainColumnRoutes = () => {
  const pagePath = router.getPagePath();
  return (
    <div css={cssMainColumn}>
      {pagePath === '/editor' && <EditorPage />}
      {pagePath === '/layouter' && <UiLayouterPageComponent />}
      {pagePath === '/shapePreview' && <ShapePreviewPage />}
      {pagePath === '/firmwareUpdation' && <FirmwareUpdationPage />}
      {pagePath === '/presetBrowser' && <PresetBrowserPage />}
      {pagePath === '/presetBrowser2' && <PresetBrowserPage2 />}
      {pagePath === '/settings' && <UiSettingsPage />}
      {pagePath === '/projectSelection' && <ProjectSelectionPage />}
      {pagePath === '/home' && <WelcomePage />}
    </div>
  );
};

const cssMainColumn = css`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const ConfiguratorZoneRoot = () => {
  const showOnboarding = uiStatusModel.settings.showOnboardingPanel;
  return (
    <CustomWindowFrame
      renderTitleBar={WindowTitleBarSection}
      renderStatusBar={WindowStatusBarSection}
    >
      <div css={cssWindowContent}>
        <div className="main-row">
          <NavigationColumn />
          {showOnboarding ? (
            <OnboadingFrame>
              <MainColumnRoutes />
            </OnboadingFrame>
          ) : (
            <MainColumnRoutes />
          )}
          <LoadingOverlay isLoading={uiStatusModel.status.isLoading} />
          <DevToolPullTab
            qxIf={appUi.isDevelopment}
            handler={siteModel.toggleDevToolVisible}
          />
        </div>
      </div>
    </CustomWindowFrame>
  );
};

const cssWindowContent = css`
  background: ${uiTheme.colors.clPageBackground};
  color: ${uiTheme.colors.clMainText};
  display: flex;
  flex-direction: column;

  > .main-row {
    flex-grow: 1;
    display: flex;
  }
`;
