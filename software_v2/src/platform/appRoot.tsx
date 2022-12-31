import { asyncRerender, jsx, render } from 'alumina';
import { appUi, copyObjectProps } from '~/app-shared';
import { diOnlineProjectImporter } from '~/feature-online-project-importer';
import { PageRoot } from './PageRoot';
import { appStore } from './appStore';
import { deviceStore } from './deviceStore';
import { setupRetainerAppPersistence } from './retainerAppPersistence';
import { setupRetainerEditItemLoader } from './retainerEditItemLoader';

function start() {
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  setupRetainerAppPersistence();
  setupRetainerEditItemLoader();
  deviceStore.actions.restoreConnection();
  appUi.rerender = asyncRerender;
  render(() => <PageRoot />, document.getElementById('app'));
}

window.addEventListener('load', start);
