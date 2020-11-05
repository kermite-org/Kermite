import { dumpXpcSubscriptionsRemained } from '~ui/core';
import { Views } from '~ui/views/ViewIndex';
import { models } from './models';
import { ViewModels } from './viewModels';

function start() {
  console.log('start');

  const viewModels = new ViewModels(models);
  const views = new Views(viewModels);
  models.initialize();
  viewModels.initialize();
  views.initialize();

  window.addEventListener('beforeunload', () => {
    views.finalize();
    viewModels.finalize();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
