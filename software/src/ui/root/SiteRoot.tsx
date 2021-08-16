import {
  jsx,
  applyGlobalStyle,
  css,
  setShortCssProcessor,
  useEffect,
  FC,
} from 'qx';
import { delayMs } from '~/shared';
import {
  router,
  shortCssProcessor,
  globalHintMouseMoveHandlerEffect,
  appUi,
} from '~/ui/base';
import {
  siteModel,
  uiStatusModel,
  globalAppServicesInitializerEffect,
} from '~/ui/commonModels';
import { commitUiState, uiState, uiStateDriverEffect } from '~/ui/commonStore';
import {
  DebugOverlay,
  ForegroundModalLayerRoot,
  SiteDpiScaler,
} from '~/ui/components';
import { WidgetZoneRoot } from '~/ui/pages/widget';
import { ConfiguratorZoneRoot } from '~/ui/root/ConfiguratorZoneRoot';

setShortCssProcessor(shortCssProcessor);

const cssGlobal = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    height: 100%;
  }

  #app {
    font-family: 'Roboto', 'Kosugi', sans-serif;
  }

  body {
    overflow: hidden;
  }

  select {
    outline: none;
  }
`;
applyGlobalStyle(cssGlobal);

const cssSiteRoot = css`
  height: 100%;
`;

const AppView: FC = () => {
  const isWidgetMode = router.getPagePath() === '/widget';
  if (isWidgetMode) {
    return <WidgetZoneRoot />;
  } else {
    return <ConfiguratorZoneRoot />;
  }
};

const InitialLoadingView: FC = () => {
  useEffect(() => {
    delayMs(2000).then(() => {
      commitUiState({ initialLoading: false });
      appUi.rerender();
    });
  }, []);
  return <div>Loading...</div>;
};

export const SiteRoot: FC = () => {
  useEffect(router.rerenderEffectOnHashChange, []);
  useEffect(globalAppServicesInitializerEffect, []);
  useEffect(siteModel.setupLifecycle, []);
  useEffect(globalHintMouseMoveHandlerEffect, []);
  useEffect(uiStateDriverEffect, []);
  router.useRedirect(['', '/'], '/home');

  return (
    <SiteDpiScaler dpiScale={uiStatusModel.settings.siteDpiScale}>
      <div css={cssSiteRoot}>
        {uiState.initialLoading ? <InitialLoadingView /> : <AppView />}
        <ForegroundModalLayerRoot />
        <DebugOverlay />
      </div>
    </SiteDpiScaler>
  );
};
