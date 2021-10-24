import {
  jsx,
  applyGlobalStyle,
  css,
  setShortCssProcessor,
  useEffect,
  FC,
} from 'qx';
import {
  router,
  shortCssProcessor,
  globalHintMouseMoveHandlerEffect,
  appUi,
} from '~/ui/base';
import { appErrorNotifierEffect } from '~/ui/commonModels';
import {
  DebugOverlay,
  ForegroundModalLayerRoot,
  SiteDpiScaler,
} from '~/ui/components';
import { WidgetZoneRoot } from '~/ui/pages/widget';
import { ConfiguratorZoneRoot } from '~/ui/root/ConfiguratorZoneRoot';
import {
  commitUiState,
  lazyInitializeCoreServices,
  uiReaders,
  uiState,
  uiStateDriverEffect,
} from '~/ui/store';

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
    user-select: none;
  }

  select {
    outline: none;
  }

  button {
    cursor: pointer;
    outline: none;
  }

  h1,
  h2 {
    font-size: 18px;
    font-weight: normal;
  }
`;
applyGlobalStyle(cssGlobal);

const cssSiteRoot = css`
  height: 100%;
`;

const AppView: FC = () => {
  const isWidgetMode = uiReaders.pagePath === '/widget';
  if (isWidgetMode) {
    return <WidgetZoneRoot />;
  } else {
    return <ConfiguratorZoneRoot />;
  }
};

const InitialLoadingView: FC = () => {
  useEffect(() => {
    (async () => {
      await lazyInitializeCoreServices();
      commitUiState({ initialLoading: false });
      appUi.rerender();
    })();
  }, []);
  return <div>Loading...</div>;
};

export const SiteRoot: FC = () => {
  useEffect(router.rerenderEffectOnHashChange, []);
  useEffect(appErrorNotifierEffect, []);
  useEffect(globalHintMouseMoveHandlerEffect, []);
  useEffect(uiStateDriverEffect, []);
  router.useRedirect(['', '/'], '/home');

  return (
    <SiteDpiScaler dpiScale={uiState.settings.siteDpiScale}>
      <div css={cssSiteRoot}>
        {uiState.initialLoading ? <InitialLoadingView /> : <AppView />}
        <ForegroundModalLayerRoot />
        <DebugOverlay />
      </div>
    </SiteDpiScaler>
  );
};
