import { glob, setup, css } from 'goober';
import { h } from '~lib/qx';
// import { ForegroundModalLayerRoot } from '~ui/base/overlay/ForegroundModalLayer';
import { DebugOverlay } from '~ui/base/overlay/DebugOverlay';
import { appUi } from '~ui/core';
import { ViewModels } from '~ui/viewModels';
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

export const SiteRoot = (props: { viewModels: ViewModels }) => {
  const cssRoot = css`
    height: 100%;
  `;

  const { isWidgetMode } = props.viewModels.models.siteModel;

  return (
    <div css={cssRoot}>
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
