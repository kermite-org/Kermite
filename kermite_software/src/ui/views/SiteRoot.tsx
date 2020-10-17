import { glob, setup, css } from 'goober';
import { h } from '~lib/qx';
import { appUi } from '~ui/core';
import { siteModel } from '~ui/models';
import { DebugOverlay } from '~ui/views/base/layout/DebugOverlay';
import { ForegroundModalLayerRoot } from '~ui/views/base/layout/ForegroundModalLayer';
import { ConfiguratorZoneRoot } from './ConfiguratorZone/ConfiguratorZoneRoot';
import { WidgetZoneRoot } from './WidgetZone/WidgetZoneRoot';

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

export const SiteRoot = () => {
  const cssRoot = css`
    height: 100%;
  `;

  const { isWidgetMode } = siteModel;

  return (
    <div css={cssRoot}>
      {/* {!isWidgetMode && <ConfiguratorSiteRoot />}
      {isWidgetMode && <WidgetSiteRoot />} */}
      {!isWidgetMode ? <ConfiguratorZoneRoot /> : <WidgetZoneRoot />}
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
