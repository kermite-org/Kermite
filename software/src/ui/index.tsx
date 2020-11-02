import { dumpXpcSubscriptionsRemained } from '~ui/core';
import { initialzeRenderer, finalizeRenderer } from './domSetup';
import { models } from './models';
import { ViewModels } from './viewModels';

async function start() {
  console.log('start');

  models.initialize();
  const viewModels = new ViewModels(models);
  viewModels.initialize();
  initialzeRenderer(viewModels);

  window.addEventListener('beforeunload', async () => {
    finalizeRenderer();
    viewModels.finalize();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
