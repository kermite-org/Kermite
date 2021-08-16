import { jsx, render } from 'qx';
import { debounce } from '~/shared';
import { resourceDevelopmentEntry } from '~/ui/ResourceDevelopment';
import { appUi, ipcAgent } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { commitUiState, uiState } from '~/ui/commonStore';
import { SiteRoot } from '~/ui/root/SiteRoot';

async function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiStatusModel.initialize();
  uiState.core.globalSettings = await ipcAgent.async.config_getGlobalSettings();
  uiState.core.allProjectPackageInfos = await ipcAgent.async.projects_getAllProjectPackageInfos();
  uiState.core.allCustomFirmwareInfos = await ipcAgent.async.projects_getAllCustomFirmwareInfos();

  commitUiState({ initialLoading: true });
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
  });
}

window.addEventListener('load', start);
window.addEventListener('load', resourceDevelopmentEntry);
