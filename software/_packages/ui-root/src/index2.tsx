import { debounce } from '@kermite/shared';
import { appUi } from '@kermite/ui';
import { h, render } from 'qx';
import { models } from '~/models';
import { SiteRoot } from '~/views/SiteRoot';

function initializeView() {
  render(() => <SiteRoot />, document.getElementById('app'));
  window.addEventListener('resize', debounce(appUi.rerender, 100));
  appUi.startAsyncRenderLoop();
}

function finalizeView() {
  render(() => <div />, document.getElementById('app'));
}

async function start() {
  console.log('start');

  await models.initialize();
  initializeView();

  window.addEventListener('beforeunload', () => {
    finalizeView();
    models.finalize();
  });
}

window.addEventListener('load', start);
