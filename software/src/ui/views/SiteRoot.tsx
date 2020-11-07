import { glob, setup, css } from 'goober';
import { h } from '~lib/qx';
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

const cssSiteRoot = css`
  height: 100%;
`;

export const SiteRoot = (props: { viewModels: ViewModels }) => {
  const { isWidgetMode } = props.viewModels.models.siteModel;

  const ZoneRootComponent = isWidgetMode
    ? WidgetZoneRoot
    : ConfiguratorZoneRoot;

  return (
    <div css={cssSiteRoot}>
      <ZoneRootComponent viewModels={props.viewModels} />
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
