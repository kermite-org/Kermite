import { debounce } from '@kermite/shared';
import { appUi } from '@kermite/ui';
import { h, render } from 'qx';
import { SiteRoot } from '~/views/SiteRoot';
import { models } from './models';

async function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  await models.initialize();
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    models.finalize();
  });
}

window.addEventListener('load', start);
