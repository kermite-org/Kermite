import { jsx, render } from 'alumina';
import { copyObjectProps } from '~/app-shared';
import { diOnlineProjectImporter } from '~/feature-online-project-importer';
import { PageRoot } from './PageRoot';
import { appPersistence } from './appPersistence';
import { appStore } from './appStore';

function start() {
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  appPersistence.load();
  render(() => <PageRoot />, document.getElementById('app'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      appPersistence.save();
    }
  });
}

window.addEventListener('load', start);
