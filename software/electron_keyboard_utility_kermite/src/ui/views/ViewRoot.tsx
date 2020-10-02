import { h } from '~lib/qx';
import { ConfiguratorViewRoot } from './ConfiguratorView/ConfiguratorViewRoot';
import { glob, setup, css } from 'goober';
import { appUi } from '~ui/core';
import { DebugOverlay } from '~ui/views/base/DebugOverlay';
import { ForegroundModalLayerRoot } from '~ui/views/base/ForegroundModalLayer';
import { siteModel } from '~ui/models';
import { WidgetViewRoot } from './WidgetView/WidgetViewRoot';

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

export const ViewRoot = () => {
  const cssRoot = css`
    height: 100%;
  `;

  const { isWidgetMode } = siteModel;

  return (
    <div css={cssRoot}>
      {/* {!isWidgetMode && <ConfiguratorSiteRoot />}
      {isWidgetMode && <WidgetSiteRoot />} */}
      {!isWidgetMode ? <ConfiguratorViewRoot /> : <WidgetViewRoot />}
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={appUi.debugObject} />
    </div>
  );
};
