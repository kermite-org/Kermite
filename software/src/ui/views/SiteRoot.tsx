import { glob, setup, css } from 'goober';
import { h } from '~lib/qx';
import { DebugOverlay } from '~ui/base/layout/DebugOverlay';
import { ForegroundModalLayerRoot } from '~ui/base/layout/ForegroundModalLayer';
import { appUi } from '~ui/core';
import { ViewModels } from '~ui/viewModels';
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

export const SiteRoot = (props: { viewModels: ViewModels }) => {
  const cssRoot = css`
    height: 100%;
  `;

  const { isWidgetMode } = props.viewModels.models.siteModel;

  return (
    <div css={cssRoot}>
      {/* {!isWidgetMode && <ConfiguratorSiteRoot />}
      {isWidgetMode && <WidgetSiteRoot />} */}
      {!isWidgetMode ? (
        <ConfiguratorZoneRoot viewModels={props.viewModels} />
      ) : (
        <WidgetZoneRoot viewModels={props.viewModels} />
      )}
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
