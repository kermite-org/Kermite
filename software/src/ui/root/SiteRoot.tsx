import { jsx, applyGlobalStyle, css, useEffect, FC, useMemo } from 'alumina';
import { getSearchQueryObject } from '~/shared';
import { router, globalHintMouseMoveHandlerEffect, appUi } from '~/ui/base';
import { appErrorNotifierEffect } from '~/ui/commonModels';
import {
  DebugOverlay,
  ForegroundModalLayerRoot,
  SiteDpiScaler,
} from '~/ui/components';
import { WidgetZoneRoot } from '~/ui/pages/widgetPage';
import { ConfiguratorZoneRoot } from '~/ui/root/ConfiguratorZoneRoot';
import {
  commitUiState,
  lazyInitializeCoreServices,
  uiReaders,
  uiState,
  uiStateDriverEffect,
} from '~/ui/store';
import { EditorDemoPage } from '../pages/EditorDemoPage';

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

  input,
  textarea {
    font-family: 'Roboto', 'Kosugi', sans-serif;
  }

  body {
    overflow: hidden;
    user-select: none;
    touch-action: none;
  }

  select {
    outline: none;
  }

  button {
    cursor: pointer;
    outline: none;
  }

  h1,
  h2,
  h3 {
    font-size: 18px;
    font-weight: normal;
  }
`;
applyGlobalStyle(cssGlobal);

const cssSiteRoot = css`
  height: 100%;
`;

const AppView: FC = () => {
  const queries = useMemo(getSearchQueryObject, []);
  const isEditorDemoMode = !!queries.editor_demo;
  const isWidgetMode = uiReaders.pagePath === '/widget';
  if (isEditorDemoMode) {
    return <EditorDemoPage />;
  } else if (isWidgetMode) {
    return <WidgetZoneRoot />;
  } else {
    return <ConfiguratorZoneRoot />;
  }
};

const InitialLoadingView: FC = () => {
  useEffect(async () => {
    await lazyInitializeCoreServices();
    commitUiState({ initialLoading: false });
    appUi.rerender();
  }, []);
  return <div>Loading...</div>;
};

export const SiteRoot: FC = () => {
  // useEffect(router.rerenderEffectOnHashChange, []);
  useEffect(appErrorNotifierEffect, []);
  useEffect(globalHintMouseMoveHandlerEffect, []);
  useEffect(uiStateDriverEffect, []);
  router.useRedirect(['', '/'], '/home');

  return (
    <SiteDpiScaler dpiScale={uiState.settings.siteDpiScale}>
      <div class={cssSiteRoot}>
        {uiState.initialLoading ? <InitialLoadingView /> : <AppView />}
        <ForegroundModalLayerRoot />
        <DebugOverlay />
      </div>
    </SiteDpiScaler>
  );
};
