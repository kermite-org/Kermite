import { jsx, render } from 'alumina';
import { debounce } from '~/shared';
import { appRoot } from '~/shell';
import { appConfig } from '~/shell/base';
import { logStorage } from '~/shell/base/logStorage';
import { appUi } from '~/ui/base';
import { SiteRoot } from '~/ui/root/SiteRoot';
import { commitUiState, uiSettingsPersistence } from '~/ui/store';

function start() {
  console.log(`kermite_webapp ${appConfig.applicationVersion}`);
  logStorage.show();
  appRoot.initialize();
  const appDiv = document.getElementById('app');

  uiSettingsPersistence.initialize();

  commitUiState({ initialLoading: true });
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  const beforeUnloadHandler = () => {
    render(() => <div />, appDiv);
    if (appUi.skipPageTerminationTasks) {
      return;
    }
    uiSettingsPersistence.finalize();
    appRoot.terminate();
    logStorage.write(`beforeUnload handler completed`);
  };

  window.addEventListener('beforeunload', beforeUnloadHandler);
}

window.addEventListener('load', start);
