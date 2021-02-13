import { css, glob, setup } from 'goober';
import { h, Hook } from 'qx';
import { router } from '~/ui-common';
import { globalHintMouseMoveHandlerEffect } from '~/ui-common/base/GlobalHint';
import { DebugOverlay } from '~/ui-common/fundamental/overlay/DebugOverlay';
import { ForegroundModalLayerRoot } from '~/ui-common/fundamental/overlay/ForegroundModalLayer';
import { siteModel } from '~/ui-common/sharedModels/SiteModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { SiteDpiScaler } from '~/ui-root/views/window/SiteDpiScaler';
import { WidgetZoneRoot } from '~/ui-widget';
import { ConfiguratorZoneRoot } from './ConfiguratorZoneRoot';

setup(h);

glob`
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
    font-family: 'Roboto', sans-serif;
  }

  body {
    overflow: hidden;
  }
`;

const cssSiteRoot = css`
  height: 100%;
`;

export const SiteRoot = () => {
  Hook.useEffect(router.rerenderEffectOnHashChange, []);
  Hook.useEffect(siteModel.setupLifecycle, []);
  Hook.useEffect(globalHintMouseMoveHandlerEffect, []);
  router.useRedirect(['', '/'], '/editor');

  const isWidgetMode = router.getPagePath() === '/widget';
  return (
    <SiteDpiScaler dpiScale={uiStatusModel.settings.siteDpiScale}>
      <div css={cssSiteRoot}>
        {!isWidgetMode && <ConfiguratorZoneRoot />}
        {isWidgetMode && <WidgetZoneRoot />}
        <ForegroundModalLayerRoot />
        <DebugOverlay />
      </div>
    </SiteDpiScaler>
  );
};
