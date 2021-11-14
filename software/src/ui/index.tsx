import { jsx, render } from 'alumina';
import { debounce } from '~/shared';
import { appUi } from '~/ui/base';
import { SiteRoot } from '~/ui/root/SiteRoot';
import { uiSettingsPersistence, commitUiState } from '~/ui/store';

function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiSettingsPersistence.initialize();

  commitUiState({ initialLoading: true });
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiSettingsPersistence.finalize();
  });
}

window.addEventListener('load', start);
