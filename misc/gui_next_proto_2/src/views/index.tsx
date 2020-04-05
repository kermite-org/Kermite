import { qx, hx } from './basis/qx';
import { PageContentRoot } from './root/PageContentRoot';
import { glob, setPragma, css } from 'goober';
import { app } from '~models/core/appGlobal';
import { DebugOverlay } from './basis/DebugOverlay';
import { ForegroundModalLayerRoot } from './basis/ForegroundModalLayer';

setPragma(hx);

glob`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  @import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

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
  console.log(`render`);
  // appModel.debugObject = { foo: 100, bar: 200 };
  return (
    <div css={cssSiteRoot}>
      <PageContentRoot />
      <DebugOverlay debugObj={app.debugObject} />
      <ForegroundModalLayerRoot />
    </div>
  );
};

export function initialzeView() {
  app.rerender = qx.rerender;
  qx.render(() => <SiteRoot />, document.getElementById('app')!);

  window.addEventListener('resize', app.rerender);
  setTimeout(app.rerender, 1);
  setTimeout(app.rerender, 2);
}
