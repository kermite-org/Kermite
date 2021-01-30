import { h, render } from 'qx';
import { debounce } from '~/shared';
import { appUi } from '~/ui-common';
import { projectResourceModel } from '~/ui-common/sharedModels/ProjectResourceModel';
import { uiStatusModel } from '~/ui-common/sharedModels/UiStatusModel';
import { SiteRoot } from '~/ui-root/SiteRoot';

async function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  await projectResourceModel.initializeAsync();
  uiStatusModel.initialize();
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
  });
}

window.addEventListener('load', start);
