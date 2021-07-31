import {
  jsx,
  applyGlobalStyle,
  css,
  setShortCssProcessor,
  useEffect,
} from 'qx';
import {
  router,
  shortCssProcessor,
  globalHintMouseMoveHandlerEffect,
} from '~/ui/base';
import {
  siteModel,
  uiStatusModel,
  globalAppServicesInitializerEffect,
  useGlobalSettingsModelUpdator,
} from '~/ui/commonModels';
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

export const SiteRoot = () => {
  useEffect(router.rerenderEffectOnHashChange, []);
  useEffect(globalAppServicesInitializerEffect, []);
  useEffect(siteModel.setupLifecycle, []);
  useEffect(globalHintMouseMoveHandlerEffect, []);
  useGlobalSettingsModelUpdator();

  router.useRedirect(['', '/'], '/home');

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
