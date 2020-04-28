import { jsx } from '@emotion/core';
import React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider, useSelector } from 'react-redux';
import './fontAwesomeSetup';
import { ForegroundModalLayerRoot } from './foregroundModalLayer';
import { saveDirtyEditModelOnClosing } from './resourceHooks';
import { debugTrace, sendWindowManagerCommand } from './state/ipc';
import { AppState, store } from './state/store';
import { ConfiguratorContentRoot } from './view/ConfiguratorSite';
import { WidgetContentRoot } from './view/WidgetSite';

function PageRoot() {
  // const isWidget = location.search.includes('widget')
  const isWidgetMode = useSelector(
    (state: AppState) => state.site.isWidgetMode
  );

  React.useEffect(() => {
    sendWindowManagerCommand({ widgetModeChanged: { isWidgetMode } });
  }, [isWidgetMode]);

  const Content = isWidgetMode ? WidgetContentRoot : ConfiguratorContentRoot;

  return (
    <React.Fragment>
      <Content />
      <ForegroundModalLayerRoot />
    </React.Fragment>
  );
}

function start() {
  debugTrace('renderer start');

  const appDiv = document.getElementById('app');
  if (appDiv) {
    ReactDOM.render(
      <Provider store={store}>
        <PageRoot />
      </Provider>,
      appDiv
    );
    window.addEventListener('beforeunload', () => {
      debugTrace('renderer beforeunload');
      saveDirtyEditModelOnClosing();
      ReactDOM.unmountComponentAtNode(appDiv);
    });
  }
}

window.addEventListener('load', start);
