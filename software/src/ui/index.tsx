import { jsx, render } from 'qx';
import { debounce } from '~/shared';
import { resourceDevelopmentEntry } from '~/ui/ResourceDevelopment';
import { appUi } from '~/ui/base';
import { globalSettingsModel, uiStatusModel } from '~/ui/commonModels';
import { SiteRoot } from '~/ui/root/SiteRoot';

async function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiStatusModel.initialize();
  await globalSettingsModel.initialize();

  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
    globalSettingsModel.terminate();
  });
}

// window.addEventListener('load', start);
window.addEventListener('load', resourceDevelopmentEntry);
