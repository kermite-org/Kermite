import { h } from '../basis/qx';
import { ConfiguratorSiteRoot } from './ConfiguratorSite/ConfiguratorSiteRoot';
import { glob, setPragma, css } from 'goober';
import { appUi } from '~ui2/models/appGlobal';
import { DebugOverlay } from '../basis/DebugOverlay';
import { ForegroundModalLayerRoot } from '../basis/ForegroundModalLayer';
import { siteModel } from '~ui2/models/zAppDomain';
import { WidgetSiteRoot } from './WidgetSite/WidgetSiteRoot';

setPragma(h);

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
  const cssSiteRoot = css`
    height: 100%;
  `;

  const { isWidgetMode } = siteModel;

  return (
    <div css={cssSiteRoot}>
      {/* {!isWidgetMode && <ConfiguratorSiteRoot />}
      {isWidgetMode && <WidgetSiteRoot />} */}
      {!isWidgetMode ? <ConfiguratorSiteRoot /> : <WidgetSiteRoot />}
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
