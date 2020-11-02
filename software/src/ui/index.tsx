import { dumpXpcSubscriptionsRemained } from '~ui/core';
import { initialzeRenderer, finalizeRenderer } from './domSetup';
import { models } from './models';
import { viewModels } from './viewModels';

async function start() {
  console.log('start');

  models.initialize();
  viewModels.initialize();
  initialzeRenderer();

  window.addEventListener('beforeunload', async () => {
    finalizeRenderer();
    viewModels.finalize();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
