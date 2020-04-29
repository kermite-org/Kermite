import { appUi } from '~ui2/models/appGlobal';
import { hx, qx } from './basis/qx';
import { SiteRoot } from './root/SiteRoot';

export function initialzeView() {
  appUi.rerender = qx.rerender;
  qx.render(() => <SiteRoot />, document.getElementById('app')!);

  window.addEventListener('resize', appUi.rerender);
  setTimeout(appUi.rerender, 1);
  setTimeout(appUi.rerender, 2);

  function renderLoop() {
    if (appUi.reqRerender) {
      qx.rerender();
      appUi.reqRerender = false;
    }
    requestAnimationFrame(renderLoop);
  }
  renderLoop();
}
