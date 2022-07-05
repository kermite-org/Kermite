import { jsx, render } from 'alumina';
import { debounce } from '~/shared';
import { appRoot } from '~/shell';
import { appConfig } from '~/shell/base';
import { appUi } from '~/ui/base';
import { SiteRoot } from '~/ui/root/SiteRoot';
import { commitUiState, uiSettingsPersistence } from '~/ui/store';

function start() {
  console.log(`kermite_web ${appConfig.applicationVersion}`);
  appRoot.initialize();
  const appDiv = document.getElementById('app');

  uiSettingsPersistence.initialize();

  commitUiState({ initialLoading: true });
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  const unloadHandler = () => {
    render(() => <div />, appDiv);
    if (appUi.skipPageTerminationTasks) {
      return;
    }
    uiSettingsPersistence.finalize();
    appRoot.terminate();
  };

  if (window.parent) {
    window.addEventListener('unload', unloadHandler);
  } else {
    window.addEventListener('beforeunload', unloadHandler);
  }
}

window.addEventListener('load', start);
