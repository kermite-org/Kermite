import { jsx, render } from 'qx';
import { debounce } from '~/shared';
import { appUi } from '~/ui/base';
import { globalSettingsModel, uiStatusModel } from '~/ui/commonModels';
import { SiteRoot } from '~/ui/root/SiteRoot';

async function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiStatusModel.initialize();
  await globalSettingsModel.loadInitialGlobalSettings();

  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
  });
}

window.addEventListener('load', start);
