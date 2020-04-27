import { qx, hx } from './basis/qx';
import { PageContentRoot } from './root/PageContentRoot';
import { glob, setPragma, css } from 'goober';
import { app } from '~ui2/models/appGlobal';
import { DebugOverlay } from './basis/DebugOverlay';
import { ForegroundModalLayerRoot } from './basis/ForegroundModalLayer';
import { SiteRootD } from './dev0';

setPragma(hx);

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

const SiteRoot = () => {
  const cssSiteRoot = css`
    height: 100%;
  `;
  return (
    <div css={cssSiteRoot}>
      <PageContentRoot />
      <ForegroundModalLayerRoot />
      <DebugOverlay debugObj={app.debugObject} />
    </div>
  );
};

export function initialzeView() {
  app.rerender = qx.rerender;
  qx.render(() => <SiteRoot />, document.getElementById('app')!);

  window.addEventListener('resize', app.rerender);
  setTimeout(app.rerender, 1);
  setTimeout(app.rerender, 2);

  function renderLoop() {
    if (app.reqRerender) {
      qx.rerender();
      app.reqRerender = false;
    }
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}
