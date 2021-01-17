import { appUi } from '~/ui-common';
import { css, glob, setup } from 'goober';
import { h } from 'qx';
import { DebugOverlay } from '~/ui-root/base/overlay/DebugOverlay';
import { models } from '~/ui-root/models';
import { ForegroundModalLayerRoot } from '../base/overlay/ForegroundModalLayer';
import { ConfiguratorZoneRoot } from './zones/ConfiguratorZoneRoot';
import { WidgetZoneRoot } from './zones/WidgetZoneRoot';

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
  const { isWidgetMode } = models.siteModel;

  const ZoneRootComponent = isWidgetMode
    ? WidgetZoneRoot
    : ConfiguratorZoneRoot;

  return (
    <div css={cssSiteRoot}>
      <ZoneRootComponent />
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
