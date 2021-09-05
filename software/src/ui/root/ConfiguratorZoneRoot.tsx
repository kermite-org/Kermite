import { css, FC, jsx } from 'qx';
import { appUi, uiTheme } from '~/ui/base';
import { siteModel, uiState } from '~/ui/commonStore';
import { CustomWindowFrame, DevToolPullTab } from '~/ui/components';
import { LoadingOverlay } from '~/ui/components/overlay/LoadingOverlay';
import { OnboardingFrame } from '~/ui/features';
import { MainColumnRoutes } from '~/ui/root/MainCoulmnRoutes';
import {
  NavigationColumn,
  WindowStatusBarSection,
  WindowTitleBarSection,
} from '~/ui/root/sections';

export const ConfiguratorZoneRoot: FC = () => {
  const showOnboarding = uiState.settings.showOnboardingPanel;
  return (
    <CustomWindowFrame
      renderTitleBar={WindowTitleBarSection}
      renderStatusBar={WindowStatusBarSection}
    >
      <div css={cssWindowContent}>
        <div className="main-row">
          <NavigationColumn />
          {showOnboarding ? (
            <OnboardingFrame>
              <MainColumnRoutes />
            </OnboardingFrame>
          ) : (
            <MainColumnRoutes />
          )}
          <LoadingOverlay isLoading={uiState.isLoading} />
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
