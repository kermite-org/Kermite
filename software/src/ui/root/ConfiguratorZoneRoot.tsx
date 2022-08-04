import { css, FC, jsx } from 'alumina';
import { colors } from '~/ui/base';
import { CustomWindowFrame, DevToolPullTab } from '~/ui/components';
import { LoadingOverlay } from '~/ui/components/overlay/LoadingOverlay';
import { SetupNavigationFrame } from '~/ui/features';
import {
  NavigationColumn,
  WindowStatusBarSection,
  WindowTitleBarSection,
} from '~/ui/root/sections';
import { MainColumnRoutes } from '~/ui/root/sections/MainColumnRoutes';
import { PageModals } from '~/ui/root/sections/PageModals';
import { siteModel, uiReaders, uiState } from '~/ui/store';

export const ConfiguratorZoneRoot: FC = () => {
  const showSetupNavigation = uiState.settings.showSetupNavigationPanel;
  return (
    <CustomWindowFrame
      renderTitleBar={WindowTitleBarSection}
      renderStatusBar={WindowStatusBarSection}
    >
      <div class={cssWindowContent}>
        <NavigationColumn
          disabled={uiReaders.blockerPageVisible}
          class="side-bar"
        />
        {showSetupNavigation ? (
          <SetupNavigationFrame>
            <MainColumnRoutes />
          </SetupNavigationFrame>
        ) : (
          <MainColumnRoutes class="main-column" />
        )}
        <PageModals />
        <LoadingOverlay isLoading={uiState.isLoading} />
        <DevToolPullTab if={false} handler={siteModel.toggleDevToolVisible} />
      </div>
    </CustomWindowFrame>
  );
};

const cssWindowContent = css`
  background: ${colors.clPageBackground};
  color: ${colors.clMainText};
  height: 100%;
  display: flex;

  > .side-bar {
    flex-shrink: 0;
  }

  > .main-column {
    flex-grow: 1;
  }
`;
