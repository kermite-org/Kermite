import { debounce } from '@shared';
import { appUi } from '@ui-common';
import { h, render } from 'qx';
import { SiteRoot } from '@ui-root/views/SiteRoot';
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
