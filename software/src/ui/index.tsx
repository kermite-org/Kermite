import { jsx, render } from 'qx';
import { debounce } from '~/shared';
import { appUi } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels';
import { commitUiState } from '~/ui/commonStore';
import { SiteRoot } from '~/ui/root/SiteRoot';

function start() {
  console.log('start');
  const appDiv = document.getElementById('app');

  uiStatusModel.initialize();

  commitUiState({ initialLoading: true });
  render(() => <SiteRoot />, appDiv);
  window.addEventListener('resize', debounce(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, appDiv);
    uiStatusModel.finalize();
  });
}

window.addEventListener('load', start);
