import { jsx, render } from 'qx';
import { debounce } from '~/shared';
import { appUi, uiStatusModel } from '~/ui/common';
import { SiteRoot } from '~/ui/root/views/SiteRoot';

function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiStatusModel.initialize();
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
  });
}

window.addEventListener('load', start);
