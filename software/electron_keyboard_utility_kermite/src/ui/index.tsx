import { models } from './models';
import { initialzeRenderer, finalizeRenderer } from './domSetup';
import { dumpXpcSubscriptionsRemained } from '~ui/core';

async function start() {
  console.log('start');

  models.initialize();
  initialzeRenderer();

  window.addEventListener('beforeunload', async () => {
    finalizeRenderer();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
