import { appUi } from '@ui-common';
import { css, glob, setup } from 'goober';
import { h } from 'qx';
import { ConfiguratorZoneRoot } from '~/views/ConfiguratorZoneRoot';
import { DebugOverlay } from '~/views/overlay/DebugOverlay';
import { ForegroundModalLayerRoot } from '~/views/overlay/ForegroundModalLayer';

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
  return (
    <div css={cssSiteRoot}>
      <ConfiguratorZoneRoot />
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
