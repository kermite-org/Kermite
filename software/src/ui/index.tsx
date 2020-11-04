import { h, render, rerender as qxRerender } from '~lib/qx';
import { thinningListenerCall } from '~funcs/Utils';
import { dumpXpcSubscriptionsRemained, appUi } from '~ui/core';
import { models } from './models';
import { ViewModels } from './viewModels';
import { SiteRoot } from './views/SiteRoot';

function start() {
  console.log('start');

  models.initialize();
  const viewModels = new ViewModels(models);
  viewModels.initialize();

  appUi.rerender = qxRerender;

  const appDiv = document.getElementById('app');
  render(() => <SiteRoot viewModels={viewModels} />, appDiv);
  window.addEventListener('resize', thinningListenerCall(appUi.rerender, 100));

  window.addEventListener('beforeunload', () => {
    render(() => <div />, document.getElementById('app'));
    viewModels.finalize();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
