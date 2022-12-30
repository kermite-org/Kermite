import { jsx, render } from 'alumina';
import { copyObjectProps } from '~/app-shared';
import { diOnlineProjectImporter } from '~/feature-online-project-importer';
import { PageRoot } from './PageRoot';
import { appStore } from './appStore';

function start() {
  const { actions } = appStore;
  copyObjectProps(diOnlineProjectImporter, {
    saveProject: actions.loadProject,
    close: actions.closeModal,
  });
  render(() => <PageRoot />, document.getElementById('app'));
}

window.addEventListener('load', start);