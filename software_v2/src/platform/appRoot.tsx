import { asyncRerender, jsx, render } from 'alumina';
import { appUi, copyObjectProps, debounce } from '~/app-shared';
import { diOnlineProjectImporter } from '~/feature-online-project-importer';
import { appStore } from './appStore';
import { deviceStore } from './deviceStore';
import { PageRoot } from './PageRoot';
import { setupRetainerAppPersistence } from './retainerAppPersistence';
import { setupRetainerEditItemLoader } from './retainerEditItemLoader';

function start() {
  appUi.rerender = asyncRerender;
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  setupRetainerAppPersistence();
  setupRetainerEditItemLoader();
  deviceStore.actions.restoreConnection();
  render(() => <PageRoot />, document.getElementById('app'));
  window.addEventListener('resize', debounce(appUi.rerender, 100));
}

window.addEventListener('load', start);
